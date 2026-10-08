import { ShieldCheck } from "lucide-react";

function Navbar() {
  return (
    <header className="navbar">
      <a href="/" className="brand">
        <span className="brand-icon">
          <ShieldCheck size={20} />
        </span>

        <span>OfferTrace</span>
      </a>

      <nav className="nav-links">
        <a href="/">Home</a>
        <a href="/#how-it-works">How It Works</a>
        <a href="/safety">Safety</a>
      </nav>

      <div className="nav-actions">
        <a href="/login" className="nav-login">
          Login
        </a>

        <a href="/register" className="primary-button small">
          Get Started
        </a>
      </div>
    </header>
  );
}

export default Navbar;