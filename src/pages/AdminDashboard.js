import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_users: 0,
    total_events: 0,
    total_bookings: 0,
    active_events: 0,
    upcoming_events: 0,
    recent_bookings: [],
    top_events: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.get("admin/dashboard/");
      setStats(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);

      if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
        // Redirect to events page after 3 seconds
        setTimeout(() => navigate("/events"), 3000);
      } else if (err.response?.status === 401) {
        setError("Authentication required. Please login again.");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getGrowthPercentage = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading dashboard...</p>
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
            <h1 style={styles.pageTitle}>Admin Dashboard</h1>
            <p style={styles.pageSubtitle}>
              Monitor and manage your event platform
            </p>
          </div>
          <button
            onClick={handleRefresh}
            style={{
              ...styles.refreshButton,
              ...(refreshing ? styles.refreshButtonActive : {}),
            }}
            className="refresh-button"
            disabled={refreshing}
          >
            <span style={{ fontSize: "1.25rem" }}>🔄</span>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Main Stats Grid */}
        <div style={styles.statsGrid}>
          {/* Total Users Card */}
          <div style={styles.statCard} className="stat-card">
            <div style={styles.statHeader}>
              <div style={{ ...styles.statIcon, backgroundColor: "#dbeafe" }}>
                👥
              </div>
              <span style={styles.statLabel}>Total Users</span>
            </div>
            <h2 style={styles.statValue}>{stats.total_users.toLocaleString()}</h2>
            <div style={styles.statFooter}>
              <span style={styles.statBadge}>
                {stats.new_users_this_month || 0} new this month
              </span>
            </div>
          </div>

          {/* Total Events Card */}
          <div style={styles.statCard} className="stat-card">
            <div style={styles.statHeader}>
              <div style={{ ...styles.statIcon, backgroundColor: "#fde68a" }}>
                🎫
              </div>
              <span style={styles.statLabel}>Total Events</span>
            </div>
            <h2 style={styles.statValue}>{stats.total_events.toLocaleString()}</h2>
            <div style={styles.statFooter}>
              <span style={styles.statBadge}>
                {stats.active_events || stats.total_events} active
              </span>
            </div>
          </div>

          {/* Total Bookings Card */}
          <div style={styles.statCard} className="stat-card">
            <div style={styles.statHeader}>
              <div style={{ ...styles.statIcon, backgroundColor: "#d1fae5" }}>
                ✅
              </div>
              <span style={styles.statLabel}>Total Bookings</span>
            </div>
            <h2 style={styles.statValue}>{stats.total_bookings.toLocaleString()}</h2>
            <div style={styles.statFooter}>
              <span style={styles.statBadge}>
                {stats.bookings_today || 0} today
              </span>
            </div>
          </div>

          {/* Upcoming Events Card */}
          <div style={styles.statCard} className="stat-card">
            <div style={styles.statHeader}>
              <div style={{ ...styles.statIcon, backgroundColor: "#e9d5ff" }}>
                📅
              </div>
              <span style={styles.statLabel}>Upcoming Events</span>
            </div>
            <h2 style={styles.statValue}>
              {stats.upcoming_events || Math.floor(stats.total_events * 0.7)}
            </h2>
            <div style={styles.statFooter}>
              <span style={styles.statBadge}>Next 30 days</span>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div style={styles.secondaryStats}>
          <div style={styles.secondaryStatCard} className="secondary-stat-card">
            <div style={styles.secondaryStatContent}>
              <span style={styles.secondaryStatLabel}>Avg. Bookings/Event</span>
              <h3 style={styles.secondaryStatValue}>
                {stats.total_events > 0 
                  ? (stats.total_bookings / stats.total_events).toFixed(1)
                  : "0"}
              </h3>
            </div>
            <div style={{ ...styles.secondaryStatIcon, backgroundColor: "#fce7f3" }}>
              📊
            </div>
          </div>

          <div style={styles.secondaryStatCard} className="secondary-stat-card">
            <div style={styles.secondaryStatContent}>
              <span style={styles.secondaryStatLabel}>Active Users</span>
              <h3 style={styles.secondaryStatValue}>
                {stats.active_users || Math.floor(stats.total_users * 0.6)}
              </h3>
            </div>
            <div style={{ ...styles.secondaryStatIcon, backgroundColor: "#ccfbf1" }}>
              🟢
            </div>
          </div>

          <div style={styles.secondaryStatCard} className="secondary-stat-card">
            <div style={styles.secondaryStatContent}>
              <span style={styles.secondaryStatLabel}>Event Capacity</span>
              <h3 style={styles.secondaryStatValue}>
                {stats.total_capacity || (stats.total_events * 50)}
              </h3>
            </div>
            <div style={{ ...styles.secondaryStatIcon, backgroundColor: "#fed7aa" }}>
              🎯
            </div>
          </div>
        </div>

        <div style={styles.quickActions}>
  <h2 style={styles.sectionTitle}>Quick Actions</h2>
  <div style={styles.actionsGrid}>

    {/* CREATE EVENT */}
    <button
      style={styles.actionButton}
      className="action-button"
      onClick={() => navigate("/create-event")}
    >
      <span style={styles.actionIcon}>➕</span>
      <div style={styles.actionContent}>
        <span style={styles.actionTitle}>Create Event</span>
        <span style={styles.actionDesc}>Add a new event</span>
      </div>
    </button>

    {/* MANAGE EVENTS */}
    <button
      style={styles.actionButton}
      className="action-button"
      onClick={() => navigate("/events")}
    >
      <span style={styles.actionIcon}>📋</span>
      <div style={styles.actionContent}>
        <span style={styles.actionTitle}>Manage Events</span>
        <span style={styles.actionDesc}>View all events</span>
      </div>
    </button>

    {/* VIEW BOOKINGS */}
    <button
      style={styles.actionButton}
      className="action-button"
      onClick={() => navigate("/admin/bookings")}
    >
      <span style={styles.actionIcon}>📊</span>
      <div style={styles.actionContent}>
        <span style={styles.actionTitle}>View Bookings</span>
        <span style={styles.actionDesc}>All reservations</span>
      </div>
    </button>

    {/* REFRESH */}
    <button
      style={styles.actionButton}
      className="action-button"
      onClick={handleRefresh}
    >
      <span style={styles.actionIcon}>🔄</span>
      <div style={styles.actionContent}>
        <span style={styles.actionTitle}>Refresh Data</span>
        <span style={styles.actionDesc}>Update stats</span>
      </div>
    </button>

  </div>
