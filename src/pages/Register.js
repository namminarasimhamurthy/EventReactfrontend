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
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Calculate password strength
    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(Math.min(strength, 100));
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "#ef4444";
    if (passwordStrength < 75) return "#f59e0b";
    return "#10b981";
  };

  // Get password strength label
  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Medium";
    return "Strong";
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;

      await API.post("register/", registrationData);

      // Show success message (you can use a toast notification here)
      alert("✅ Account created successfully! Please login.");

      // Navigate to login page
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Registration error:", err);

      // Handle different error types
      if (err.response?.data) {
        const apiErrors = {};
        
        if (err.response.data.username) {
          apiErrors.username = "Username already exists";
        }
        if (err.response.data.email) {
          apiErrors.email = "Email already exists";
        }
        if (err.response.data.message) {
          apiErrors.general = err.response.data.message;
        }

        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
        } else {
          setErrors({ general: "Username or email already exists" });
        }
      } else if (err.response?.status === 429) {
        setErrors({ general: "Too many registration attempts. Please try again later." });
      } else {
        setErrors({ general: "Registration failed. Please check your connection and try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    !formData.username.trim() ||
    !formData.email.trim() ||
    !formData.password ||
    !formData.confirmPassword;

  return (
    <>
      <style>{cssStyles}</style>

      <div style={styles.container}>
        <div style={styles.registerWrapper}>
          <div style={styles.registerBox}>
            {/* Logo/Brand Section */}
            <div style={styles.brandSection}>
              <div style={styles.logoCircle}>🎫</div>
              <h1 style={styles.brandTitle}>Join Event Manager</h1>
              <p style={styles.brandSubtitle}>Create your account to get started</p>
            </div>

            {/* General Error Alert */}
            {errors.general && (
              <div style={styles.errorAlert} role="alert">
                <span style={styles.errorIcon}>⚠️</span>
                <span style={styles.errorText}>{errors.general}</span>
              </div>
            )}

            {/* Registration Form */}
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
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.username ? styles.inputError : {}),
                    }}
                    className="form-input"
                    autoComplete="username"
                    disabled={loading}
                    required
                  />
                </div>
                {errors.username && (
                  <p style={styles.fieldError}>{errors.username}</p>
                )}
              </div>

              {/* Email Field */}
              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>
                  Email Address
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>📧</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.email ? styles.inputError : {}),
                    }}
                    className="form-input"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
                {errors.email && (
                  <p style={styles.fieldError}>{errors.email}</p>
                )}
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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.password ? styles.inputError : {}),
                    }}
                    className="form-input"
                    autoComplete="new-password"
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div style={styles.passwordStrength}>
                    <div style={styles.strengthBar}>
                      <div
                        style={{
                          ...styles.strengthFill,
                          width: `${passwordStrength}%`,
                          backgroundColor: getPasswordStrengthColor(),
                        }}
                      ></div>
                    </div>
                    <span
                      style={{
                        ...styles.strengthLabel,
                        color: getPasswordStrengthColor(),
                      }}
                    >
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                )}
                
                {errors.password && (
                  <p style={styles.fieldError}>{errors.password}</p>
                )}
                
                <p style={styles.hint}>
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password Field */}
              <div style={styles.formGroup}>
                <label htmlFor="confirmPassword" style={styles.label}>
                  Confirm Password
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.confirmPassword ? styles.inputError : {}),
                    }}
                    className="form-input"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.togglePassword}
                    className="toggle-password"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p style={styles.fieldError}>{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div style={styles.termsSection}>
                <p style={styles.termsText}>
                  By creating an account, you agree to our{" "}
                  <a href="/terms" style={styles.termsLink}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" style={styles.termsLink}>Privacy Policy</a>
                </p>
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>OR</span>
              <span style={styles.dividerLine}></span>
            </div>

            {/* Login Link */}
            <div style={styles.loginSection}>
              <p style={styles.loginText}>
                Already have an account?{" "}
                <Link to="/" style={styles.loginLink} className="login-link">
                  Sign in
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
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  .form-input:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }

  .toggle-password:hover:not(:disabled) {
    background-color: #f3f4f6;
  }

  .submit-button:hover:not(:disabled) {
    background-color: #059669;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  .submit-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .login-link:hover {
    color: #059669;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .register-box {
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
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    padding: "2rem 1rem",
  },
  registerWrapper: {
    width: "100%",
    maxWidth: "500px",
  },
  registerBox: {
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
    backgroundColor: "#10b981",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    margin: "0 auto 1rem",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
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
  inputError: {
    borderColor: "#ef4444",
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
  fieldError: {
    color: "#ef4444",
    fontSize: "0.75rem",
    marginTop: "0.25rem",
    marginBottom: 0,
  },
  hint: {
    color: "#6b7280",
    fontSize: "0.75rem",
    marginTop: "0.25rem",
    marginBottom: 0,
  },
  passwordStrength: {
    marginTop: "0.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  strengthBar: {
    flex: 1,
    height: "4px",
    backgroundColor: "#e5e7eb",
    borderRadius: "2px",
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    transition: "width 0.3s, background-color 0.3s",
  },
  strengthLabel: {
    fontSize: "0.75rem",
    fontWeight: "600",
    minWidth: "60px",
    textAlign: "right",
  },
  termsSection: {
    marginBottom: "1.5rem",
  },
  termsText: {
    fontSize: "0.75rem",
    color: "#6b7280",
    lineHeight: "1.5",
    margin: 0,
  },
  termsLink: {
    color: "#10b981",
    textDecoration: "none",
    fontWeight: "500",
  },
  submitButton: {
    width: "100%",
    padding: "0.875rem 1.5rem",
    backgroundColor: "#10b981",
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
  loginSection: {
    textAlign: "center",
  },
  loginText: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: 0,
  },
  loginLink: {
    color: "#10b981",
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

export default Register;