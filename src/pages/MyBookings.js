import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState("all"); // all, upcoming, past

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("my-bookings/");
      setBookings(response.data);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("Failed to load bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Cancel booking
  const handleCancelBooking = async (bookingId, eventTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel your booking for "${eventTitle}"?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      await API.delete(`bookings/${bookingId}/cancel/`);
      
      // Remove booking from list
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      alert("✅ Booking cancelled successfully");
    } catch (err) {
      console.error("Cancel booking error:", err);
      alert("❌ Failed to cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  // View event details
  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  // Check if event date is in the past
  const isPastEvent = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  // Filter bookings
  const getFilteredBookings = () => {
    if (filter === "upcoming") {
      return bookings.filter((b) => !isPastEvent(b.event_date));
    } else if (filter === "past") {
      return bookings.filter((b) => isPastEvent(b.event_date));
    }
    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  // Calculate statistics
  const stats = {
    total: bookings.length,
    upcoming: bookings.filter((b) => !isPastEvent(b.event_date)).length,
    past: bookings.filter((b) => isPastEvent(b.event_date)).length,
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.errorContainer}>
            <h3 style={styles.errorTitle}>⚠️ Error</h3>
            <p>{error}</p>
            <button onClick={loadBookings} style={styles.btnRetry}>
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{cssStyles}</style>
      <Navbar />

      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>My Bookings</h1>
            <p style={styles.pageSubtitle}>
              Manage and view all your event bookings
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {bookings.length > 0 && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statIcon}>📊</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Total Bookings</p>
                <h3 style={styles.statValue}>{stats.total}</h3>
              </div>
            </div>

            <div style={styles.statCard} className="stat-card">
              <div style={{ ...styles.statIcon, backgroundColor: "#dbeafe" }}>
                📅
              </div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Upcoming Events</p>
                <h3 style={styles.statValue}>{stats.upcoming}</h3>
              </div>
            </div>

            <div style={styles.statCard} className="stat-card">
              <div style={{ ...styles.statIcon, backgroundColor: "#f3e8ff" }}>
                ✅
              </div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Past Events</p>
                <h3 style={styles.statValue}>{stats.past}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {bookings.length > 0 && (
          <div style={styles.filterTabs}>
            <button
              style={{
                ...styles.filterTab,
                ...(filter === "all" ? styles.filterTabActive : {}),
              }}
              className="filter-tab"
              onClick={() => setFilter("all")}
            >
              All ({stats.total})
            </button>
            <button
              style={{
                ...styles.filterTab,
                ...(filter === "upcoming" ? styles.filterTabActive : {}),
              }}
              className="filter-tab"
              onClick={() => setFilter("upcoming")}
            >
              Upcoming ({stats.upcoming})
            </button>
            <button
              style={{
                ...styles.filterTab,
                ...(filter === "past" ? styles.filterTabActive : {}),
              }}
              className="filter-tab"
              onClick={() => setFilter("past")}
            >
              Past ({stats.past})
            </button>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎫</div>
            <h3 style={styles.emptyTitle}>No bookings yet</h3>
            <p style={styles.emptyText}>
              You haven't booked any events. Browse available events to get started!
            </p>
            <button
              style={styles.btnBrowse}
              className="btn-browse"
              onClick={() => navigate("/events")}
            >
              Browse Events
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3 style={styles.emptyTitle}>No {filter} bookings</h3>
            <p style={styles.emptyText}>
              You don't have any {filter} bookings at the moment.
            </p>
          </div>
        ) : (
          <div style={styles.bookingsGrid}>
            {filteredBookings.map((booking) => {
              const isExpired = isPastEvent(booking.event_date);
              const isCancelling = cancellingId === booking.id;

              return (
                <article
                  key={booking.id}
                  style={styles.bookingCard}
                  className="booking-card"
                >
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <h3 style={styles.eventTitle}>{booking.event_title}</h3>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(isExpired
                          ? styles.statusExpired
                          : styles.statusConfirmed),
                      }}
                    >
                      {isExpired ? "Completed" : "Confirmed"}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div style={styles.eventDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>📅</span>
                      <div style={styles.detailContent}>
                        <span style={styles.detailLabel}>Event Date</span>
                        <span style={styles.detailValue}>
                          {new Date(booking.event_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>📍</span>
                      <div style={styles.detailContent}>
                        <span style={styles.detailLabel}>Location</span>
                        <span style={styles.detailValue}>{booking.location}</span>
                      </div>
                    </div>

                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>🎟️</span>
                      <div style={styles.detailContent}>
                        <span style={styles.detailLabel}>Booking ID</span>
                        <span style={styles.detailValue}>#{booking.id}</span>
                      </div>
                    </div>

                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>⏰</span>
                      <div style={styles.detailContent}>
                        <span style={styles.detailLabel}>Booked On</span>
                        <span style={styles.detailValue}>
                          {new Date(booking.booked_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div style={styles.cardActions}>
                    <button
                      style={styles.btnView}
                      className="btn-view"
                      onClick={() => handleViewEvent(booking.event_id)}
                    >
                      View Event
                    </button>

                    {!isExpired && (
                      <button
                        style={{
                          ...styles.btnCancel,
                          ...(isCancelling ? styles.btnCancelDisabled : {}),
                        }}
                        className="btn-cancel"
                        onClick={() =>
                          handleCancelBooking(booking.id, booking.event_title)
                        }
                        disabled={isCancelling}
                      >
                        {isCancelling ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
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
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .booking-card {
    animation: fadeIn 0.3s ease-out;
  }

  .booking-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }

  .stat-card:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .filter-tab:hover {
    background-color: #f3f4f6;
  }

  .btn-view:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .btn-cancel:hover:not(:disabled) {
    background-color: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  .btn-browse:hover {
    background-color: #059669;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem !important;
    }

    .statsGrid {
      grid-template-columns: 1fr !important;
    }

    .bookingsGrid {
      grid-template-columns: 1fr !important;
    }
  }
`;

/* ================= INLINE STYLES ================= */

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
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
  loadingContainer: {
    textAlign: "center",
    padding: "4rem 2rem",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f4f6",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 1rem",
  },
  errorContainer: {
    textAlign: "center",
    padding: "4rem 2rem",
  },
  errorTitle: {
    color: "#dc2626",
    marginBottom: "0.5rem",
  },
  btnRetry: {
    marginTop: "1rem",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  statCard: {
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    transition: "all 0.3s",
    border: "1px solid #e5e7eb",
  },
  statIcon: {
    width: "50px",
    height: "50px",
    backgroundColor: "#dbeafe",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0 0 0.25rem 0",
  },
  statValue: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: 0,
  },
  filterTabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "2rem",
    borderBottom: "2px solid #e5e7eb",
    flexWrap: "wrap",
  },
  filterTab: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#6b7280",
    transition: "all 0.2s",
  },
  filterTabActive: {
    color: "#2563eb",
    borderBottomColor: "#2563eb",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "0.5rem",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: "0.95rem",
    marginBottom: "1.5rem",
  },
  btnBrowse: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "0.875rem 2rem",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  bookingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "1.5rem",
  },
  bookingCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s",
    border: "1px solid #e5e7eb",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
    gap: "1rem",
  },
  eventTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: 0,
    flex: 1,
  },
  statusBadge: {
    padding: "0.375rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  statusConfirmed: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusExpired: {
    backgroundColor: "#e5e7eb",
    color: "#4b5563",
  },
  eventDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  detailItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
  },
  detailIcon: {
    fontSize: "1.25rem",
    marginTop: "0.125rem",
  },
  detailContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
    flex: 1,
  },
  detailLabel: {
    fontSize: "0.75rem",
    color: "#9ca3af",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  detailValue: {
    fontSize: "0.95rem",
    color: "#374151",
    fontWeight: "500",
  },
  cardActions: {
    display: "flex",
    gap: "0.75rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  btnView: {
    flex: 1,
    padding: "0.75rem 1rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnCancel: {
    flex: 1,
    padding: "0.75rem 1rem",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnCancelDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
    opacity: 0.6,
  },
};

export default MyBookings;