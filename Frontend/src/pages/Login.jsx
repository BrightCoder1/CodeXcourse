import React, { useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
// import "./Login.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/$/, "");
const STUDENT_APP_URL = import.meta.env.VITE_STUDENT_APP_URL || "http://localhost:5174/";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await axios.post(
        `${API_URL}/student/login`,
        { email: email.trim(), password },
        { withCredentials: true },
      );
      window.location.assign(STUDENT_APP_URL);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to log in. Please try again.",
      );
      setIsLoading(false);
    }
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
              autoComplete="email"
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
              autoComplete="current-password"
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

          {errorMessage && <p role="alert">{errorMessage}</p>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
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

