import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("admin_theme") === "dark"
  );
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((darkMode) => {
      const nextMode = !darkMode;
      localStorage.setItem("admin_theme", nextMode ? "dark" : "light");
      return nextMode;
    });
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    closeMenu();

    if (location.pathname === "/") {
      // Home par hi hain toh directly scroll karein
      if (!sectionId) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Login se aa rahe hain toh targetSection state me bhej kar navigate karein
      navigate("/", { state: { targetSection: sectionId } });
    }
  };

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="logo">
          <a href="/" onClick={(e) => handleNavClick(e, null)}>
            <img src="./Logo.png" alt="Logo" className="logo-img" />
          </a>
        </div>

        {/* Hamburger Menu */}
        <button
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* Nav Links */}
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          <li>
            <a href="/" onClick={(e) => handleNavClick(e, "about")}>
              About
            </a>
          </li>

          <li>
            <a href="/" onClick={(e) => handleNavClick(e, "course")}>
              Course
            </a>
          </li>

          <li>
            <a href="/" onClick={(e) => handleNavClick(e, "contact")}>
              Contact
            </a>
          </li>

          <li>
            <a href="/" onClick={(e) => handleNavClick(e, "blog")}>
              Blog
            </a>
          </li>

          <li>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
                </svg>
              )}
            </button>
          </li>

          {/* Login Route */}
          <li>
            <Link to="/login" className="login-btn" onClick={closeMenu}>
              Login
            </Link>
          </li>
        </ul>
      </nav>

      {isOpen && <div className="menu-backdrop" onClick={closeMenu}></div>}
    </>
  );
}

export default Navbar;