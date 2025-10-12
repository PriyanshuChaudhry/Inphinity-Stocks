import React, { useState, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import API_BASE_URL from "../config/api";
import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid, mode = "BUY" }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [error, setError] = useState("");
  const { closeBuyWindow } = useContext(GeneralContext);

  const handleSubmitClick = async () => {
    setError("");
    
    // Validation
    if (!stockQuantity || stockQuantity <= 0) {
      setError("Please enter valid quantity");
      return;
    }
    if (!stockPrice || stockPrice <= 0) {
      setError("Please enter valid price");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/newOrder`, {
        name: uid,
        qty: Number(stockQuantity),
        price: Number(stockPrice),
        mode: mode,
      });
      
      if (response.data.success) {
        closeBuyWindow();
      }
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.error || "Failed to place order";
      setError(errorMsg);
    }
  };

  const handleCancelClick = () => {
    closeBuyWindow(); 
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitClick();
    }
  };

  return (
    <div className="container" id="buy-window">
      {/* Header */}
      <div className="header">
        <h3>
          {uid} <span>NSE</span>
        </h3>
        <div className="market-options">
          <span>{mode === "BUY" ? "Buy" : "Sell"}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              onChange={(e) => setStockQuantity(e.target.value)}
              onKeyPress={handleKeyPress}
              value={stockQuantity}
              autoFocus
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              min="0"
              onChange={(e) => setStockPrice(e.target.value)}
              onKeyPress={handleKeyPress}
              value={stockPrice}
            />
          </fieldset>
        </div>

        {error && (
          <div style={{ 
            color: '#eb4d4b', 
            padding: '10px 0', 
            fontSize: '0.85rem',
            textAlign: 'center',
            backgroundColor: '#ffe5e5',
            borderRadius: '4px',
            margin: '10px 0'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="buttons">
        <span>Margin required: ₹{(stockQuantity * stockPrice).toFixed(2)}</span>
        <div>
          <button 
            className="btn btn-blue" 
            onClick={handleSubmitClick}
            style={{ border: 'none', cursor: 'pointer' }}
          >
            {mode === "SELL" ? "Sell" : "Buy"}
          </button>
          <button 
            className="btn btn-grey" 
            onClick={handleCancelClick}
            style={{ border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
