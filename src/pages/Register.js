import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // -------------------------
  // HANDLE INPUT CHANGE
  // -------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // -------------------------
  // FORM VALIDATION
  // -------------------------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------
  // SUBMIT HANDLER
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      const { confirmPassword, ...payload } = formData;

      const res = await API.post("register/", payload);

      // ✅ SUCCESS
      if (res.status === 200 || res.status === 201) {
        alert("✅ Account created successfully! Please login.");
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({
          general:
            "Registration failed. Please check your internet connection.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        {errors.general && (
          <p style={styles.errorText}>{errors.general}</p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.username && (
            <p style={styles.errorText}>{errors.username}</p>
          )}

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.email && (
            <p style={styles.errorText}>{errors.email}</p>
          )}

          {/* Password */}
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.toggleBtn}
            >
              👁
            </button>
          </div>
          {errors.password && (
            <p style={styles.errorText}>{errors.password}</p>
          )}

          {/* Confirm Password */}
          <div style={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              style={styles.toggleBtn}
            >
              👁
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={styles.errorText}>{errors.confirmPassword}</p>
          )}

          <button
            type="submit"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

// -------------------------
// STYLES
// -------------------------
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#10b981",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    width: "350px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  title: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.7rem",
    marginBottom: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  passwordWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
  },
  submitBtn: {
    width: "100%",
    padding: "0.7rem",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
  errorText: {
    color: "red",
    fontSize: "0.8rem",
    marginBottom: "5px",
  },
  footerText: {
    textAlign: "center",
    marginTop: "1rem",
  },
};

export default Register;
