import React, { useEffect, useState } from 'react'
import StarRating from '../../components/StarRating/StarRating'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { GetData } from '../../utils/sessionStoreage'
import { Modal, Button, Form } from 'react-bootstrap';

function TalkToArchitect() {
  const [allProviders, setAllProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const Data = GetData('user')
  const token = GetData('token')
  const UserData = JSON.parse(Data)
  const [walletAmount, setWalletAmount] = useState(0);
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [allProviderService, setAllProviderService] = useState([])
  const [formData, setFormData] = useState({
    userId: '',
    providerId: "",
  })

  const handleFetchUser = async () => {
    try {
      const UserId = UserData?._id;
      const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/get-single-user/${UserId}`);

      const formattedAmount = data.data.walletAmount.toFixed(2);

      setWalletAmount(formattedAmount);
      setRole(data?.data?.role)
    } catch (error) {
      console.log("Internal server error in fetching User")
      toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
    }
  }

  useEffect(() => {
    applyFilters();
  }, [sortCriteria, allProviders, searchText]);

  const handleFetchProvider = async () => {
    try {
      const { data } = await axios.get('https://api.helpubuild.co.in/api/v1/get-all-provider');
      const allData = data.data.filter((item) => item.type === 'Architect');
      const shownProvider = allData.filter((item) => item.accountVerified === 'Verified')
      setAllProviders(shownProvider);
      setFilteredProviders(shownProvider);
    } catch (error) {
      console.error("Internal server error in fetching providers", error);
      toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
    }
  };
  useEffect(() => {
    if (UserData?.role === 'user') {
      handleFetchUser();
    }
    handleFetchProvider();
  }, [])

  useEffect(() => {
    const handleFetchProviderAllService = async () => {
      try {
        setLoading(true)
        const all = await axios.get('https://api.helpubuild.co.in/api/v1/get-all-provider-service');
        const allData = all.data.data
        const filterData = allData.filter((item) => item.category === 'Residential')
        setAllProviderService(filterData)
        setLoading(false)
      } catch (error) {
        console.log("Internal server error", error)
      } finally {
        setLoading(false)
      }
    }
    handleFetchProviderAllService()
  }, [])

  const handleFetchProviderService = async (providerId) => {
    setLoading(true);
    try {
      // Fetch services for the selected category
      const { data } = await axios.get(
        `https://api.helpubuild.co.in/api/v1/get-service-by-provider/${providerId}/Residential`
      );

      // Find the service data for the selected category
      const serviceData = data.data.find(
        (service) => service.category === 'Residential'
      );

      const price = serviceData.conceptDesignWithStructure;

      return price;

    } catch (error) {
      console.error('Error fetching provider data', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let sortedData = [...allProviders];

    // Apply search filter
    if (searchText) {
      sortedData = sortedData.filter(provider =>
        provider.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Sorting logic
    switch (sortCriteria) {
      case "sortByExperience_asc":
        sortedData.sort((a, b) => (a.yearOfExperience || 0) - (b.yearOfExperience || 0));
        break;
      case "sortByExperience_desc":
        sortedData.sort((a, b) => (b.yearOfExperience || 0) - (a.yearOfExperience || 0));
        break;
      case "sortByPrice_asc":
        sortedData.sort((a, b) => (a.pricePerMin || 0) - (b.pricePerMin || 0));
        break;
      case "sortByPrice_desc":
        sortedData.sort((a, b) => (b.pricePerMin || 0) - (a.pricePerMin || 0));
        break;
      case "sortByRating_asc":
        sortedData.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
        break;
      case "sortByRating_desc":
        sortedData.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      default:
        break;
    }

    setFilteredProviders(sortedData);
  };

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value); // Update search text
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProviders = filteredProviders.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleOpenModel = async () => {
    if (!token) {
      return toast.error('Login First!');
    } else if (UserData?.role === 'provider') {
      return toast.error(`You are a provider. You don't have access.`);
    }
    setShowModal(true);
  };

  // Dynamically load the Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCloseModel = () => {
    setShowModal(false);
    setAmount(''); // Reset the amount when closing the modal
  };

  const handlePresetAmount = (preset) => {
    setAmount(preset);
  };

  const handleActiveTime = async (Chat, providerId) => {
    if (!UserData) {
      return toast.error('Login first');
    }

    // console.log("per min",providerId)
    if (UserData.role === 'provider') {
      return toast.error("Access Denied: Providers are not authorized to access this feature.");
    }


    if (!providerId.pricePerMin || providerId.pricePerMin <= 0) {
      return toast.error("Chat cannot be started. Provider pricing information is unavailable or invalid.");
    }

    if (Chat === 'Chat') {
      const newForm = {
        ...formData,
        userId: UserData._id,
        providerId: providerId._id, // Include providerId
      };
      try {
        const res = await axios.post('https://api.helpubuild.co.in/api/v1/create-chat', newForm);
        window.location.href = '/chat';
      } catch (error) {
        console.error("Internal server error", error);
        toast.error(
          error?.response?.data?.errors?.[0] ||
          error?.response?.data?.message ||
          "Please try again later"
        );
      }
    }
  };


  const handleMakePayment = async () => {
    if (!amount || amount <= 0) {
      return toast.error('Please enter a valid amount');
    }
    // toast.success(`Proceeding with payment of ₹${amount}`);
    // handleCloseModel();

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your connection.');
        return;
      }

      const UserId = UserData?._id;

      const res = await axios.post(`https://api.helpubuild.co.in/api/v1/create-payment/${UserId}`, {
        price: amount
      })
      console.log("Order", res.data.data)
      const order = res.data.data.razorpayOrder;

      if (order) {

        const options = {
          key: 'rzp_test_cz0vBQnDwFMthJ',
          amount: amount * 100,
          currency: 'INR',
          name: 'Help U Build',
          description: 'Doing Recharge',
          order_id: order?.id || '',
          callback_url: "https://api.helpubuild.co.in/api/v1/verify-payment",
          prefill: {
            name: UserData?.name,
            email: UserData?.email,
            contact: UserData?.PhoneNumber
          },
          theme: {
            color: '#F37254'
          },
        };

        const rzp = new window.Razorpay(options);

        rzp.open();
      }


    } catch (error) {
      console.log("Internal server error", error)
      toast.error(error?.response?.data?.message || 'Failed to Reacharge. Please try again.');
    }
  };

  const handleFilterProviderService = (id) => {
    const filteredData = allProviderService.filter((item) => item.provider.toString() === id);
    return filteredData[0]?.conceptDesignWithStructure;
  };


  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className='main-bg'>
        <div className='section architecture-section-one'>
          <div className='container-fluid architecture-section-p'>
            <div className='row'>
              <div className='col-lg-12'>
                <div className='top-filter-area'>
                  <form>
                    <div className='top-bar'>
                      <div className='architectur-bar'>
                        <h3 className='architecture-heading'>Talk To Architect</h3>
                      </div>
                      {
                        role === 'user' ? (
                          <div className='architectur-bar'>
                            <div className="available-balance medium-device-balance"> Available balance: <main className="balance-avail"> ₹ {walletAmount} </main></div>
                          </div>
                        ) : (<></>)
                      }
                      <div className='architectur-bar'>
                        <div className='recharge-btn'>
                          {
                            role === 'user' ? (
                              <a onClick={handleOpenModel} className="medium-device-recharge">Recharge</a>
                            ) : (<></>)
                          }
                          {/* <button className="filter_short-btn"><i className="fa fa-filter"></i> Filter </button> */}
                          <button
                            type="button"
                            className="btn filter-short-by"
                            data-bs-toggle="modal"
                            data-bs-target="#staticBackdrop"
                          >
                            <i className="fa fa-sort-amount-desc"></i> Sort by
                          </button>

                          {/* filter-short-by modal popup */}
                          <div
                            className="modal fade"
                            id="staticBackdrop"
                            data-bs-backdrop="static"
                            data-bs-keyboard="false"
                            tabIndex="-1"
                            aria-labelledby="staticBackdropLabel"
                            aria-hidden="true"
                          >
                            <div className="modal-dialog">
                              <div className="modal-content">
                                <div className="modal-header">
                                  <h5 className="modal-title" id="staticBackdropLabel">Sort by</h5>
                                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                  <div className="short_by_object">
                                    <input
                                      type="radio"
                                      name="shorting"
                                      className="form-check-input"
                                      value="sortByExperience_asc"
                                      onChange={handleSortChange}
                                      data-bs-dismiss="modal"
                                    />
                                    <label className="lable_radio">Experience: Low to High</label>
                                  </div>
                                  <div className="short_by_object">
                                    <input
                                      type="radio"
                                      name="shorting"
                                      className="form-check-input"
                                      value="sortByExperience_desc"
                                      onChange={handleSortChange}
                                      data-bs-dismiss="modal"
                                    />
                                    <label className="lable_radio">Experience: High to Low</label>
                                  </div>
                                  <div className="short_by_object">
                                    <input
                                      type="radio"
                                      name="shorting"
                                      className="form-check-input"
                                      value="sortByPrice_asc"
                                      onChange={handleSortChange}
                                      data-bs-dismiss="modal"
                                    />
                                    <label className="lable_radio">Price: Low to High</label>
                                  </div>
                                  <div className="short_by_object">
                                    <input
                                      type="radio"
                                      name="shorting"
                                      className="form-check-input"
                                      value="sortByPrice_desc"
                                      onChange={handleSortChange}
                                      data-bs-dismiss="modal"
                                    />
                                    <label className="lable_radio">Price: High to Low</label>
                                  </div>
                                  <div className="short_by_object">
                                    <input
                                      type="radio"
                                      name="shorting"
                                      className="form-check-input"
                                      value="sortByRating_desc"
                                      onChange={handleSortChange}
                                      data-bs-dismiss="modal"
                                    />
                                    <label className="lable_radio">Rating: High to Low</label>
                                  </div>
                                  <div className="short_by_object">
                                    <input
                                      type="radio"
                                      name="shorting"
                                      className="form-check-input"
                                      value="sortByRating_asc"
                                      onChange={handleSortChange}
                                      data-bs-dismiss="modal"
                                    />
                                    <label className="lable_radio">Rating: Low to High</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* enf of filter sort by*/}
                          <div className="form-search classsearhMbile">
                            <input
                              name="searchText"
                              type="text"
                              value={searchText}
                              onChange={handleSearchChange}
                              autoComplete="off"
                              id="searchAstroQuery"
                              className="form-control customform-control postion_Rel"
                              placeholder="Search..."
                            />
                            <i className="fa fa-search"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='section architecture-section-2 mb-5'>
          <div className="container-fluid architecture-section-p">
            <div className='profile-card-box'>
              {currentProviders && currentProviders.map((item, index) => (
                <Link to={`/architect-profile/${item._id}`} className="profile-card" key={index}>
                  {/* <!-- Left Section (Profile) --> */}
                  <div className='left-to-left'>
                    <img src={item?.photo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=random`} alt="Profile" onError={(e) => e.target.src = 'https://via.placeholder.com/60'} className="profile-img" />
                    <StarRating rating={item.averageRating || 0} />
                    
                  </div>
                  <div className="left-section">
                    {/* <div className="stars">★★★★★</div> */}
                    <h5 className="formarginzero">
                      {item.name ? (
                        <Link to={`/architect-profile/${item._id}`}>{item.name}</Link>
                      ) : (
                        "Not Available"
                      )}
                    </h5>
                    {/* <p className="formarginzero">{item.type ? item.type : "Profile Update"}</p> */}
                    {/* <p className="formarginzero">Languages:  {item.language && item.language.length > 0 ? ( */}
                    <p className="formarginzero">{item.language && item.language.length > 0 ? (
                      item.language.map((lang, index) => (
                        <span key={index} className="archi-language-tag">
                          {lang}
                          {index < item.language.length - 1 ? ", " : ""}
                        </span>
                      ))
                    ) : (
                      "Not Available"
                    )}</p>
                    <p className="formarginzero">{item.expertiseSpecialization && item.expertiseSpecialization.length > 0 ? (
                      item.expertiseSpecialization.map((specialization, index) => (
                        <span key={index} className="archi-language-tag">
                          {specialization}
                          {index < item.expertiseSpecialization.length - 1 ? ", " : ""}
                        </span>
                      ))
                    ) : (
                      "Not Updated"
                    )}</p>
                    <p className="pricing formarginzero">
                      {/* {`Rs ${handleFilterProviderService(item._id) * 900} for 100 Sq.Yrds ${handleFilterProviderService(item._id) || 'Sq. Yrds'} * 900`} */}
                      {`Rs ${handleFilterProviderService(item._id) * 900} for 100 Sq.Yrds`}
                    </p>
                    <p className="experience">{item.yearOfExperience ? (
                      <span className='archi-language-tag'>{`${item.yearOfExperience}`}</span>
                    ) : (
                      ""
                    )} Years Experience</p>
                  </div>

                  {/* <!-- Right Section (Buttons & Experience) --> */}
                  <div className="right-section">
                    <div style={{ padding: '0px' }} className="buttons chat-call-btn">
                      <button disabled={!item.chatStatus} className={`${item.chatStatus === true ? 'profile-chat-btn greenBorder' : 'profile-call-btn redBorder'}`}>Chat <i className="fa-regular fa-comments"></i></button>
                      <button disabled={!item.callStatus} className={`${item.callStatus === true ? 'profile-chat-btn greenBorder' : 'profile-call-btn redBorder'}`}>Call <i className="fa-solid fa-phone-volume"></i></button>
                    </div>
                    <p className="price">{`₹ ${item.pricePerMin}/min`}</p>
                    
                  </div>
                </Link>
              ))}
            </div>
            {/* Pagination */}
            <nav>
              <ul className="pagination">
                {Array.from({ length: Math.ceil(filteredProviders.length / itemsPerPage) }).map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                    onClick={() => paginate(index + 1)}
                  >
                    <a className="page-link">{index + 1}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

        </div>
      </div>


      <Modal show={showModal} onHide={handleCloseModel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Recharge Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Enter Recharge Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={amount}
                style={{ border: '1px solid #CFD4DA' }}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex justify-content-around my-3">
              {[100, 300, 500].map((preset) => (
                <Button
                  key={preset}
                  variant="outline-primary"
                  onClick={() => handlePresetAmount(preset)}
                >
                  ₹{preset}
                </Button>
              ))}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModel}>
            Close
          </Button>
          <Button style={{ backgroundColor: '#E9BB37', border: '1px solid #E9BB37' }} variant="primary" onClick={handleMakePayment}>
            Confirm Recharge
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default TalkToArchitect;