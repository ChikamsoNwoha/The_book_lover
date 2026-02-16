import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Always visible on every page */}
      <Navbar />

      {/* This is where the page content changes */}
      <main className="flex-1 pt-(--nav-height)">
        <Outlet />
      </main>

      {/* Always visible on every page */}
      <Footer />
    </div>
  );
}

export default App;
