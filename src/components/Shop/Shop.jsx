import React, { useEffect, useState } from "react";
import {
  addToDb,
  deleteShoppingCart,
  getShoppingCart,
} from "../../utilities/fakedb";
import Cart from "../Cart/Cart";
import Product from "../Product/Product";
import "./Shop.css";
import { Link } from "react-router-dom";
import { useLoaderData } from "react-router-dom";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10); // This state variable controls how many products are shown per page, initially set to 10 items

  const [currentPage, setCurrentPage] = useState(0);
  const [cart, setCart] = useState([]);

  const { count } = useLoaderData();

  const numberOfPages = Math.ceil(count / itemsPerPage);

  /* const pageNumbers = []; 
    for (let i = 0; i < numberOfPages; i++) {
        pageNumbers.push(i);
    }
    console.log(pageNumbers); */

  //short way to create page numbers
  const pageNumbers = [...Array(numberOfPages).keys()];
  console.log(pageNumbers);

  /* 
    1. to do 1: get the total count of products
    2. to do 2: numbers of items in per page
    3. to do 3: add products to the state   
    */

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  useEffect(() => {
    const storedCart = getShoppingCart();
    const savedCart = [];
    // step 1: get id of the addedProduct
    for (const id in storedCart) {
      // step 2: get product from products state by using id
      const addedProduct = products.find((product) => product._id === id);
      if (addedProduct) {
        // step 3: add quantity
        const quantity = storedCart[id];
        addedProduct.quantity = quantity;
        // step 4: add the added product to the saved cart
        savedCart.push(addedProduct);
      }
      // console.log('added Product', addedProduct)
    }
    // step 5: set the cart
    setCart(savedCart);
  }, [products]);

  // This function handles changes to the items per page dropdown
  // It takes the event object from the dropdown change
  // Converts the selected value to a number and updates the itemsPerPage state
  const handleItemsPerPage = (e) => {
    const val = parseInt(e.target.value); // Convert string value to integer
    console.log(e.target.value); // Log the raw value from dropdown
    setItemsPerPage(val); // Update state with new items per page count
    setCurrentPage(0); // Reset to first page when items per page changes
  };

  const handleAddToCart = (product) => {
    // cart.push(product); '
    let newCart = [];
    // const newCart = [...cart, product];
    // if product doesn't exist in the cart, then set quantity = 1
    // if exist update quantity by 1
    const exists = cart.find((pd) => pd._id === product._id);
    if (!exists) {
      product.quantity = 1;
      newCart = [...cart, product];
    } else {
      exists.quantity = exists.quantity + 1;
      const remaining = cart.filter((pd) => pd._id !== product._id);
      newCart = [...remaining, exists];
    }

    setCart(newCart);
    addToDb(product._id);
  };

  const handleClearCart = () => {
    setCart([]);
    deleteShoppingCart();
    };

  // Handles clicking the "previous" pagination button
  // Decrements currentPage if not already at first page (page 0)
  const handlePrevious = () => {
    if(currentPage > 0){
      setCurrentPage(currentPage - 1);
    }
  };

  // Handles clicking the "next" pagination button
  // Increments currentPage if not already at last page (numberOfPages - 1)
  const handleNext = () => {
    if(currentPage < numberOfPages - 1){        
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="shop-container">
      <div className="products-container">
        {products.map((product) => (
          <Product
            key={product._id}
            product={product}
            handleAddToCart={handleAddToCart}
          ></Product>
        ))}
      </div>
      <div className="cart-container">
        <Cart cart={cart} handleClearCart={handleClearCart}>
          <Link className="proceed-link" to="/orders">
            <button className="btn-proceed">Review Order</button>
          </Link>
        </Cart>
      </div>
      <div className="pagination">
        <p>Current Page: {currentPage}</p>
        {/* Maps over pageNumbers array to create numbered pagination buttons */}
        <button onClick={handlePrevious}>previous</button>
        {pageNumbers.map((page) => (
          <button 
            onClick={() => setCurrentPage(page)}            
            key={page}
            className={currentPage === page ? "selected" : null}
          >
            {page}
          </button>
        ))}
        <button onClick={handleNext}>next</button>
        {/* Dropdown to select number of items to display per page */}
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPage}
          name=""
          id=""
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  );
};

export default Shop;
