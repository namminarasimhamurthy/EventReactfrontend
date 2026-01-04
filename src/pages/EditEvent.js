import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
  });

  useEffect(() => {
    API.get("events/")
      .then(res => {
        const event = res.data.find(e => e.id === parseInt(id));
        if (event) setFormData(event);
      })
      .catch(() => alert("Failed to load event"));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    API.put(`events/${id}/update/`, formData)
      .then(() => {
        alert("Event updated successfully ✅");
        navigate("/events");
      })
      .catch(() => alert("Update failed ❌"));
  };

  return (
    <div>
      <Navbar />
      <h2 style={{ margin: "20px" }}>Edit Event</h2>

      <form onSubmit={handleSubmit} style={{ margin: "20px" }}>
        <input name="title" value={formData.title} onChange={handleChange} required /><br /><br />
        <textarea name="description" value={formData.description} onChange={handleChange} required /><br /><br />
        <input name="location" value={formData.location} onChange={handleChange} required /><br /><br />
        <input type="date" name="date" value={formData.date} onChange={handleChange} required /><br /><br />

        <button type="submit">Update Event</button>
      </form>
    </div>
  );
}

export default EditEvent;
