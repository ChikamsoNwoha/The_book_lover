import { Link, Outlet, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-8">
          Small Wins Admin
        </h2>

        <nav className="space-y-3">
          <Link
            to="/admin/dashboard"
            className="block rounded-lg px-4 py-2 hover:bg-gray-800 transition"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/dashboard/articles"
            className="block rounded-lg px-4 py-2 hover:bg-gray-800 transition"
          >
            Articles
          </Link>

          <Link
            to="/admin/dashboard/comments"
            className="block rounded-lg px-4 py-2 hover:bg-gray-800 transition"
          >
            Comments
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 w-full text-left rounded-lg px-4 py-2 text-red-400 hover:bg-red-950/40 transition"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
