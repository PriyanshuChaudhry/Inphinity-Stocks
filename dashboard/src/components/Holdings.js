import React, { useState, useEffect, useMemo } from "react";
import axios, { all } from "axios";
import { VerticalGraph } from "./VerticalGraph";
import API_BASE_URL from "../config/api";


const Holdings = () => {

  const [allHoldings, setAllHoldings] = useState([]);

  const fetchHoldings = () => {
    axios.get(`${API_BASE_URL}/allHoldings`).then((res) => {
      
      setAllHoldings(res.data);
    });
  };

  useEffect(() => {
    fetchHoldings();

    const es = new EventSource(`${API_BASE_URL}/events`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg && msg.type === "data-updated") {
          fetchHoldings();
        }
      } catch (_) {}
    };

    return () => es.close();
  }, []);

  
  const labels = allHoldings.map((subArray) => subArray["name"]);

  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const { totalInvestment, currentValue, profitLoss, profitLossPct } = useMemo(() => {
    const totalInvestment = allHoldings.reduce((acc, stock) => acc + Number(stock.avg) * Number(stock.qty), 0);
    const currentValue = allHoldings.reduce((acc, stock) => acc + Number(stock.price) * Number(stock.qty), 0);
    const profitLoss = currentValue - totalInvestment;
    const profitLossPct = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;
    return { totalInvestment, currentValue, profitLoss, profitLossPct };
  }, [allHoldings]);


  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <tr>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg. cost</th>
            <th>LTP</th>
            <th>Cur. val</th>
            <th>P&L</th>
            <th>Net chg.</th>
            <th>Day chg.</th>
          </tr>

          {allHoldings.map((stock, index) => {
            const curValue = stock.price * stock.qty;
            const isProfit = curValue - stock.avg * stock.qty >= 0.0;
            const profClass = isProfit ? "profit" : "loss";
            const dayClass = stock.isLoss ? "loss" : "profit";

            return (
              <tr key={index}>
                <td>{stock.name}</td>
                <td>{stock.qty}</td>
                <td>{stock.avg.toFixed(2)}</td>
                <td>{stock.price.toFixed(2)}</td>
                <td>{curValue.toFixed(2)}</td>
                <td className={profClass}>
                  {(curValue - stock.avg * stock.qty).toFixed(2)}
                </td>
                <td className={profClass}>{stock.net}</td>
                <td className={dayClass}>{stock.day}</td>
              </tr>
            );
          })}
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>
            {totalInvestment.toFixed(2)}
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            {currentValue.toFixed(2)}
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={profitLoss >= 0 ? "profit" : "loss"}>
            {profitLoss.toFixed(2)} ({profitLoss >= 0 ? "+" : ""}{profitLossPct.toFixed(2)}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>
      <VerticalGraph data={data} />
    </>
  );
};

export default Holdings;