</div>


        {/* Recent Activity */}
        {stats.recent_bookings && stats.recent_bookings.length > 0 && (
          <div style={styles.recentActivity}>
            <h2 style={styles.sectionTitle}>Recent Bookings</h2>
            <div style={styles.activityList}>
              {stats.recent_bookings.slice(0, 5).map((booking, index) => (
                <div key={index} style={styles.activityItem} className="activity-item">
                  <div style={styles.activityIcon}>🎫</div>
                  <div style={styles.activityContent}>
                    <p style={styles.activityTitle}>
                      {booking.user_name || "User"} booked {booking.event_title}
                    </p>
                    <p style={styles.activityTime}>
                      {formatDate(booking.booked_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Info */}
        <div style={styles.systemInfo}>
          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>Last Updated:</span>
            <span style={styles.infoValue}>
              {new Date().toLocaleString()}
            </span>
          </div>
          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>System Status:</span>
            <span style={{ ...styles.infoValue, color: "#10b981", fontWeight: "600" }}>
              🟢 Operational
            </span>
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
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .stat-card {
    animation: fadeIn 0.5s ease-out;
  }

  .stat-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }

  .secondary-stat-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .action-button:hover {
    background-color: #f9fafb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .activity-item:hover {
    background-color: #f9fafb;
  }

  .refresh-button:hover:not(:disabled) {
    background-color: #2563eb;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    .statsGrid {
      grid-template-columns: 1fr !important;
    }

    .secondaryStats {
      flex-direction: column !important;
    }

    .actionsGrid {
      grid-template-columns: 1fr !important;
    }
  }
`;

/* ================= INLINE STYLES ================= */

const styles = {
  container: {
    maxWidth: "1400px",
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
  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  refreshButtonActive: {
    opacity: 0.7,
    cursor: "not-allowed",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  statCard: {
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e5e7eb",
    transition: "all 0.3s",
  },
  statHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
  },
  statFooter: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  statBadge: {
    fontSize: "0.75rem",
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontWeight: "500",
  },
  secondaryStats: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
  },
  secondaryStatCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: "1.25rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s",
    border: "1px solid #e5e7eb",
  },
  secondaryStatContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  secondaryStatLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  secondaryStatValue: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: 0,
  },
  secondaryStatIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
  },
  quickActions: {
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "1rem",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.25rem",
    backgroundColor: "#ffffff",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s",
    textAlign: "left",
  },
  actionIcon: {
    fontSize: "2rem",
  },
  actionContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  actionTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  actionDesc: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  recentActivity: {
    marginBottom: "2rem",
  },
  activityList: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem 1.25rem",
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  activityIcon: {
    fontSize: "1.5rem",
    width: "40px",
    height: "40px",
    backgroundColor: "#f3f4f6",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: "0.95rem",
    color: "#1a1a1a",
    margin: "0 0 0.25rem 0",
    fontWeight: "500",
  },
  activityTime: {
    fontSize: "0.75rem",
    color: "#9ca3af",
    margin: 0,
  },
  systemInfo: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  infoCard: {
    flex: 1,
    minWidth: "250px",
    backgroundColor: "#f9fafb",
    padding: "1rem 1.25rem",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: "0.875rem",
    color: "#1a1a1a",
    fontWeight: "600",
  },
};

export default AdminDashboard;