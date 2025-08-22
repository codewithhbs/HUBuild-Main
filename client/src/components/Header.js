import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "./helpubuil-web-logo.jpeg";
import "./header.css";
import { GetData } from "../utils/sessionStoreage";
import axios from "axios";
import toast from "react-hot-toast";
import { isTokenValid } from "./isTokenValid/isTokenValid";

const Header = () => {
  const [allChat, setAllChat] = useState(0);
  const [sessionData, setSessionData] = useState({
    isAuthenticated: false,
    user: null,
    role: '',
    isProfileComplete: false,
    dashboard: ''
  });
  const [checkUserData, setCheckUserData] = useState(null);
  const [findToken, setFindToken] = useState(null);
  const [scrollValue, setScrollValue] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const location = useLocation();
  const [active, setActive] = useState(location.pathname);

  // Token validation effect
  useEffect(() => {
    console.log("Validating user on mount...");
    const validateUser = async () => {
      const valid = await isTokenValid();
      if (!valid) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    };

    if (findToken) {
      validateUser();
    }
  }, [findToken]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollValue(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Active route effect
  useEffect(() => {
    setActive(location.pathname);
  }, [location]);

  // Session data effect
  useEffect(() => {
    const isAuthenticatedValue = GetData('islogin');
    const convertToBoolean = Boolean(isAuthenticatedValue);
    setFindToken(GetData('token'));

    setSessionData(prevState => ({
      ...prevState,
      isAuthenticated: convertToBoolean
    }));

    const Data = GetData('user');
    const UserData = JSON.parse(Data);

    if (UserData && UserData.role === 'provider') {
      setSessionData(prevState => ({
        ...prevState,
        user: UserData,
        role: UserData.role,
        isProfileComplete: UserData.isProfileComplete || false,
      }));
      setCheckUserData(UserData);
    }
  }, []);

  // Chat data fetching
  const fetchChatProverId = async () => {
    const Data = GetData('user');
    const UserData = JSON.parse(Data);

    if (!UserData) {
      return
    }

    try {
      const url = UserData?.role === "provider"
        ? `https://api.dessobuild.com/api/v1/get-chat-by-providerId/${UserData._id}`
        : `https://api.dessobuild.com/api/v1/get-chat-by-userId/${UserData._id}`;

      const { data } = await axios.get(url);
      const fullData = data.data;
      const filter = fullData.filter(item => item.newChat === true);
      const allData = filter.length;
      setAllChat(allData);
    } catch (error) {
      console.error("Internal server error", error);
    }
  };

  useEffect(() => {
    fetchChatProverId();
  }, []);

  // Handle functions
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  };

  const handleChatRead = async () => {
    const Data = GetData('user');
    const UserData = JSON.parse(Data);

    if (!UserData || UserData.role !== 'provider') {
      return;
    }

    try {
      const url = `https://api.dessobuild.com/api/v1/mark-${UserData.role}-chats-as-read/${UserData._id}`;
      await axios.put(url);
    } catch (error) {
      console.log("Internal server error", error);
    }
  };

  // Payment logic
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (checkUserData && checkUserData.isMember === false) {
      const handlePayment = async (providerId) => {
        try {
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            toast.error("Failed to load Razorpay SDK. Please check your connection.");
            return;
          }

          const res = await axios.post(`https://api.dessobuild.com/api/v1/buy_membership/${providerId}`);
          const order = res.data.data.razorpayOrder;
          const amount = res.data.data.discountAmount;
          const providerData = res.data.data.provider;

          if (order) {
            const options = {
              key: "rzp_live_bmq7YMRTuGvvfu",
              amount: amount * 100,
              currency: "INR",
              name: "Desso Build",
              description: "Buying Membership",
              order_id: order.id,
              callback_url: "https://api.dessobuild.com/api/v1/membership_payment_verify",
              prefill: {
                name: providerData.name,
                email: providerData.email,
                contact: providerData.mobileNumber,
              },
              theme: {
                color: "#F37254",
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
          }
        } catch (error) {
          console.error("Payment error:", error);
          toast.error("Payment failed. Please try again.");
        }
      };

      handlePayment(checkUserData?._id);
    }
  }, [checkUserData]);

  const navigationItems = [
    { path: "/", label: "Home" },
    { path: "/talk-to-architect", label: "Connect with Architect" },
    { path: "/talk-to-interior", label: "Connect with Interior Designer" },
    { path: "/Vastu", label: "Connect with Vastu Expert" },
    { path: "/contact", label: "Contact" }
  ];

  return (
    <header className={`hub-header ${scrollValue > 200 ? "hub-header--fixed" : ""}`}>
      <nav className="navbar navbar-expand-lg hub-header__navbar">
        <div className="container-fluid">
          {/* Logo */}
          <Link className="navbar-brand hub-header__brand" to="/" onClick={handleLinkClick}>
            <img
              src={logo || "/placeholder.svg"}
              alt="Desso Build"
              className="hub-header__logo"
            />
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler hub-header__toggle"
            type="button"
            onClick={handleOpen}
            aria-controls="navbarNav"
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            <span className="hub-header__toggle-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Navigation Menu */}
          <div className={`collapse navbar-collapse hub-header__collapse ${isOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto hub-header__nav">
              {navigationItems.map((item) => (
                <li key={item.path} className="nav-item hub-header__nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link hub-header__nav-link ${active === item.path ? 'hub-header__nav-link--active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {/* Chat Link */}
              {findToken && (
                <li className="nav-item hub-header__nav-item">
                  <Link
                    to="/chat"
                    className={`nav-link hub-header__nav-link hub-header__chat-link ${active === "/chat" ? 'hub-header__nav-link--active' : ''}`}
                    onClick={() => {
                      if (sessionData?.user?.role === 'provider') {
                        handleChatRead();
                      }
                      handleLinkClick();
                    }}
                  >
                    Chat
                    {sessionData?.user?.role === 'provider' && allChat > 0 && (
                      <span className="hub-header__badge">{allChat}</span>
                    )}
                  </Link>
                </li>
              )}

              {/* Live Projects Link */}
              {/* {findToken && (
                <li className="nav-item hub-header__nav-item">
                  <Link
                    to="/manual-chat"
                    className={`nav-link hub-header__nav-link ${active === "/manual-chat" ? 'hub-header__nav-link--active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    Live Projects
                  </Link>
                </li>
              )} */}

              {/* Auth Section */}
              <li className="nav-item hub-header__nav-item hub-header__auth-item">
                {findToken ? (
                  <Link
                    to={sessionData?.user?.role === 'provider'
                      ? `/profile?role=${sessionData.role}`
                      : `/user-profile`}
                    className="btn hub-header__profile-btn"
                    onClick={handleLinkClick}
                  >
                    <i className="fas fa-user me-2"></i>
                    Profile
                  </Link>
                ) : (
                  <div className="dropdown">
                    <button
                      className="btn btn-primary dropdown-toggle custombutton"
                      type="button"
                      id="loginDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Login
                    </button>

                    <ul className="dropdown-menu for-position-right" aria-labelledby="loginDropdown">
                      <li>
                        <a className="dropdown-item" href="/login">
                          <i className="fas fa-user me-2"></i>
                          Login as User
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="/partner-login">
                          <i className="fas fa-handshake me-2"></i>
                          Login as Partner
                        </a>
                      </li>
                    </ul>
                  </div>

                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isOpen && <div className="hub-header__overlay" onClick={handleOpen}></div>}
    </header>
  );
};

export default Header;
