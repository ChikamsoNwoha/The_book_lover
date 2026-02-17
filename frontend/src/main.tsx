import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";

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
import AdminOverview from "./admin/AdminOverview";
import NewsletterManager from "./admin/NewsletterManager";
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
  {
    path: "/admin/dashboard/overview",
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: "/admin/articles",
    element: <Navigate to="/admin/dashboard/articles" replace />,
  },
  {
    path: "/admin/comments",
    element: <Navigate to="/admin/dashboard/comments" replace />,
  },
  {
    path: "/admin/newsletter",
    element: <Navigate to="/admin/dashboard/newsletter" replace />,
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
      { index: true, element: <AdminOverview /> },
      { path: "articles", element: <ArticlesManager /> },
      { path: "comments", element: <CommentsManager /> },
      { path: "newsletter", element: <NewsletterManager /> },
    ],
  },
  {
    path: "/admin/*",
    element: <Navigate to="/admin/dashboard" replace />,
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
