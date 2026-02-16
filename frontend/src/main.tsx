import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import App from "./App";
import Home from "./Pages/Home";
import AboutPage from "./Pages/About";
import StoryDetail from "./Pages/StoryDetail";
import { LikesProvider } from "./lib/likes";

import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import ArticlesManager from "./admin/ArticlesManager";
import CommentsManager from "./admin/CommentsManager";
import ProtectedRoute from "./admin/ProtectedRoute";

const router = createBrowserRouter([
  // ===== PUBLIC SITE =====
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <AboutPage /> },
      { path: "story/:id", element: <StoryDetail /> },
    ],
  },

  // ===== ADMIN LOGIN (NO LAYOUT) =====
  {
    path: "/admin",
    element: <AdminLogin />,
  },

  // ===== ADMIN DASHBOARD (PROTECTED) =====
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <div>Welcome Admin</div> },
      { path: "articles", element: <ArticlesManager /> },
      { path: "comments", element: <CommentsManager /> },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <LikesProvider>
      <RouterProvider router={router} />
    </LikesProvider>
  </StrictMode>
);
