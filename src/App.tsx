import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/Features/Login";
import { Dashboard } from "@/Features/Dashboard";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("access_token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("expires_in");
    localStorage.removeItem("refresh_expires_in");
    localStorage.removeItem("token_timestamp");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;