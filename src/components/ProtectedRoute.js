import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../services/api";

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    // 🔐 Verify token by calling backend
    API.get("me/")
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        localStorage.clear();
        setIsAuthenticated(false);
      });
  }, []);

  // ⏳ Loading state (prevents UI flicker)
  if (isAuthenticated === null) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Checking authentication...
      </div>
    );
  }

  // ❌ Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authenticated
  return children;
}

export default ProtectedRoute;
