import React, { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    closeMenu(); // Auto close hamburger menu on phone when clicked

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = (e) => {
    e.preventDefault();
    closeMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="logo">
          <a href="#top" onClick={scrollToTop}>
            <img src="./Logo.png" alt="Logo" className="logo-img" />
          </a>
        </div>

        {/* Hamburger / Cut (Close) Button for Mobile */}
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
            <a href="#about" onClick={(e) => scrollToSection(e, "about")}>
              About
            </a>
          </li>

          <li>
            <a href="#course" onClick={(e) => scrollToSection(e, "course")}>
              Course
            </a>
          </li>

          <li>
            <a href="#contact" onClick={(e) => scrollToSection(e, "contact")}>
              Contact
            </a>
          </li>

          <li>
            <a href="#blog" onClick={(e) => scrollToSection(e, "blog")}>
              Blog
            </a>
          </li>

          <li>
            <a
              href="#login"
              className="login-btn"
              onClick={(e) => scrollToSection(e, "login")}
            >
              Login
            </a>
          </li>
        </ul>
      </nav>

      {isOpen && <div className="menu-backdrop" onClick={closeMenu}></div>}
    </>
  );
}

export default Navbar;