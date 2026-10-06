import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">
                <Link style={{ textDecoration: 'none' }} to="/">
                    My Project
                </Link>
            </div>

            <ul className="nav-links">
                <li>
                    <Link to="/about">About</Link>
                </li>

                <li>
                    <Link to="/course">Course</Link>
                </li>

                <li>
                    <Link to="/contact">Contact</Link>
                </li>

                <li>
                    <Link to="/login" className="login-btn">
                        Login
                    </Link>
                </li>

                <li>
                    <Link to="/register" className="login-btn">
                        Register
                    </Link>
                </li>

            
            </ul>
        </nav>
    );
}

export default Navbar;