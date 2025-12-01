import React, { useState, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";
import { watchlist } from "../data/data";
import { DoughnutChart } from "./DoughnoutChart";
import AnalyticsModal from "./AnalyticsModal";

const labels = watchlist.map((subArray) => subArray["name"]);

const WatchList = () => {
  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: watchlist.map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />
        <span className="counts"> {watchlist.length} / 50</span>
      </div>

      <ul className="list">
        {watchlist.map((stock, index) => {
          return <WatchListItem stock={stock} key={index} />;
        })}
      </ul>

      <DoughnutChart data={data} />
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = (e) => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = (e) => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="down" />
          )}
          <span className="price">{stock.price}</span>
        </div>
      </div>
      {showWatchlistActions && <WatchListActions uid={stock.name} />}
    </li>
  );
};

const WatchListActions = ({ uid }) => {
  const generalContext = useContext(GeneralContext);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid, "BUY");
  };

  const handleSellClick = () => {
    generalContext.openBuyWindow(uid, "SELL");
  };

  const handleAnalyticsClick = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch recommendation from backend
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3002';
const response = await axios.get(
  `${backendUrl}/api/recommendations/${uid}`
);


      if (response.data.success) {
        setRecommendation(response.data.data);
        setShowAnalytics(true);
      } else {
        setError("Failed to fetch recommendation");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.response?.data?.message || "Failed to fetch recommendation");
      alert(`Analytics Error: ${err.response?.data?.message || "Failed to fetch recommendation"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAnalytics = () => {
    setShowAnalytics(false);
    setRecommendation(null);
  };

  return (
    <>
      <span className="actions">
        <span>
          <Tooltip
            title="Buy (B)"
            placement="top"
            arrow
            slots={{ transition: Grow }}
            onClick={handleBuyClick}
          >
            <button className="buy">Buy</button>
          </Tooltip>
          <Tooltip
            title="Sell (S)"
            placement="top"
            arrow
            slots={{ transition: Grow }}
            onClick={handleSellClick}
          >
            <button className="sell">Sell</button>
          </Tooltip>
          <Tooltip
            title={loading ? "Loading..." : "Analytics (A)"}
            placement="top"
            arrow
            slots={{ transition: Grow }}
          >
            <button
              className="action"
              onClick={handleAnalyticsClick}
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <BarChartOutlined className="icon" />
            </button>
          </Tooltip>
          <Tooltip title="More" placement="top" arrow slots={{ transition: Grow }}>
            <button className="action">
              <MoreHoriz className="icon" />
            </button>
          </Tooltip>
        </span>
      </span>

      {/* Analytics Modal */}
      {showAnalytics && recommendation && (
        <AnalyticsModal
          stock={uid}
          recommendation={recommendation}
          onClose={handleCloseAnalytics}
        />
      )}
    </>
  );
};
