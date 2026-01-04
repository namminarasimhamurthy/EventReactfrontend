import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(null);

  // 🔒 CONTROL FLAG (Create Event button hidden here)
  const SHOW_CREATE_BUTTON = false;

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("events/");
      setEvents(response.data);
    } catch (err) {
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadEvents();
      try {
        const user = await API.get("me/");
        setIsAdmin(user.data.is_admin);
      } catch {
        setIsAdmin(false);
      }
    };
    init();
  }, [loadEvents]);

  const handleBookEvent = async (id) => {
    if (bookingInProgress === id) return;

    try {
      setBookingInProgress(id);
      await API.post(`events/${id}/book/`);
      alert("✅ Booking successful");
      loadEvents();
    } catch (err) {
      alert(err.response?.data?.error || "Booking failed");
    } finally {
      setBookingInProgress(null);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete this event permanently?")) return;

    try {
      await API.delete(`events/${id}/delete/`);
      setEvents(events.filter((e) => e.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const handleEditEvent = (id) => {
    navigate(`/events/${id}/edit`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="events-loader">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="events-error">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={loadEvents}>Retry</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="events-container">
        <div className="events-header">
          <h1>Upcoming Events</h1>

          {/* ❌ Create Event button hidden here */}
          {isAdmin && SHOW_CREATE_BUTTON && (
            <button className="btn-primary" onClick={() => navigate("/events/create")}>
              + Create Event
            </button>
          )}
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <p>No events available</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => {
              const isFull = event.available_slots === 0;
              const isBooking = bookingInProgress === event.id;

              return (
                <div className="event-card" key={event.id}>
                  <div className="event-top">
                    <h3>{event.title}</h3>
                    <span className={isFull ? "badge-full" : "badge-open"}>
                      {isFull ? "FULL" : "OPEN"}
                    </span>
                  </div>

                  <p className="event-desc">{event.description}</p>

                  <div className="event-info">
                    <span>📍 {event.location}</span>
                    <span>📅 {event.date}</span>
                  </div>

                  <div className="event-slots">
                    Slots: {event.available_slots} / {event.capacity}
                  </div>

                  <div className="event-actions">
                    <button
                      className="btn-success"
                      disabled={isFull || isBooking}
                      onClick={() => handleBookEvent(event.id)}
                    >
                      {isBooking ? "Booking..." : isFull ? "Full" : "Book"}
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => handleEditEvent(event.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default Events;
