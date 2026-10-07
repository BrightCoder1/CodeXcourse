import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HomeFirst from "../components/HomeFirst";
import About from "../components/About";
import Course from "../components/Course";
import Contact from "../components/Contact";
import Scrolltop from "../components/Scrolltop";
import Blog from "../components/Blog";
import Footer from "../components/Footer";

function Home() {
  const location = useLocation();

  useEffect(() => {
    const targetSection = location.state?.targetSection;

    if (targetSection) {
      // requestAnimationFrame + setTimeout ensures DOM & Scrolltop are done
      const timer = setTimeout(() => {
        const element = document.getElementById(targetSection);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);

      // Clean state from browser history without re-rendering or changing URL
      window.history.replaceState({}, document.title);

      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <>
      <Scrolltop />
      <HomeFirst />

      <div id="about">
        <About />
      </div>

      <div id="course">
        <Course />
      </div>

      <div id="contact">
        <Contact />
      </div>

      <div id="blog">
        <Blog />
      </div>

      <Footer />
    </>
  );
}

export default Home;