import React, { useState } from "react";
import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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