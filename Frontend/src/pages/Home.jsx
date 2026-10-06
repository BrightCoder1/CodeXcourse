import { NavLink } from "react-router-dom";

function Home() {
  return (
    <section className="home">
      <h1>Welcome to User App</h1>

      <p>
        Register, login and manage your profile.
      </p>

      <NavLink to="/register" className="btn">
        Get Started
      </NavLink>
    </section>

    
  );
}

export default Home;

