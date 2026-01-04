import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("access");

  // Simple frontend check (real security is backend)
  return token ? children : <Navigate to="/" />;
}

export default AdminRoute;
