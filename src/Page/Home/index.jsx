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
        <h1 className="salon-name">Modern Hair Salon</h1>
        <div className="hero-content">
          <h1>The Ultimate Convenience for Busy People</h1>
          <p>Experience the Convenience of In-home Barber Services</p>
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
                <img
                  src="https://s3-alpha-sig.figma.com/img/0b0d/ddc5/2ce05b0747ed7d35db5aa1a8b682ecda?Expires=1728864000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=iAxOkdFG9yhFZ1BatnN7DELMtMzUc~tilwMJAMivMn0HTefneqPUIc6B69fF1fUDwoOxfG3CydUiBEGKpbgod-A8UV2LcVScUlJPOLMCJx4h1E24ezfJybMAaPBDHRlpXhnfeBd4qyqTFWSb40xiIkFolIaFCguAXfygIcMzVnrp1vup3PvWGhpcf46euZXEnJZy96ngqMFzK1d2zd4BN6XqdYIuPwmqeIZA0s9rvyYwXlwW0voZkjvDnhzPiy-EZ-ku0s7c0XFW~CISPOIj9FRSOc78dITG4-3TvFYG4BsMBUbCEqu2KGDyJI~eB~aTe5jKMUcCpThDT4-uwg4aMg__"
                  alt="Location"
                />
                <a href="your-location-link" className="contact-link">
                  <p>Location</p>
                </a>
              </div>
              <div className="col">
                <img
                  src="https://s3-alpha-sig.figma.com/img/a788/6c55/528f6e197789a4b7d647dd63cdc250d2?Expires=1728864000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=hTgp-nSML43hBhYre23mteqKlAzjw4MnLduDun4Dci~2y98AvvKhOKut3mlbeK0pK1sW5dvpcPu4PSdGZ-f1HHc5PARPw49-PjW1nMpD5bs4I-yRS6mnKku8h0WEJLwNT~7AxPP1qPg6sF~Xh-~C~m6FycdCp1QJs1cL3Rmz7tpzMA1j2P0BwQn5rkKEKDuuXyPIDxK6TyCbXXTs4obisUwEDSr5GVCR~pOQ8Pwaa-ElBhRP7HSKTDlJqy8LWi0dov4~pdsaKud2Cr3MAQtzW8SIKEJtCXvRbY9SzBsQ5TCJkjwF1JeShVPAVbN5nNDv6TEJcV84A4X5lPsKTLQ0jA__"
                  alt="Phone"
                />
                <a href="tel:your-phone-number" className="contact-link">
                  <p>Phone Number</p>
                </a>
              </div>
              <div className="col">
                <img
                  src="https://s3-alpha-sig.figma.com/img/4212/47a6/4d4ffe9584c9b1f509043b4a63f30000?Expires=1728864000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=emEw8jmUAF-hiO0NndP5Xbigw0atbiyI8yHIXsI5X88qIQdU1RIe-E5oAQGmqWEipqm9Ofq0ytbSzjL5kNhkcCeIrph4-odegnHGjQ9YJhOeCyoJMyWusaztRw4RTEYcoV1D29-diwt6Re4FNj4RNZhBcI8ZP5Da2JSLaMc7bF-d1NLljN4U-LExumLE11nnU8-H39XCkkCwxSt1nNAb4OWyFDEHaqsqA01vkQr-1Da~x0g-GSNeY4G9rUXdtegGM7NRAMKPf1-DAcdS5Ycg26oCWtQVrK-ac~Wo3bBJIygfVx-CmlWEwOLd7Fyq9hXoqWI10DZqo5s0tGIKysQYSw__"
                  alt="Hours"
                />
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
            <h1>Your Personal Barber Service at Your Home</h1>
            <p>
              Welcome to our at-home barber service! We understand that your
              time is precious, which is why we bring you a convenient and
              comfortable haircut experience right at your doorstep. With our
              team of professional and experienced barbers, we are committed to
              delivering the latest and most stylish haircuts tailored to your
              needs. Whether you're looking for a simple trim or a complete
              transformation, we have the expertise to meet your every
              requirement. We use high-quality products to ensure that your hair
              not only looks great but also feels healthy. Let us take care of
              your appearance, helping you feel more confident in every
              situation!
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
            <img
              src="https://tocnamdep.com/wp-content/uploads/2020/06/ky-thuat-cat-toc-nam-5.jpg"
              alt="Barber Service"
            />
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
              <img
                src="https://s3-alpha-sig.figma.com/img/652e/25a2/c56f1b1dd6a9f95b94a6b8951fd38637?Expires=1728864000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=SfYn44pFyTdcdD1RRs5k5Zc3kJE~~ZnJFo~kwArZQEidX-bo69AexlSssn0h5tgTUO6G4hS0txMVNjlnh24pv2zI-ejXwZw-W34V8RI0XF0ec6tOBDPsOdLFStExBg6JZ~oUsBY1fbj-Bm6JVIwhrDAmfuFPBrw8xvtaCvbuufdrCNnNwJl2Pu5S9t3tUrirYEw0l8Y~ct4QPzv0o7W5jBlWID9U~bMkJTf8sSreTtMYHDwLzxl~Do9hTgG0GrpHK3zOIma0TpyjPMzQX8L-NoezpoS7rj8rFvyBaixMGAVNfBuvX-i6PDSd0MkQfKrV7NA2gICHQCNEDhuI6W3nVQ__"
                alt="Licensed"
              />
              <h4>LICENSED</h4>
              <p>
                Our team of licensed and insured barbers follow strict
                cleanliness and sanitation guidelines for a safe and comfortable
                experience.
              </p>
            </div>
            <div className="col">
              <img
                src="https://s3-alpha-sig.figma.com/img/6cef/fccd/104a3c309a84c17057ab6c482c8003d7?Expires=1728864000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=c1XTls7DUxDAWI~b~NSg8hIzaw~~In10I5fQqHDXEdaoFRdEriHLWejo1b4PY0nA6L5dMQZ1uST0VSBQMOwOTk0sf8kC8FwLAcskdeh5s-~4WMAWp6xdOXdInwedMn~M5xwITza3uoYdq89Knj-5z0~dC3AsCqik-CYc5zAg7RoQDpxJwEk8zsvTJMDDEwY-yusmlm4cWM8xl4yPWU2K9g2iGpNYOqbq0NostJISbSuMqwKMa1IzRLdwJjmOhxQzXX553usiR-eyiplV5I7SrNQIkYP9UmA9fCGK0o~DfY24b26HlaUgh97VtR6lKJl4n7QFy2YYvr2xFszVwAhstQ__"
                alt="Masters"
              />
              <h4>MASTERS</h4>
              <p>
                Our barbers are passionate about their craft and aim to provide
                high-quality haircuts for every client.
              </p>
            </div>
            <div className="col">
              <img
                src="https://s3-alpha-sig.figma.com/img/84a3/4ca8/26bc530243f112aee5865ac070c1cc86?Expires=1728864000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=WEawIWg7OlcoqNwAjk0bf5HWSLVA91G1JrQT-9iLXqWjWLhDtKBHJpxYh7wvwN9~SPrePJ7iw3icyqg7jiCeLvjJrajM8MiOPDpDMNlIPvr5hFa4RC627ybXKnp1C3YEfu5sM-QvbZ2eYJ-QWhJY3vV68mZllCstE7pQMKTjzsxvLnzQr25sCYjZZO4YmjhVOttY-S55rR5Qr1PT~zLBYRUmN-63ur69HJ3xjsQ150HnSIB-0r~hrORJaA2oSXTTLwI9-8gh9NGfIghjDTWwKQvtH7qftNgAGToZX5CM~KZzgpOh3LkLOCyxKgEOyCuwt5tmwWPXNjcC6ehFknlndA__"
                alt="Trusted"
              />
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
