import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function PublicLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-content">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default PublicLayout;