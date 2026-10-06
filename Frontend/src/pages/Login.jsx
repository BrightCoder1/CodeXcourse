import React, { useState } from "react";
import { NavLink } from "react-router-dom";
// import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <div className="login-header">
          <h1>Login</h1>
          <p>Welcome to Login page</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label className="remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            {/* <NavLink to="/forgot-password">
              Forgot Password?
            </NavLink> */}
            
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

        </form>

        <div className="register-link">
          <p>
            Don't have an account?
            <NavLink to="/register"> Register</NavLink>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;

