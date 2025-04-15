import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "./helpubuil-web-logo.webp";
import "./header.css";
import { GetData } from "../utils/sessionStoreage";
import axios from "axios";
import toast from "react-hot-toast";
import { isTokenValid } from "./isTokenValid/isTokenValid";

const Header = () => {
  const [allChat, setAllChat] = useState(0)
  const [sessionData, setSessionData] = useState({
    isAuthenticated: false,
    user: null,
    role: '',
    isProfileComplete: false,
    dashboard: ''
  });

  const [checkUserData, setCheckUserData] = useState(null)

  const findToken = GetData('token')

  // useEffect(() => {
  //   const isLoggedIn = isTokenValid();
  //   if (!isLoggedIn) {
  //     localStorage.clear();
  // Redirect to login if needed
  // navigate('/login');
  // window.location.href = '/';
  //   }
  // }, [])


  const [scrollValue, setScrollValue] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollValue(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fetchChatProverId = async () => {
    const Data = GetData('user')
    const UserData = JSON.parse(Data)
    if (!UserData) {
      return toast.error("Please Login First");
    }

    try {
      const url = UserData?.role === "provider"
        ? `https://api.helpubuild.co.in/api/v1/get-chat-by-providerId/${UserData._id}`
        : `https://api.helpubuild.co.in/api/v1/get-chat-by-userId/${UserData._id}`;

      const { data } = await axios.get(url);
      const fullData = data.data
      const filter = fullData.filter(item => item.newChat === true)
      // console.log('allData', filter)
      const allData = filter.length;
      setAllChat(allData);
    } catch (error) {
      console.error("Internal server error", error);
    }
  };

  useEffect(() => {
    fetchChatProverId();
  }, [])

  const handleChatRead = async () => {
    // Get user data from local storage or other storage mechanism
    const Data = GetData('user');
    const UserData = JSON.parse(Data);
    if (!UserData) {
      return;
    }

    if (UserData.role !== 'provider') {
      return;
    }

    // Check if the user role is 'user' or 'provider' and call the corresponding API route
    try {
      let response;
      const url = `https://api.helpubuild.co.in/api/v1/mark-${UserData.role}-chats-as-read/${UserData._id}`;

      // Use axios to make the request
      response = await axios.put(url);

      // Handle successful response
      // console.log(`${UserData.role} chats marked as read:`, response.data);

    } catch (error) {
      // Handle error
      console.log("Internal server error", error)
      console.error(`Error marking ${UserData.role} chats as read:`, error.response ? error.response.data.message : error.message);
    }
  };

  useEffect(() => {
    const isAuthenticatedValue = GetData('islogin')
    // console.log('islogin', isAuthenticatedValue)
    const convertToBoolean = Boolean(isAuthenticatedValue);

    setSessionData(prevState => ({
      ...prevState,
      isAuthenticated: convertToBoolean
    }));

    const Data = GetData('user')
    const UserData = JSON.parse(Data)

    // Check if UserData exists and has a role
    if (UserData && UserData.role === 'provider') {
      setSessionData(prevState => ({
        ...prevState,
        user: UserData,
        role: UserData.role,
        isProfileComplete: UserData.isProfileComplete || false,
      }));
      setCheckUserData(UserData)
    }
  }, []);

  useEffect(() => {
    console.log("checkUserData", checkUserData)
    // if (checkUserData && checkUserData.isMember === false) {
    //   setSessionData({
    //     isAuthenticated: false,
    //     user: null,
    //     role: '',
    //     isProfileComplete: false,
    //     dashboard: ''
    //   });
    //   window.location.href = '/';
    // }
  }, [checkUserData])
  // console.log(sessionData)
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);

  // console.log("sessionData",sessionData)

  useEffect(() => {
    setActive(location.pathname);
  }, [location]);

  // console.log("i am sss", findToken);

  return (
    <div>
      <section className={`as_header_wrapper ${scrollValue > 200 ? "fixed-header" : ""}`}>
        <div className="container-fluid">
          <div className="row py-2">
            <div className="col-lg-2 col-md-2 col-sm-2 col-xs-6 forlogoresponsive">
              <div className="as_logo d-none d-md-block">
                <Link onClick={handleLinkClick} to={"/"}>
                  <img src={logo} className="img-responsive sm-screen-logo" alt="" />
                </Link>
              </div>
            </div>
            <div className="col-lg-10 col-md-10 col-sm-10 col-xs-6">
              <div className="as_right_info">
                <div className={`as_menu_wrapper ${isOpen ? "menu_open" : ""}`}>
                  <div className="showsmall">
                    <div className="as_logo">
                      <Link onClick={handleLinkClick} to={"/"}>
                        <img src={logo} className="img-responsive ws" alt="" />
                      </Link>
                    </div>
                    <div>
                      <span onClick={handleOpen} className="as_toggle">
                        <img src="assets/images/svg/menu.svg" alt="" />
                      </span>
                    </div>
                  </div>

                  <div className="as_menu">
                    <ul>
                      <li>
                        <Link style={{ color: 'black' }} onClick={handleLinkClick} to="/" className={active === "/" ? "active" : ""}>
                          home
                        </Link>
                      </li>
                      <li>
                        <Link style={{ color: 'black' }} onClick={handleLinkClick} to="/talk-to-architect" className={active === "/talk-to-architect" ? "active" : ""}>
                          Talk to Architect
                        </Link>
                      </li>
                      <li>
                        <Link style={{ color: 'black' }} onClick={handleLinkClick} to="/talk-to-interior" className={active === "/talk-to-interior" ? "active" : ""}>
                          Talk to Interior Designer
                        </Link>
                      </li>
                      <li>
                        <Link style={{ color: 'black' }} onClick={handleLinkClick} to="/Vastu" className={active === "/Vastu" ? "active" : ""}>
                          Talk to Vastu Expert
                        </Link>
                      </li>
                      <li>
                        <Link style={{ color: 'black' }} onClick={handleLinkClick} to="/blog" className={active === "/blog" ? "active" : ""}>
                          blog
                        </Link>
                      </li>
                      {
                        findToken && (
                          <>
                            {sessionData?.user?.role === 'provider' ? (
                              <li>
                                <Link
                                  onClick={() => {
                                    handleChatRead(); // Call handleChatRead after clicking the link
                                    handleLinkClick();
                                  }}
                                  to="/chat"
                                  className={active === "/chat" ? "active" : ""}
                                >
                                  {
                                    allChat > 0 ? (
                                      <>
                                        Chat
                                        <span className="badge-chat">
                                          {allChat}

                                        </span></>
                                    ) :
                                      (
                                        <>
                                          Chat
                                          {/* <span className="badge-chat">
                                            0
                                          </span> */}
                                        </>
                                      )
                                  }
                                </Link>
                              </li>
                            ) : (
                              <li>
                                <Link
                                  onClick={() => {
                                    // handleChatRead(); 
                                    handleLinkClick();
                                  }}
                                  to="/chat"
                                  className={active === "/chat" ? "active" : ""}
                                >
                                  Chat
                                </Link>
                              </li>
                            )
                            }
                          </>
                        )
                      }

                      <li>
                        {findToken ? (

                          <Link onClick={handleLinkClick}
                            className={`as_btn ${active === "/Profile" ? "active" : ""}`}
                            to={`${sessionData?.user?.role === 'provider' ? `/profile?role=${sessionData.role}` : `/user-profile`
                              }`}
                          >
                            Profile
                          </Link>
                        ) : (
                          // <Link onClick={handleLinkClick}
                          //   className={`as_btn ${active === "/Login" ? "active" : ""}`}
                          //   to="/login"
                          // >
                          //   Login
                          // </Link>
                          <div class="dropdown">
                            <button class="btn dropdown-toggle" style={{ backgroundColor: '#EAB936', color: 'white' }} type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              Login
                            </button>
                            <div class="dropdown-menu" style={{ left: '-46%' }} aria-labelledby="dropdownMenuButton">
                              <a class="dropdown-item" href="/login">Login as User</a>
                              <a class="dropdown-item" href="/partner-login">Login as Partner</a>
                            </div>
                          </div>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Header;
