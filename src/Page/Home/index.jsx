import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import "./index.css";
import "./reviewlist";
import "./servicelist";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header Section */}

      <header className="hero">
        <div className="overlay"></div>
        <h1 className="salon-name">
          Electric Vehicle Dealer Management System
        </h1>
        <div className="hero-content">
          <h1>
            Smart Platform for Managing Electric Vehicle Sales Through
            Dealerships
          </h1>
          <p>
            Streamline your dealership operations — from vehicle listings and
            sales tracking to customer management and performance analytics.
          </p>
          <div className="hero-buttons">
            <a href="#appointment" className="btn-primary">
              Book An Appointment
            </a>
            <a href="#services" className="btn-secondary">
              Browse Services
            </a>
          </div>
          <div className="navbar-contact">
            <button className="contact-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>

          <div className="navbar">
            <div className="navbar-brand">
              <img
                src="image.png/z5936479637733_515621b0f5a2790d08fe028260980c4c.png"
                alt="Logo"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Contact Info Section */}
      <section className="contact-info">
        <div className="container">
          <div className="contact-box">
            <div className="row">
              <div className="col">
                <img src="" alt="Location" />
                <a href="your-location-link" className="contact-link">
                  <p>Location</p>
                </a>
              </div>
              <div className="col">
                <img src="" alt="Phone" />
                <a href="tel:your-phone-number" className="contact-link">
                  <p>Phone Number</p>
                </a>
              </div>
              <div className="col">
                <img src="" alt="Hours" />
                <a href="your-hours-link" className="contact-link">
                  <p>Working Hours</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction about the salon */}
      <div className="services-container">
        <div className="contact-box1">
          <div className="text-section">
            <h1>Your Smart Platform for Managing Electric Vehicle Sales</h1>
            <p>
              Welcome to our Electric Vehicle Dealer Management System (EVDMS)!
              We understand that managing multiple dealerships and electric
              vehicle inventories can be challenging — that’s why we provide a
              comprehensive and efficient platform to streamline your
              operations. Our system is designed to help dealers, managers, and
              manufacturers stay connected in one unified ecosystem. With EVDMS,
              you can easily manage vehicle listings, track customer orders,
              monitor deliveries, and handle payments all in one place. We
              empower businesses to analyze performance, optimize sales, and
              improve customer satisfaction through smart data insights and
              automation tools. Whether you are running a single dealership or
              managing multiple locations, our platform ensures you stay ahead
              in the fast-growing electric vehicle market.
            </p>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-value">99%</span>
                <span className="stat-label">Customer Satisfaction</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">10+</span>
                <span className="stat-label">Years of Experience</span>
              </div>
            </div>
          </div>
          <div className="image-section">
            <img src="" alt="" />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <servicelist />

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container text-center">
          <h2>Why Choose Us</h2>
          <div className="row">
            <div className="col">
              <img src="" alt="Licensed" />
              <h4>LICENSED</h4>
              <p>
                Our team of licensed and insured barbers follow strict
                cleanliness and sanitation guidelines for a safe and comfortable
                experience.
              </p>
            </div>
            <div className="col">
              <img src="" alt="Masters" />
              <h4>MASTERS</h4>
              <p>
                Our barbers are passionate about their craft and aim to provide
                high-quality haircuts for every client.
              </p>
            </div>
            <div className="col">
              <img src="" alt="Trusted" />
              <h4>TRUSTED</h4>
              <p>
                We have a strong online reputation with a 5-star rating from
                over 100 thousand satisfied clients.
              </p>
            </div>
          </div>
        </div>
        <reviewlist />
      </section>

      {/* Appointment Section */}
      <section id="appointment" className="appointment">
        <div className="container appointment-wrapper">
          <div className="description">
            <h2>Why Make an Appointment?</h2>
            <p>
              Schedule your appointment with us to get professional advice and
              support at your convenience. We offer personalized services
              tailored to your needs. Whether you need consultation or specific
              guidance, our team is here to assist you.
            </p>
            <ul>
              <li>Professional services</li>
              <li>Personalized recommendations</li>
              <li>Flexible timing</li>
              <li>Dedicated support</li>
            </ul>
          </div>
          <div className="form-container">
            <h2>Make an Appointment</h2>
            <form className="form">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />

              {/* Dropdown for stylist selection */}
              <select placeholder="Select a Stylist" required>
                <option value="" disabled selected>
                  Select a Stylist
                </option>
                <option value="stylist1">Stylist 1</option>
                <option value="stylist2">Stylist 2</option>
                <option value="stylist3">Stylist 3</option>
              </select>

              {/* Dropdown for service selection */}
              <select placeholder="Select a Service" required>
                <option value="" disabled selected>
                  Select a Service
                </option>
                <option value="service1">Service 1</option>
                <option value="service2">Service 2</option>
                <option value="service3">Service 3</option>
                <option value="service4">Service 4</option>
              </select>

              {/* Date-time picker for preferred date & time */}
              <input type="datetime-local" required />

              <textarea placeholder="Additional Info"></textarea>
              <button type="submit" className="btn">
                Book Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-info">
            <h4>About Us</h4>
            <p>
              We are a premier hair salon dedicated to providing exceptional
              services and ensuring customer satisfaction. Your beauty is our
              passion!
            </p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="/services" className="footer-link">
              Services
            </a>
            <a href="/about" className="footer-link">
              About Us
            </a>
            <a href="/contact" className="footer-link">
              Contact
            </a>
            <a href="/privacy" className="footer-link">
              Privacy Policy
            </a>
            <a href="/terms" className="footer-link">
              Terms of Service
            </a>
          </div>
          <div className="footer-social">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/path/to/facebook-icon.png" alt="Facebook" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/path/to/instagram-icon.png" alt="Instagram" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/path/to/twitter-icon.png" alt="Twitter" />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
