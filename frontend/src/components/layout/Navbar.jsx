import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

function Navbar() {
const navigate = useNavigate();

const [user, setUser] = useState(() => {
const savedUser = sessionStorage.getItem("offertrace_user");


try {
  return savedUser ? JSON.parse(savedUser) : null;
} catch {
  return null;
}


});

function handleLogout() {
sessionStorage.removeItem("offertrace_access_token");
sessionStorage.removeItem("offertrace_user");


setUser(null);
navigate("/login");


}

return ( <header className="navbar"> <Link to="/" className="brand"> <span className="brand-icon"> <ShieldCheck size={20} /> </span>


    <span>OfferTrace</span>
  </Link>

  <nav className="nav-links">
    <Link to="/">Home</Link>
    <a href="/#how-it-works">How It Works</a>
    <Link to="/safety">Safety</Link>
  </nav>

  <div className="nav-actions">
    {user ? (
      <>
        <span className="nav-login">
          Hi, {user.full_name.split(" ")[0]}
        </span>

        <button
          type="button"
          className="primary-button small"
          onClick={handleLogout}
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <Link to="/login" className="nav-login">
          Login
        </Link>

        <Link to="/register" className="primary-button small">
          Get Started
        </Link>
      </>
    )}
  </div>
</header>

);
}

export default Navbar;
