import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import VerifyOpportunity from "../pages/VerifyOpportunity";
import History from "../pages/History";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/login"
          element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          }
        />

        <Route
          path="/register"
          element={
            <PublicLayout>
              <Register />
            </PublicLayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PublicLayout>
              <Dashboard />
            </PublicLayout>
          }
        />

        <Route
          path="/verify"
          element={
            <PublicLayout>
              <VerifyOpportunity />
            </PublicLayout>
          }
        />

        <Route
          path="/history"
          element={
            <PublicLayout>
              <History />
            </PublicLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;