import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    axios.get(`${API_BASE_URL}/allOrders`).then((res) => setOrders(res.data));
  };

  useEffect(() => {
    fetchOrders();

    const es = new EventSource(`${API_BASE_URL}/events`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg && msg.type === "data-updated") {
          fetchOrders();
        }
      } catch (_) {}
    };

    return () => es.close();
  }, []);

  if (!orders.length) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>You haven't placed any orders today</p>

          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="order-table">
        <table>
          <tr>
            <th>Instrument</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Mode</th>
          </tr>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.name}</td>
              <td>{o.qty}</td>
              <td>{Number(o.price).toFixed(2)}</td>
              <td>{o.mode}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
};

export default Orders;
