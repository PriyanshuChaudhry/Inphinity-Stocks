import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

const Summary = () => {
  const [holdings, setHoldings] = useState([]);
  const [positions, setPositions] = useState([]);

  const fetchAll = () => {
    Promise.all([
      axios.get(`${API_BASE_URL}/allHoldings`),
      axios.get(`${API_BASE_URL}/allPositions`),
    ]).then(([h, p]) => {
      setHoldings(h.data || []);
      setPositions(p.data || []);
    });
  };

  useEffect(() => {
    fetchAll();

    const es = new EventSource(`${API_BASE_URL}/events`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg && msg.type === "data-updated") {
          fetchAll();
        }
      } catch (_) {}
    };

    return () => es.close();
  }, []);

  const { currentValue, investment } = useMemo(() => {
    const currentValue = holdings.reduce((acc, s) => acc + Number(s.price) * Number(s.qty), 0);
    const investment = holdings.reduce((acc, s) => acc + Number(s.avg) * Number(s.qty), 0);
    return { currentValue, investment };
  }, [holdings]);

  const pnl = currentValue - investment;
  const pnlPct = investment > 0 ? (pnl / investment) * 100 : 0;

  return (
    <>
      <div className="username">
        <h6>Hi, User!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{(currentValue / 1000).toFixed(2)}k</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>0</span>{" "}
            </p>
            <p>
              Opening balance <span>{(currentValue / 1000).toFixed(2)}k</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdings.length})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={pnl >= 0 ? "profit" : "loss"}>
              {(Math.abs(pnl) / 1000).toFixed(2)}k <small>{pnl >= 0 ? "+" : "-"}{Math.abs(pnlPct).toFixed(2)}%</small>{" "}
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>{(currentValue / 1000).toFixed(2)}k</span>{" "}
            </p>
            <p>
              Investment <span>{(investment / 1000).toFixed(2)}k</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;
