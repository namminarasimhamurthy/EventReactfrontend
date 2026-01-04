import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function AdminBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedBookings, setSelectedBookings] = useState([]);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.get("admin/bookings/");
      setBookings(response.data);
      setFilteredBookings(response.data);
    } catch (err) {
      console.error("Error loading bookings:", err);

      if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
        setTimeout(() => navigate("/events"), 3000);
      } else if (err.response?.status === 401) {
        setError("Authentication required. Please login again.");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError("Failed to load bookings. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Filter and sort bookings
  useEffect(() => {
    let result = [...bookings];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (booking) =>
          booking.username?.toLowerCase().includes(term) ||
          booking.email?.toLowerCase().includes(term) ||
          booking.event_title?.toLowerCase().includes(term) ||
          booking.location?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      const now = new Date();
      result = result.filter((booking) => {
        const eventDate = new Date(booking.event_date);
        if (filterStatus === "upcoming") return eventDate >= now;
        if (filterStatus === "past") return eventDate < now;
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.booked_at) - new Date(a.booked_at);
      } else if (sortBy === "oldest") {
        return new Date(a.booked_at) - new Date(b.booked_at);
      } else if (sortBy === "event_date") {
        return new Date(a.event_date) - new Date(b.event_date);
      } else if (sortBy === "username") {
        return a.username?.localeCompare(b.username);
      }
      return 0;
    });

    setFilteredBookings(result);
  }, [bookings, searchTerm, filterStatus, sortBy]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBookings(filteredBookings.map((b) => b.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleSelectBooking = (id) => {
    setSelectedBookings((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const dataToExport = filteredBookings;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "User,Email,Event,Event Date,Location,Booked At\n" +
      dataToExport
        .map(
          (b) =>
            `"${b.username}","${b.email}","${b.event_title}","${b.event_date}","${b.location}","${new Date(
              b.booked_at
            ).toLocaleString()}"`
        )
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `bookings_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPastEvent = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading bookings...</p>
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
            <h3 style={styles.errorTitle}>⚠️ {error}</h3>
            <p style={styles.errorText}>
              {error.includes("Access denied")
                ? "Redirecting to events page..."
                : "Redirecting to login..."}
            </p>
            <button onClick={() => navigate("/events")} style={styles.btnBack}>
              Go to Events
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
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>📋 All Bookings</h1>
            <p style={styles.pageSubtitle}>
              Manage and view all event bookings - {filteredBookings.length} total
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div style={styles.controlsBar}>
          {/* Search */}
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by user, email, event, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              className="search-input"
            />
          </div>

          {/* Filters */}
          <div style={styles.filters}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.select}
              className="filter-select"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="event_date">Event Date</option>
              <option value="username">Username A-Z</option>
            </select>

            <button
              onClick={handleExport}
              style={styles.exportButton}
              className="export-button"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Total:</span>
            <span style={styles.statValue}>{bookings.length}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Upcoming:</span>
            <span style={styles.statValue}>
              {bookings.filter((b) => !isPastEvent(b.event_date)).length}
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Past:</span>
            <span style={styles.statValue}>
              {bookings.filter((b) => isPastEvent(b.event_date)).length}
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Showing:</span>
            <span style={styles.statValue}>{filteredBookings.length}</span>
          </div>
        </div>

        {/* Table Container */}
        {filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No bookings found</h3>
            <p style={styles.emptyText}>
              {searchTerm
                ? "Try adjusting your search or filters"
                : "No bookings have been made yet"}
            </p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        selectedBookings.length === filteredBookings.length &&
                        filteredBookings.length > 0
                      }
                      style={styles.checkbox}
                    />
                  </th>
                  <th style={styles.tableHeader}>User</th>
                  <th style={styles.tableHeader}>Email</th>
                  <th style={styles.tableHeader}>Event</th>
                  <th style={styles.tableHeader}>Event Date</th>
                  <th style={styles.tableHeader}>Location</th>
                  <th style={styles.tableHeader}>Booked At</th>
                  <th style={styles.tableHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const isExpired = isPastEvent(booking.event_date);
                  return (
                    <tr
                      key={booking.id}
                      style={styles.tableRow}
                      className="table-row"
                    >
                      <td style={styles.tableCell}>
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={() => handleSelectBooking(booking.id)}
                          style={styles.checkbox}
                        />
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.userCell}>
                          <div style={styles.userAvatar}>
                            {booking.username?.charAt(0).toUpperCase()}
                          </div>
                          <span style={styles.userName}>{booking.username}</span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.emailText}>{booking.email}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.eventTitle}>{booking.event_title}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.dateText}>
                          {formatDate(booking.event_date)}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.locationCell}>
                          <span style={styles.locationIcon}>📍</span>
                          <span>{booking.location}</span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.timestampText}>
                          {formatDateTime(booking.booked_at)}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(isExpired
                              ? styles.statusCompleted
                              : styles.statusActive),
                          }}
                        >
                          {isExpired ? "Completed" : "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected Actions */}
        {selectedBookings.length > 0 && (
          <div style={styles.selectedBar}>
            <span style={styles.selectedText}>
              {selectedBookings.length} booking(s) selected
            </span>
            <button
              onClick={() => setSelectedBookings([])}
              style={styles.clearButton}
            >
              Clear Selection
            </button>
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
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .table-row:hover {
    background-color: #f9fafb;
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .filter-select:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .export-button:hover {
    background-color: #059669;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    .controlsBar {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .filters {
      flex-direction: column !important;
    }

    .statsBar {
      flex-wrap: wrap !important;
    }

    .tableContainer {
      overflow-x: auto !important;
    }
  }
`;

/* ================= INLINE STYLES ================= */

const styles = {
  container: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "2rem",
  },
  header: {
    marginBottom: "2rem",
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
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 1rem",
  },
  errorContainer: {
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "white",
    borderRadius: "12px",
  },
  errorTitle: {
    color: "#dc2626",
    marginBottom: "0.5rem",
  },
  errorText: {
    color: "#6b7280",
    marginBottom: "1.5rem",
  },
  btnBack: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  controlsBar: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchWrapper: {
    position: "relative",
    flex: "1 1 300px",
    minWidth: "250px",
  },
  searchIcon: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1.25rem",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 3rem",
    fontSize: "0.95rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  filters: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  select: {
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
    fontWeight: "500",
    color: "#374151",
  },
  exportButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  statsBar: {
    display: "flex",
    gap: "2rem",
    padding: "1rem 1.5rem",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    marginBottom: "1.5rem",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "1.125rem",
    color: "#1a1a1a",
    fontWeight: "700",
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
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    backgroundColor: "#f9fafb",
  },
  tableHeader: {
    padding: "1rem",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #e5e7eb",
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  tableCell: {
    padding: "1rem",
    fontSize: "0.875rem",
    color: "#374151",
  },
  checkbox: {
    width: "1rem",
    height: "1rem",
    cursor: "pointer",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "0.875rem",
  },
  userName: {
    fontWeight: "600",
    color: "#1a1a1a",
  },
  emailText: {
    color: "#6b7280",
    fontSize: "0.875rem",
  },
  eventTitle: {
    fontWeight: "500",
    color: "#1a1a1a",
  },
  dateText: {
    color: "#374151",
  },
  locationCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  locationIcon: {
    fontSize: "1rem",
  },
  timestampText: {
    color: "#6b7280",
    fontSize: "0.8rem",
  },
  statusBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusActive: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusCompleted: {
    backgroundColor: "#e5e7eb",
    color: "#4b5563",
  },
  selectedBar: {
    position: "fixed",
    bottom: "2rem",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#1a1a1a",
    color: "white",
    padding: "1rem 2rem",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
    animation: "fadeIn 0.3s",
  },
  selectedText: {
    fontSize: "0.95rem",
    fontWeight: "600",
  },
  clearButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "white",
    color: "#1a1a1a",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default AdminBookings;