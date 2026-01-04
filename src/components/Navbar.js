import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState({
    username: "",
    isAdmin: false,
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // 🔹 Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get("me/");
        setUser({
          username: response.data.username,
          isAdmin: response.data.is_admin,
          email: response.data.email || "",
        });
      } catch (err) {
        localStorage.clear();
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  const getUserInitials = () =>
    user.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <header style={styles.navbar}>
        <div style={styles.container}>
          <span style={styles.logo}>EventBooker</span>
        </div>
      </header>
    );
  }

  return (
    <header style={styles.navbar}>
      <div style={styles.container}>

        {/* LOGO */}
        <div style={styles.logoSection} onClick={() => navigate("/events")}>
          <div style={styles.logoIcon}>🎫</div>
          <span style={styles.logo}>EventBooker</span>
        </div>

        {/* DESKTOP NAV */}
        <nav style={styles.navLinks}>
          <NavButton label="Events" icon="🎉" onClick={() => navigate("/events")} active={isActive("/events")} />
          <NavButton label="My Bookings" icon="📋" onClick={() => navigate("/my-bookings")} active={isActive("/my-bookings")} />

          {user.isAdmin && (
            <>
              <div style={styles.divider}></div>

              {/* ✅ FIXED ROUTE */}
              <NavButton
                label="Create Event"
                icon="➕"
                onClick={() => navigate("/create-event")}
                active={isActive("/create-event")}
                variant="primary"
              />

              <NavButton
                label="Dashboard"
                icon="📊"
                onClick={() => navigate("/admin-dashboard")}
                active={isActive("/admin-dashboard")}
                variant="admin"
              />

              <NavButton
                label="All Bookings"
                icon="📑"
                onClick={() => navigate("/admin/bookings")}
                active={isActive("/admin/bookings")}
                variant="admin"
              />
            </>
          )}
        </nav>

        {/* USER SECTION */}
        <div style={styles.userSection}>
          <div style={styles.userDropdown}>
            <button style={styles.userButton} onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div style={styles.avatar}>{getUserInitials()}</div>
              <span>{user.username}</span>
              {user.isAdmin && <span style={styles.adminBadge}>ADMIN</span>}
            </button>

            {userMenuOpen && (
              <div style={styles.dropdownMenu}>
                <button style={styles.dropdownItem} onClick={logout}>🚪 Logout</button>
              </div>
            )}
          </div>

          <button style={styles.mobileMenuButton} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <MobileNavButton label="Events" icon="🎉" onClick={() => navigate("/events")} />
          <MobileNavButton label="My Bookings" icon="📋" onClick={() => navigate("/my-bookings")} />

          {user.isAdmin && (
            <>
              {/* ✅ FIXED ROUTE */}
              <MobileNavButton label="Create Event" icon="➕" onClick={() => navigate("/create-event")} />
              <MobileNavButton label="Dashboard" icon="📊" onClick={() => navigate("/admin-dashboard")} />
              <MobileNavButton label="All Bookings" icon="📑" onClick={() => navigate("/admin/bookings")} />
            </>
          )}

          <MobileNavButton label="Logout" icon="🚪" onClick={logout} />
        </div>
      )}
    </header>
  );
}

/* BUTTON COMPONENTS */
function NavButton({ label, icon, onClick, active, variant }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.navBtn,
        ...(active ? styles.navBtnActive : {}),
        ...(variant === "primary" ? styles.primaryBtn : {}),
        ...(variant === "admin" ? styles.adminBtn : {}),
      }}
    >
      {icon} {label}
    </button>
  );
}

function MobileNavButton({ label, icon, onClick }) {
  return (
    <button onClick={onClick} style={styles.mobileNavBtn}>
      {icon} {label}
    </button>
  );
}

/* STYLES */
const styles = {
  navbar: { backgroundColor: "#1e40af", position: "sticky", top: 0, zIndex: 1000 },
  container: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" },
  logoSection: { display: "flex", alignItems: "center", cursor: "pointer", gap: "8px" },
  logoIcon: { fontSize: "24px" },
  logo: { fontSize: "20px", fontWeight: "bold", color: "white" },
  navLinks: { display: "flex", gap: "10px" },
  divider: { width: "1px", backgroundColor: "#ccc" },
  navBtn: { background: "transparent", color: "white", border: "none", cursor: "pointer" },
  navBtnActive: { backgroundColor: "rgba(255,255,255,0.2)" },
  primaryBtn: { backgroundColor: "#16a34a" },
  adminBtn: { backgroundColor: "#7c3aed" },
  userSection: { display: "flex", gap: "10px" },
  avatar: { backgroundColor: "#3b82f6", color: "white", borderRadius: "50%", padding: "6px" },
  adminBadge: { backgroundColor: "green", color: "white", padding: "2px 6px", marginLeft: "6px" },
  dropdownMenu: { position: "absolute", backgroundColor: "white", right: 0 },
  dropdownItem: { padding: "8px", border: "none", width: "100%" },
  mobileMenuButton: { background: "none", color: "white", fontSize: "22px" },
  mobileMenu: { backgroundColor: "#1e3a8a", padding: "10px" },
  mobileNavBtn: { width: "100%", padding: "10px", color: "white", background: "none", border: "none" },
};

export default Navbar;
