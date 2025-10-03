import React, { useEffect, useState } from "react";
import axios from "axios";
import "./servicelist.css"; // Ensure styling similar to FlowerList

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("/api/services");
        setServices(response.data);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading services.</div>;
  }

  return (
    <div className="services-list">
      <h2>Our Professional Salon Services</h2>
      <div className="services-grid">
        {services.map((service) => (
          <div className="service-card" key={service.id}>
            <img
              src={service.imageUrl || require("../images/default-service.jpg")} // Default image if service image is unavailable
              alt={service.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = require("../images/default-service.jpg");
              }}
            />
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <p>
              <strong>Price:</strong> ${service.price}
            </p>
            <p>
              <strong>Duration:</strong> {service.duration} mins
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesList;
