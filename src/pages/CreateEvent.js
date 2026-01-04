import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function CreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    capacity: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) setError(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.date) {
      newErrors.date = "Event date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Event date cannot be in the past";
      }
    }

    if (!formData.capacity) {
      newErrors.capacity = "Capacity is required";
    } else {
      const capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity < 1) {
        newErrors.capacity = "Capacity must be at least 1";
      } else if (capacity > 10000) {
        newErrors.capacity = "Capacity cannot exceed 10,000";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        date: formData.date,
        capacity: Number(formData.capacity),
      };

      await API.post("events/create/", payload);

      alert("✅ Event created successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        date: "",
        capacity: "",
      });

      // Navigate to events page after short delay
      setTimeout(() => navigate("/events"), 500);
    } catch (err) {
      console.error("Create event error:", err);

      if (err.response?.data) {
        const apiErrors = {};
        
        // Handle field-specific errors
        Object.keys(err.response.data).forEach((key) => {
          if (typeof err.response.data[key] === "string") {
            apiErrors[key] = err.response.data[key];
          } else if (Array.isArray(err.response.data[key])) {
            apiErrors[key] = err.response.data[key][0];
          }
        });

        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
        } else {
          setError("Failed to create event. Please check your input and try again.");
        }
      } else if (err.response?.status === 403) {
        setError("You don't have permission to create events. Admin access required.");
      } else {
        setError("Failed to create event. Please check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasData = Object.values(formData).some((value) => value.trim() !== "");
    
    if (hasData) {
      if (window.confirm("Are you sure you want to cancel? All entered data will be lost.")) {
        navigate("/events");
      }
    } else {
      navigate("/events");
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <>
      <style>{cssStyles}</style>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.contentWrapper}>
          {/* Header */}
          <div style={styles.header}>
            <button
              onClick={() => navigate("/events")}
              style={styles.backButton}
              className="back-button"
            >
              ← Back
            </button>
            <div>
              <h1 style={styles.pageTitle}>Create New Event</h1>
              <p style={styles.pageSubtitle}>Add a new event for attendees to book</p>
            </div>
          </div>

          {/* Form Container */}
          <div style={styles.formContainer}>
            {/* General Error Alert */}
            {error && (
              <div style={styles.errorAlert} role="alert">
                <span style={styles.errorIcon}>⚠️</span>
                <span style={styles.errorText}>{error}</span>
              </div>
            )}

            {/* Info Banner */}
            <div style={styles.infoBanner}>
              <span style={styles.infoIcon}>ℹ️</span>
              <span style={styles.infoText}>
                All fields are required. The event will be immediately available for booking once created.
              </span>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Event Title */}
              <div style={styles.formGroup}>
                <label htmlFor="title" style={styles.label}>
                  Event Title <span style={styles.required}>*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Annual Tech Conference 2025"
                  value={formData.title}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.title ? styles.inputError : {}),
                  }}
                  className="form-input"
                  maxLength="100"
                  disabled={submitting}
                  required
                />
                {errors.title && (
                  <p style={styles.fieldError}>{errors.title}</p>
                )}
                <p style={styles.charCount}>
                  {formData.title.length} / 100 characters
                </p>
              </div>

              {/* Description */}
              <div style={styles.formGroup}>
                <label htmlFor="description" style={styles.label}>
                  Event Description <span style={styles.required}>*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Provide a detailed description of the event..."
                  value={formData.description}
                  onChange={handleChange}
                  style={{
                    ...styles.textarea,
                    ...(errors.description ? styles.inputError : {}),
                  }}
                  className="form-input"
                  rows="6"
                  disabled={submitting}
                  required
                />
                {errors.description && (
                  <p style={styles.fieldError}>{errors.description}</p>
                )}
                <p style={styles.charCount}>
                  {formData.description.length} characters
                </p>
              </div>

              {/* Location and Date Row */}
              <div style={styles.formRow}>
                {/* Location */}
                <div style={styles.formGroup}>
                  <label htmlFor="location" style={styles.label}>
                    Location <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>📍</span>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g., Convention Center, New York"
                      value={formData.location}
                      onChange={handleChange}
                      style={{
                        ...styles.input,
                        paddingLeft: "2.5rem",
                        ...(errors.location ? styles.inputError : {}),
                      }}
                      className="form-input"
                      disabled={submitting}
                      required
                    />
                  </div>
                  {errors.location && (
                    <p style={styles.fieldError}>{errors.location}</p>
                  )}
                </div>

                {/* Event Date */}
                <div style={styles.formGroup}>
                  <label htmlFor="date" style={styles.label}>
                    Event Date <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>📅</span>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      min={getTodayDate()}
                      value={formData.date}
                      onChange={handleChange}
                      style={{
                        ...styles.input,
                        paddingLeft: "2.5rem",
                        ...(errors.date ? styles.inputError : {}),
                      }}
                      className="form-input"
                      disabled={submitting}
                      required
                    />
                  </div>
                  {errors.date && (
                    <p style={styles.fieldError}>{errors.date}</p>
                  )}
                </div>
              </div>

              {/* Capacity */}
              <div style={styles.formGroup}>
                <label htmlFor="capacity" style={styles.label}>
                  Maximum Capacity <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>👥</span>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    max="10000"
                    placeholder="e.g., 100"
                    value={formData.capacity}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      paddingLeft: "2.5rem",
                      ...(errors.capacity ? styles.inputError : {}),
                    }}
                    className="form-input"
                    disabled={submitting}
                    required
                  />
                </div>
                {errors.capacity && (
                  <p style={styles.fieldError}>{errors.capacity}</p>
                )}
                <p style={styles.hint}>
                  Enter the maximum number of attendees (1-10,000)
                </p>
              </div>

              {/* Form Actions */}
              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={styles.btnCancel}
                  className="btn-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.btnSubmit,
                    ...(submitting ? styles.btnSubmitDisabled : {}),
                  }}
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span style={styles.spinner}></span>
                      <span>Creating Event...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Create Event</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          {(formData.title || formData.description) && (
            <div style={styles.previewContainer}>
              <h3 style={styles.previewTitle}>Event Preview</h3>
              <div style={styles.previewCard}>
                <h4 style={styles.previewEventTitle}>
                  {formData.title || "Event Title"}
                </h4>
                {formData.description && (
                  <p style={styles.previewDescription}>{formData.description}</p>
                )}
                <div style={styles.previewDetails}>
                  {formData.location && (
                    <div style={styles.previewDetail}>
                      <span>📍</span>
                      <span>{formData.location}</span>
                    </div>
                  )}
                  {formData.date && (
                    <div style={styles.previewDetail}>
                      <span>📅</span>
                      <span>
                        {new Date(formData.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {formData.capacity && (
                    <div style={styles.previewDetail}>
                      <span>👥</span>
                      <span>Capacity: {formData.capacity}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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

  .back-button:hover {
    background-color: #f3f4f6;
  }

  .btn-cancel:hover:not(:disabled) {
    background-color: #f3f4f6;
    border-color: #d1d5db;
  }

  .btn-submit:hover:not(:disabled) {
    background-color: #059669;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  @media (max-width: 768px) {
    .formRow {
      flex-direction: column !important;
    }

    .container {
      padding: 1rem !important;
    }
  }
`;

/* ================= INLINE STYLES ================= */

const styles = {
  container: {
    minHeight: "calc(100vh - 64px)",
    backgroundColor: "#f9fafb",
    padding: "2rem",
  },
  contentWrapper: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "2rem",
  },
  backButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "0.95rem",
    cursor: "pointer",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    marginBottom: "1rem",
    transition: "background-color 0.2s",
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
  },
  pageSubtitle: {
    color: "#6b7280",
    fontSize: "0.95rem",
    margin: 0,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    animation: "fadeIn 0.5s ease-out",
    marginBottom: "2rem",
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
  infoBanner: {
    backgroundColor: "#dbeafe",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  infoIcon: {
    fontSize: "1.25rem",
  },
  infoText: {
    color: "#1e40af",
    fontSize: "0.875rem",
    flex: 1,
  },
  form: {
    width: "100%",
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    transition: "all 0.2s",
    backgroundColor: "#ffffff",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    transition: "all 0.2s",
    backgroundColor: "#ffffff",
    fontFamily: "inherit",
    resize: "vertical",
  },
  inputError: {
    borderColor: "#ef4444",
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
  charCount: {
    color: "#9ca3af",
    fontSize: "0.75rem",
    marginTop: "0.25rem",
    marginBottom: 0,
    textAlign: "right",
  },
  formRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  formActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e5e7eb",
  },
  btnCancel: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#ffffff",
    color: "#374151",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnSubmit: {
    padding: "0.75rem 2rem",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  btnSubmitDisabled: {
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
  previewContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  previewTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "1rem",
  },
  previewCard: {
    border: "2px dashed #e5e7eb",
    borderRadius: "8px",
    padding: "1.5rem",
  },
  previewEventTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "0.75rem",
  },
  previewDescription: {
    color: "#6b7280",
    lineHeight: "1.6",
    marginBottom: "1rem",
  },
  previewDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  previewDetail: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.95rem",
    color: "#4b5563",
  },
};

export default CreateEvent;