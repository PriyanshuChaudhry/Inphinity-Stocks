import React from "react";

function Hero() {
  return (
    <div className="w-100 bg-light">
      <div className="container-fluid py-5 px-3 px-sm-4">
        <div className="row justify-content-center text-center mx-0">
          <div className="col-12 col-sm-10 col-md-8">
            <img
              src="media/images/homeHero2.png"
              alt="Hero"
              className="img-fluid d-block mx-auto mb-4"
              style={{
                maxHeight: "380px",
                width: "100%",
                objectFit: "contain",
              }}
            />
            <h1 className="fw-bold">Invest Smarter with Inphinity Stocks</h1>
            <p className="lead">
              Your Gateway to Modern, Fast & Secure Trading.
            </p>
            <a
              className="btn btn-primary fs-5 px-4 py-2 mt-3"
              href={
                window.location.hostname === "localhost"
                  ? "http://localhost:3001"
                  : "https://inphinity-stocks-dashboard.onrender.com"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Try Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
