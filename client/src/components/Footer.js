import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import logo from './Help_You_Build__1_-removebg-preview (1).png';
import './footer.css';
import { GetData } from '../utils/sessionStoreage';
import axios from 'axios';
import toast from 'react-hot-toast';

const quickLinks = [
  { to: '/member-registration', text: 'Become A Partner', key: 'partner' },
  { to: '/about', text: 'About Us' },
  { to: '/blog', text: 'Blog' },
  { to: '/contact', text: 'Contact Us' },
  // { to: '/mobile_card', text: 'Mobile Card' },
];

const serviceLinks = [
  { to: '/talk-to-architect', text: 'Talk to Architect' },
  { to: '/talk-to-interior', text: 'Talk to Interior Designer' },
  { to: '/vastu', text: 'Talk to Vastu Experts' },
];
const legalLinks = [
  { to: '/privacy-policy', text: 'Privacy Policy' },
  { to: '/cancellation-refund-policy', text: 'Cancellation & Refund Policy' },
  { to: '/disclaimer', text: 'Disclaimer' },
  { to: '/terms-and-conditions', text: 'Terms & Conditions' },
];


const Footer = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(null)

  useEffect(() => {
    // const GetToken = () => {
    const data = GetData('token');
    if (data) {
      setToken(data);
    }
    // };

  }, [])

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://api.helpubuild.in/api/v1/create_newletter', { email });
      toast.success(res.data.message);
      setEmail('');
    } catch (error) {
      console.log("Internal sever error",error)
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-widget">
            <img src={logo} alt="Help U Build" className="footer-logo" />
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <MapPin className="footer-contact-icon" />
                <p style={{color:'white'}}>E-520A, 3rd Floor, Sector 7, Dwarka, New Delhi- 110075</p>
              </li>
              <li className="footer-contact-item">
                <Phone className="footer-contact-icon" />
                <a style={{color:'white'}} href="tel:+919220441214">+91 9220441214</a>
              </li>
              <li className="footer-contact-item">
                <Mail className="footer-contact-icon" />
                <a style={{color:'white'}} href="mailto:info@helpubuild.in">info@helpubuild.in</a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-widget">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              {quickLinks
                .filter((link) => !(token && link.key === 'partner')) // Remove "Become A Partner" if token exists
                .map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.text}</Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Legal Links */}


          {/* Services */}
          <div className="footer-widget">
            <h3>Our Services</h3>
            <ul className="footer-links">
              {serviceLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-widget">
            <h3>Legal</h3>
            <ul className="footer-links">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Newsletter */}
          <div className="footer-widget">
            <h3>Newsletter</h3>
            <p>Subscribe for insights on architecture, interior design, Vastu tips, and exclusive offers.</p>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <div className="newsletter-input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-button">
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>Copyright © {new Date().getFullYear()} Help U Build. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;