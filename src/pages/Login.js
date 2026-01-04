import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  };

  // Validate form
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const response = await API.post("login/", formData);
      
      // Store tokens
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      // Optional: Store user info if available
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      // Navigate to events page
      navigate("/events", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle different error types
      if (err.response?.status === 401) {
        setError("Invalid username or password");
      } else if (err.response?.status === 429) {
        setError("Too many login attempts. Please try again later.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !formData.username.trim() || !formData.password;

  return (
    <>
      <style>{cssStyles}</style>
      
      <div style={styles.container}>
        <div style={styles.loginWrapper}>
          <div style={styles.loginBox}>
            {/* Logo/Brand Section */}
            <div style={styles.brandSection}>
              <div style={styles.logoCircle}>🎫</div>
              <h1 style={styles.brandTitle}>Event Manager</h1>
              <p style={styles.brandSubtitle}>Welcome back! Please login to your account</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div style={styles.errorAlert} role="alert">
                <span style={styles.errorIcon}>⚠️</span>
                <span style={styles.errorText}>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Username Field */}
              <div style={styles.formGroup}>
                <label htmlFor="username" style={styles.label}>
                  Username
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>👤</span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    style={styles.input}
                    className="form-input"
                    autoComplete="username"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={styles.formGroup}>
                <label htmlFor="password" style={styles.label}>
                  Password
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    style={styles.input}
                    className="form-input"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.togglePassword}
                    className="toggle-password"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={styles.formOptions}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    disabled={loading}
                  />
                  <span style={styles.checkboxText}>Remember me</span>
                </label>
                <Link to="/forgot-password" style={styles.forgotLink} className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  ...(isDisabled ? styles.submitButtonDisabled : {}),
                }}
                className="submit-button"
                disabled={isDisabled}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner}></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>OR</span>
              <span style={styles.dividerLine}></span>
            </div>

            {/* Register Link */}
            <div style={styles.registerSection}>
              <p style={styles.registerText}>
                Don't have an account?{" "}
                <Link to="/register" style={styles.registerLink} className="register-link">
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              © 2025 Event Manager. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= CSS STYLES ================= */

const cssStyles = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .form-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .form-input:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }

  .toggle-password:hover:not(:disabled) {
    background-color: #f3f4f6;
  }

  .submit-button:hover:not(:disabled) {
    background-color: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
  }

  .submit-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .forgot-link:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }

  .register-link:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .login-box {
      padding: 2rem 1.5rem !important;
      width: 100% !important;
      margin: 0 1rem !important;
    }
  }
`;

/* ================= INLINE STYLES ================= */

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "1rem",
  },
  loginWrapper: {
    width: "100%",
    maxWidth: "450px",
  },
  loginBox: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "2.5rem",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    animation: "fadeIn 0.5s ease-out",
  },
  brandSection: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  logoCircle: {
    width: "70px",
    height: "70px",
    backgroundColor: "#2563eb",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    margin: "0 auto 1rem",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
  },
  brandTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
  },
  brandSubtitle: {
    color: "#6b7280",
    fontSize: "0.875rem",
    margin: 0,
  },
  errorAlert: {
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  errorIcon: {
    fontSize: "1.25rem",
  },
  errorText: {
    color: "#dc2626",
    fontSize: "0.875rem",
    flex: 1,
  },
  form: {
    width: "100%",
  },
  formGroup: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "1rem",
    fontSize: "1.25rem",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 3rem",
    fontSize: "0.95rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    transition: "all 0.2s",
    backgroundColor: "#ffffff",
  },
  togglePassword: {
    position: "absolute",
    right: "1rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.25rem",
    padding: "0.25rem",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  formOptions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
  },
  checkbox: {
    width: "1rem",
    height: "1rem",
    cursor: "pointer",
  },
  checkboxText: {
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  forgotLink: {
    fontSize: "0.875rem",
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "500",
    transition: "color 0.2s",
  },
  submitButton: {
    width: "100%",
    padding: "0.875rem 1.5rem",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  spinner: {
    width: "1rem",
    height: "1rem",
    border: "2px solid #ffffff",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "1.5rem 0",
    gap: "0.75rem",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: "0.75rem",
    color: "#9ca3af",
    fontWeight: "600",
  },
  registerSection: {
    textAlign: "center",
  },
  registerText: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: 0,
  },
  registerLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.2s",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
  },
  footerText: {
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.8)",
    margin: 0,
  },
};

export default Login;