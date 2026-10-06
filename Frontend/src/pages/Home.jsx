import { NavLink } from "react-router-dom";
import HomeFirst from "../components/HomeFirst";
import About from "../components/About";
import Course from "../components/Course";
import Contact from "../components/Contact";
import Scrolltop from "../components/Scrolltop";
import Blog from "../components/Blog";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Scrolltop />
      <HomeFirst />
      <About />
      <Course />
      <Contact />
      <Blog />
      <Footer />
    </>
  );
}

export default Home;

