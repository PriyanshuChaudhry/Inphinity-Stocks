import React from "react";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import "./AnalyticsModal.css";

const AnalyticsModal = ({ stock, recommendation, onClose }) => {
  if (!recommendation) return null;

  const { recommendation: signal, confidence, probabilities } = recommendation;

 
  const getSignalStyle = () => {
    switch (signal) {
      case "BUY":
        return {
          color: "#00C853",
          icon: <TrendingUp size={32} />,
          bgColor: "rgba(0, 200, 83, 0.1)",
          borderColor: "#00C853",
        };
      case "SELL":
        return {
          color: "#FF1744",
          icon: <TrendingDown size={32} />,
          bgColor: "rgba(255, 23, 68, 0.1)",
          borderColor: "#FF1744",
        };
      case "HOLD":
        return {
          color: "#FFA726",
          icon: <Minus size={32} />,
          bgColor: "rgba(255, 167, 38, 0.1)",
          borderColor: "#FFA726",
        };
      default:
        return {
          color: "#666",
          icon: null,
          bgColor: "rgba(102, 102, 102, 0.1)",
          borderColor: "#666",
        };
    }
  };

  const style = getSignalStyle();

  // Get confidence level description
  const getConfidenceLevel = (conf) => {
    if (conf >= 80) return "Very High";
    if (conf >= 70) return "High";
    if (conf >= 60) return "Moderate";
    return "Low";
  };

  return (
    <div className="analytics-overlay" onClick={onClose}>
      <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2>{stock}</h2>
            <span className="ml-badge">ML Powered</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Main Recommendation */}
        <div
          className="recommendation-card"
          style={{
            backgroundColor: style.bgColor,
            borderLeft: `4px solid ${style.borderColor}`,
          }}
        >
          <div className="recommendation-icon" style={{ color: style.color }}>
            {style.icon}
          </div>
          <div className="recommendation-details">
            <h1 className="signal" style={{ color: style.color }}>
              {signal}
            </h1>
            <p className="confidence-text">
              {getConfidenceLevel(confidence)} Confidence
            </p>
            <div className="confidence-bar-container">
              <div
                className="confidence-bar"
                style={{
                  width: `${confidence}%`,
                  backgroundColor: style.color,
                }}
              />
            </div>
            <p className="confidence-percent">{confidence.toFixed(1)}%</p>
          </div>
        </div>

        {/* Probability Breakdown */}
        <div className="probabilities-section">
          <h3>Probability Breakdown</h3>
          <div className="probability-bars">
            <div className="probability-item">
              <div className="prob-header">
                <span className="prob-label buy-label">BUY</span>
                <span className="prob-value">{probabilities.BUY.toFixed(1)}%</span>
              </div>
              <div className="prob-bar-container">
                <div
                  className="prob-bar buy-bar"
                  style={{ width: `${probabilities.BUY}%` }}
                />
              </div>
            </div>

            <div className="probability-item">
              <div className="prob-header">
                <span className="prob-label hold-label">HOLD</span>
                <span className="prob-value">{probabilities.HOLD.toFixed(1)}%</span>
              </div>
              <div className="prob-bar-container">
                <div
                  className="prob-bar hold-bar"
                  style={{ width: `${probabilities.HOLD}%` }}
                />
              </div>
            </div>

            <div className="probability-item">
              <div className="prob-header">
                <span className="prob-label sell-label">SELL</span>
                <span className="prob-value">{probabilities.SELL.toFixed(1)}%</span>
              </div>
              <div className="prob-bar-container">
                <div
                  className="prob-bar sell-bar"
                  style={{ width: `${probabilities.SELL}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <p className="info-text">
            <strong>Note:</strong> This recommendation is generated using Random Forest
            ML model analyzing fundamental indicators (PE Ratio, EPS, ROE,
            Debt-to-Equity). Model accuracy: 63.89%.
          </p>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="action-btn secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="action-btn primary"
            style={{ backgroundColor: style.color }}
            onClick={onClose}
          >
            {signal === "BUY" && "Proceed to Buy"}
            {signal === "SELL" && "Proceed to Sell"}
            {signal === "HOLD" && "Keep Watching"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
