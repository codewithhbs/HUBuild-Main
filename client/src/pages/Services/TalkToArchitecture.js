"use client"

import { useEffect, useState } from "react"
import StarRating from "../../components/StarRating/StarRating"
import axios from "axios"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"
import { GetData } from "../../utils/sessionStoreage"
import { Modal, Button, Form } from "react-bootstrap"
import Swal from "sweetalert2"
import ModelOfPriceAndTime from "./ModelOfPriceAndTime"
import CallLoader from "./CallLoader"
import { HiBadgeCheck } from "react-icons/hi"
import verifiedBadge from './verified1.jpg'

function TalkToArchitect() {
  const [id, setId] = useState(null)
  const [allProviders, setAllProviders] = useState([])
  const [filteredProviders, setFilteredProviders] = useState([])
  const [sortCriteria, setSortCriteria] = useState("")
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Enhanced filter states
  const [filters, setFilters] = useState({
    experienceRange: { min: "", max: "" },
    priceRange: { min: "", max: "" },
    ratingRange: { min: "", max: "" },
    selectedLanguages: [],
    selectedSpecializations: [],
    availableForChat: false,
    availableForCall: false,
  })

  // Add temporary filter states for the modal
  const [tempFilters, setTempFilters] = useState({
    experienceRange: { min: "", max: "" },
    priceRange: { min: "", max: "" },
    ratingRange: { min: "", max: "" },
    selectedLanguages: [],
    selectedSpecializations: [],
    availableForChat: false,
    availableForCall: false,
  })

  const [showModal, setShowModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [amount, setAmount] = useState("")
  const Data = GetData("user")
  const token = GetData("token")
  const UserData = JSON.parse(Data)
  const [walletAmount, setWalletAmount] = useState(0)
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [callLoader, setCallLoader] = useState(false)
  const [profile, setProfile] = useState(null)
  const [time, setTime] = useState("0")
  const [allProviderService, setAllProviderService] = useState([])
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    userId: "",
    providerId: "",
  })

  // Get unique values for filter options
  const getUniqueLanguages = () => {
    const languages = new Set()
    allProviders.forEach((provider) => {
      if (provider.language && Array.isArray(provider.language)) {
        provider.language.forEach((lang) => languages.add(lang))
      }
    })
    return Array.from(languages)
  }

  const getUniqueSpecializations = () => {
    const specializations = new Set()
    allProviders.forEach((provider) => {
      if (provider.expertiseSpecialization && Array.isArray(provider.expertiseSpecialization)) {
        provider.expertiseSpecialization.forEach((spec) => specializations.add(spec))
      }
    })
    return Array.from(specializations)
  }

  const handleFetchUser = async () => {
    try {
      const UserId = UserData?._id
      const { data } = await axios.get(`https://api.dessobuild.com/api/v1/get-single-user/${UserId}`)
      const formattedAmount = data.data.walletAmount.toFixed(2)
      setUser(data?.data)
      setWalletAmount(formattedAmount)
      setRole(data?.data?.role)
    } catch (error) {
      console.log("Internal server error in fetching User")
      toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later")
    }
  }

  useEffect(() => {
    applyFilters()
  }, [sortCriteria, allProviders, searchText, filters])

  const handleFetchProvider = async () => {
    try {
      const { data } = await axios.get("https://api.dessobuild.com/api/v1/get-all-provider")
      const allData = data.data.filter((item) => item.type === "Architect")
      const shownProvider = allData.filter((item) => item.accountVerified === "Verified")
      const filterByDeactivate = shownProvider.filter((item) => item.isDeactived === false)
      setAllProviders(filterByDeactivate)
      setFilteredProviders(filterByDeactivate)
    } catch (error) {
      console.error("Internal server error in fetching providers", error)
      toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later")
    }
  }

  useEffect(() => {
    if (UserData?.role === "user") {
      handleFetchUser()
    }
    handleFetchProvider()
  }, [])

  useEffect(() => {
    const handleFetchProviderAllService = async () => {
      try {
        setLoading(true)
        const all = await axios.get("https://api.dessobuild.com/api/v1/get-all-provider-service")
        const allData = all.data.data
        const filterData = allData.filter((item) => item.category === "Residential")
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
    setLoading(true)
    try {
      // Fetch services for the selected category
      const { data } = await axios.get(
        `https://api.dessobuild.com/api/v1/get-service-by-provider/${providerId}/Residential`,
      )
      // Find the service data for the selected category
      const serviceData = data.data.find((service) => service.category === "Residential")
      const price = serviceData.conceptDesignWithStructure
      return price
    } catch (error) {
      console.error("Error fetching provider data", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let sortedData = [...allProviders]
    // Apply search filter
    if (searchText) {
      sortedData = sortedData.filter((provider) => provider.name.toLowerCase().includes(searchText.toLowerCase()))
    }

    // Apply advanced filters
    if (filters.experienceRange.min !== "") {
      sortedData = sortedData.filter(
        (provider) => (provider.yearOfExperience || 0) >= Number.parseInt(filters.experienceRange.min),
      )
    }
    if (filters.experienceRange.max !== "") {
      sortedData = sortedData.filter(
        (provider) => (provider.yearOfExperience || 0) <= Number.parseInt(filters.experienceRange.max),
      )
    }

    if (filters.priceRange.min !== "") {
      sortedData = sortedData.filter(
        (provider) => (provider.pricePerMin || 0) >= Number.parseFloat(filters.priceRange.min),
      )
    }
    if (filters.priceRange.max !== "") {
      sortedData = sortedData.filter(
        (provider) => (provider.pricePerMin || 0) <= Number.parseFloat(filters.priceRange.max),
      )
    }

    if (filters.ratingRange.min !== "") {
      sortedData = sortedData.filter(
        (provider) => (provider.averageRating || 0) >= Number.parseFloat(filters.ratingRange.min),
      )
    }
    if (filters.ratingRange.max !== "") {
      sortedData = sortedData.filter(
        (provider) => (provider.averageRating || 0) <= Number.parseFloat(filters.ratingRange.max),
      )
    }

    if (filters.selectedLanguages.length > 0) {
      sortedData = sortedData.filter(
        (provider) => provider.language && provider.language.some((lang) => filters.selectedLanguages.includes(lang)),
      )
    }

    if (filters.selectedSpecializations.length > 0) {
      sortedData = sortedData.filter(
        (provider) =>
          provider.expertiseSpecialization &&
          provider.expertiseSpecialization.some((spec) => filters.selectedSpecializations.includes(spec)),
      )
    }

    if (filters.availableForChat) {
      sortedData = sortedData.filter((provider) => provider.chatStatus === true)
    }

    if (filters.availableForCall) {
      sortedData = sortedData.filter((provider) => provider.callStatus === true)
    }

    // Sorting logic
    switch (sortCriteria) {
      case "sortByExperience_asc":
        sortedData.sort((a, b) => (a.yearOfExperience || 0) - (b.yearOfExperience || 0))
        break
      case "sortByExperience_desc":
        sortedData.sort((a, b) => (b.yearOfExperience || 0) - (a.yearOfExperience || 0))
        break
      case "sortByPrice_asc":
        sortedData.sort((a, b) => (a.pricePerMin || 0) - (b.pricePerMin || 0))
        break
      case "sortByPrice_desc":
        sortedData.sort((a, b) => (b.pricePerMin || 0) - (a.pricePerMin || 0))
        break
      case "sortByRating_asc":
        sortedData.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0))
        break
      case "sortByRating_desc":
        sortedData.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        break
      default:
        break
    }

    setFilteredProviders(sortedData)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const fetchProviderData = async (id) => {
    try {
      const response = await axios.post(`https://api.dessobuild.com/api/v1/provider_status/${id}`)
      return response.data
    } catch (error) {
      console.error("Error fetching provider data:", error.message)
      return error?.response?.data || { success: false, message: "Unknown error occurred" }
    }
  }

  const callCulateMaxTimeForCall = async (walletAmount, pricePerMinute) => {
    try {
      const fixedAmount = Number(Number.parseFloat(walletAmount).toFixed(2))
      const PricePerMin = Number(pricePerMinute)
      let maxTimeForCall = (fixedAmount / PricePerMin) * 60
      if (PricePerMin === 0) {
        maxTimeForCall = 600
      }
      return maxTimeForCall
    } catch (error) {
      console.error("Error calculating max time for call:", error)
      return 0
    }
  }

  const connectWithProviderWithCall = async () => {
    setCallLoader(true)
    if (!UserData) {
      window.location.href = `/login?redirect=${window.location.href}`
      return Swal.fire({
        title: "Error!",
        text: "Login first",
        icon: "error",
        confirmButtonText: "Okay",
      })
    }

    try {
      const data = await fetchProviderData(id)
      if (!data.success) {
        setCallLoader(false)
        return Swal.fire({
          title: "Error!",
          text: data.message || "Provider is not available",
          icon: "error",
          confirmButtonText: "Okay",
        })
      }
    } catch (error) {
      console.error("Error fetching provider data:", error)
      setCallLoader(false)
      return
    }

    try {
      const res = await axios.post("https://api.dessobuild.com/api/v1/create-call", {
        userId: UserData._id,
        providerId: id,
        UserWallet: UserData?.walletAmount,
        ProviderProfileMin: profile.pricePerMin,
        max_duration_allowed: time,
      })
      console.log("res", res.data)
      setOpen(false)
      setTime("0")
      setTimeout(() => setCallLoader(false), 5000)
    } catch (error) {
      console.log(error)
      setCallLoader(false)
      Swal.fire({
        title: "Error!",
        text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later",
        icon: "error",
        confirmButtonText: "Okay",
      })
    }
  }

  const showModelOfPrice = async (profile) => {
    if (UserData && profile) {
      if (UserData.role === "provider") {
        return Swal.fire({
          title: "Error!",
          text: "Access Denied: Providers are not authorized to access this feature.",
          icon: "error",
          confirmButtonText: "Okay",
        })
      } else {
        setProfile(profile)
        await handleFetchUser()
        console.log("seconds", user)
        setTimeout(async () => {
          const data = await callCulateMaxTimeForCall(user?.walletAmount, profile.pricePerMin)
          setId(profile._id)
          setOpen(true)
          setTime(data)
        }, 1400)
      }
    } else {
      Swal.fire({
        title: "Error!",
        text: "Please login to calculate maximum time for call",
        icon: "error",
        confirmButtonText: "Okay",
      })
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTime("0")
  }

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value)
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value)
  }

  // Updated filter handlers for temporary filters
  const handleTempFilterChange = (filterType, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const handleTempLanguageToggle = (language) => {
    setTempFilters((prev) => ({
      ...prev,
      selectedLanguages: prev.selectedLanguages.includes(language)
        ? prev.selectedLanguages.filter((lang) => lang !== language)
        : [...prev.selectedLanguages, language],
    }))
  }

  const handleTempSpecializationToggle = (specialization) => {
    setTempFilters((prev) => ({
      ...prev,
      selectedSpecializations: prev.selectedSpecializations.includes(specialization)
        ? prev.selectedSpecializations.filter((spec) => spec !== specialization)
        : [...prev.selectedSpecializations, specialization],
    }))
  }

  // Function to apply temporary filters to actual filters
  const applyTempFilters = () => {
    setFilters(tempFilters)
    setShowFilterModal(false)
  }

  // Function to open filter modal and set temp filters to current filters
  const openFilterModal = () => {
    setTempFilters(filters)
    setShowFilterModal(true)
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      experienceRange: { min: "", max: "" },
      priceRange: { min: "", max: "" },
      ratingRange: { min: "", max: "" },
      selectedLanguages: [],
      selectedSpecializations: [],
      availableForChat: false,
      availableForCall: false,
    }
    setFilters(clearedFilters)
    setTempFilters(clearedFilters)
    setSortCriteria("")
    setSearchText("")
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.experienceRange.min || filters.experienceRange.max) count++
    if (filters.priceRange.min || filters.priceRange.max) count++
    if (filters.ratingRange.min || filters.ratingRange.max) count++
    if (filters.selectedLanguages.length > 0) count++
    if (filters.selectedSpecializations.length > 0) count++
    if (filters.availableForChat) count++
    if (filters.availableForCall) count++
    return count
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProviders = filteredProviders.slice(indexOfFirstItem, indexOfLastItem)
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const handleOpenModel = async () => {
    if (!token) {
      return toast.error("Login First!")
    } else if (UserData?.role === "provider") {
      return toast.error(`You are a provider. You don't have access.`)
    }
    setShowModal(true)
  }

  // Dynamically load the Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleCloseModel = () => {
    setShowModal(false)
    setAmount("")
  }

  const handlePresetAmount = (preset) => {
    setAmount(preset)
  }

  const handleActiveTime = async (Chat, providerId) => {
    if (!UserData) {
      return Swal.fire({
        title: "Error!",
        text: "Login first",
        icon: "error",
        confirmButtonText: "Okay",
      })
    }
    if (UserData.role === "provider") {
      return Swal.fire({
        title: "Error!",
        text: "Access Denied: Providers are not authorized to access this feature.",
        icon: "error",
        confirmButtonText: "Okay",
      })
    }

    if (!providerId.pricePerMin || providerId.pricePerMin <= 0) {
      return toast.error("Chat cannot be started. Provider pricing information is unavailable or invalid.")
    }

    if (Chat === "Chat") {
      const newForm = {
        ...formData,
        userId: UserData._id,
        providerId: providerId._id,
      }
      try {
        const res = await axios.post("https://api.dessobuild.com/api/v1/create-chat", newForm)
        window.location.href = "/chat"
      } catch (error) {
        console.error("Internal server error", error)
        const errorMessage =
          error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later"
        if (errorMessage.includes("Chat is already started. Check Your chat room.")) {
          return (window.location.href = "/chat")
        }
        Swal.fire({
          title: "Error!",
          text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later",
          icon: "error",
          confirmButtonText: "Okay",
        })
      }
    }
  }

  const handleMakePayment = async () => {
    if (!amount || amount <= 0) {
      return toast.error("Please enter a valid amount")
    }
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your connection.")
        return
      }

      const UserId = UserData?._id
      const res = await axios.post(`https://api.dessobuild.com/api/v1/create-payment/${UserId}`, {
        price: amount,
      })
      console.log("Order", res.data.data)
      const order = res.data.data.razorpayOrder

      if (order) {
        const options = {
          key: "rzp_live_bmq7YMRTuGvvfu",
          amount: amount * 100,
          currency: "INR",
          name: "DessoBuild",
          description: "Doing Recharge",
          order_id: order?.id || "",
          callback_url: "https://api.dessobuild.com/api/v1/verify-payment",
          prefill: {
            name: UserData?.name,
            email: UserData?.email,
            contact: UserData?.PhoneNumber,
          },
          theme: {
            color: "#F37254",
          },
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (error) {
      console.log("Internal server error", error)
      toast.error(error?.response?.data?.message || "Failed to Reacharge. Please try again.")
    }
  }

  const handleFilterProviderService = (id) => {
    const filteredData = allProviderService.filter((item) => item.provider.toString() === id)
    return filteredData[0]?.conceptDesignWithStructure
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (callLoader) {
    return <CallLoader />
  }

  return (
    <>
      <div className="main-bg">
        <div className="section architecture-section-one">
          <div className="container-fluid architecture-section-p">
            <div className="row">
              <div className="col-lg-12">
                <div className="top-filter-area">
                  <form>
                    <div className="top-bar">
                      <div className="architectur-bar">
                        <h3 className="architecture-heading">Talk To Architect</h3>
                      </div>
                      {role === "user" ? (
                        <div className="architectur-bar">
                          <div className="available-balance medium-device-balance">
                            {" "}
                            Available balance: <main className="balance-avail"> ₹ {walletAmount} </main>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                      <div className="architectur-bar">
                        <div className="recharge-btn">
                          {/* {role === "user" ? (
                            <a onClick={handleOpenModel} className="medium-device-recharge">
                              Recharge
                            </a>
                          ) : (
                            <></>
                          )} */}
                          {/* Enhanced Filter Button */}
                          <button
                            type="button"
                            className="btn filter_short-btn"
                            style={{ border: "1px solid black" }}
                            onClick={openFilterModal}
                          >
                            <i className="fa fa-filter"></i> <span className="text-remove">Filter</span>
                            {getActiveFiltersCount() > 0 && (
                              <span className="badge badge-primary ml-1">{getActiveFiltersCount()}</span>
                            )}
                          </button>
                          <button
                            type="button"
                            style={{ border: "1px solid black" }}
                            className="btn filter-short-by"
                            data-bs-toggle="modal"
                            data-bs-target="#staticBackdrop"
                          >
                            <i className="fa fa-sort-amount-desc"></i>
                            <span className="text-remove"> Sort by</span>
                          </button>
                          {/* Sort Modal */}
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
                                  <h5 className="modal-title" id="staticBackdropLabel">
                                    Sort by
                                  </h5>
                                  <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                  ></button>
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
        {/* Results Summary */}
        <div className="container-fluid architecture-section-p">
          <div className="row">
            <div className="col-12">
              <div className="results-summary mb-3">
                <p className="mb-0">
                  Showing {currentProviders.length} of {filteredProviders.length} architects
                  {getActiveFiltersCount() > 0 && (
                    <span className="ml-2">
                      ({getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? "s" : ""} applied)
                    </span>
                  )}
                </p>
                {getActiveFiltersCount() > 0 && (
                  <button className="btn btn-link btn-sm p-0 ml-2" onClick={clearAllFilters}>
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="section architecture-section-2 mb-5">
          <div className="container-fluid architecture-section-p">
            <div className="profile-card-box">
              {currentProviders &&
                currentProviders.map((item, index) => (
                  <div className="profile-card" key={index}>
                    {item.isHelpuBuildVerified && <img src={verifiedBadge} className="verified-badge" />}
                    
                    <div className="left-to-left">
                      <img
                        src={
                          item?.photo?.imageUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "User")}&background=random`
                        }
                        alt="Profile"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/60")}
                        className="profile-img"
                      />
                      <StarRating rating={item.averageRating || 0} />
                    </div>
                    <div className="left-section">
                      <h5 className="formarginzero">
                        {item.name ? <Link to={`/architect-profile/${item._id}`}>{item.name}</Link> : "Not Available"} 
                      </h5>
                      <p className="pricing formarginzero">{item?.unique_id ? `ID: ${item?.unique_id}` : ""}</p>
                      <p className="formarginzero">
                        {item.language && item.language.length > 0
                          ? item.language.map((lang, index) => (
                              <span key={index} className="archi-language-tag">
                                {lang}
                                {index < item.language.length - 1 ? ", " : ""}
                              </span>
                            ))
                          : "Not Available"}
                      </p>
                      <p className="formarginzero">
                        {item.expertiseSpecialization && item.expertiseSpecialization.length > 0
                          ? item.expertiseSpecialization.map((specialization, index) => (
                              <span key={index} className="archi-language-tag">
                                {specialization}
                                {index < item.expertiseSpecialization.length - 1 ? ", " : ""}
                              </span>
                            ))
                          : "Not Updated"}
                      </p>
                      <p className="experience">
                        {item.yearOfExperience ? (
                          <span className="archi-language-tag">{`${item.yearOfExperience}`}</span>
                        ) : (
                          ""
                        )}{" "}
                        Years Experience
                      </p>
                      <p className="pricing formarginzero">
                        {item?.providerService
                          ? `Rs ${handleFilterProviderService(item._id) * 900} for 100 Sq.Yrds (Approx)`
                          : ""}
                      </p>
                    </div>
                    <div className="right-section">
                      <div style={{ padding: "0px" }} className="buttons chat-call-btn">
                        <button
                          onClick={() => handleActiveTime("Chat", item)}
                          disabled={!item.chatStatus}
                          className={`${item.chatStatus === true ? "profile-chat-btn greenBorder" : "profile-call-btn redBorder"}`}
                        >
                          Chat <i className="fa-regular fa-comments"></i>
                        </button>
                        <button
                          onClick={() => showModelOfPrice(item)}
                          disabled={!item.callStatus}
                          className={`${item.callStatus === true ? "profile-chat-btn greenBorder" : "profile-call-btn redBorder"}`}
                        >
                          Call <i className="fa-solid fa-phone-volume"></i>
                        </button>
                      </div>
                      <p className="price">{`₹ ${item.pricePerMin}/min`}</p>
                    </div>
                  </div>
                ))}
            </div>
            {/* Pagination */}
            {filteredProviders.length >= 1 && (
              <nav className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                      Previous
                    </button>
                  </li>
                  {currentPage > 1 && (
                    <li className="page-item">
                      <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                        {currentPage - 1}
                      </button>
                    </li>
                  )}
                  <li className="page-item active">
                    <span className="page-link">{currentPage}</span>
                  </li>
                  {currentPage < Math.ceil(filteredProviders.length / itemsPerPage) && (
                    <li className="page-item">
                      <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                        {currentPage + 1}
                      </button>
                    </li>
                  )}
                  <li
                    className={`page-item ${
                      currentPage === Math.ceil(filteredProviders.length / itemsPerPage) ? "disabled" : ""
                    }`}
                  >
                    <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
      {/* Enhanced Filter Modal */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Filter Architects</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <div className="row">
            {/* Experience Range */}
            <div className="col-md-6 mb-3">
              <h6>Experience (Years)</h6>
              <div className="row">
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control filter-border"
                    placeholder="Min"
                    value={tempFilters.experienceRange.min}
                    onChange={(e) =>
                      handleTempFilterChange("experienceRange", {
                        ...tempFilters.experienceRange,
                        min: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control filter-border"
                    placeholder="Max"
                    value={tempFilters.experienceRange.max}
                    onChange={(e) =>
                      handleTempFilterChange("experienceRange", {
                        ...tempFilters.experienceRange,
                        max: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            {/* Price Range */}
            <div className="col-md-6 mb-3">
              <h6>Price Range (₹/min)</h6>
              <div className="row">
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control filter-border"
                    placeholder="Min"
                    value={tempFilters.priceRange.min}
                    onChange={(e) =>
                      handleTempFilterChange("priceRange", {
                        ...tempFilters.priceRange,
                        min: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control filter-border"
                    placeholder="Max"
                    value={tempFilters.priceRange.max}
                    onChange={(e) =>
                      handleTempFilterChange("priceRange", {
                        ...tempFilters.priceRange,
                        max: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            {/* Rating Range */}
            <div className="col-md-6 mb-3">
              <h6>Rating Range</h6>
              <div className="row">
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control filter-border"
                    placeholder="Min"
                    min="0"
                    max="5"
                    step="0.1"
                    value={tempFilters.ratingRange.min}
                    onChange={(e) =>
                      handleTempFilterChange("ratingRange", {
                        ...tempFilters.ratingRange,
                        min: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control filter-border"
                    placeholder="Max"
                    min="0"
                    max="5"
                    step="0.1"
                    value={tempFilters.ratingRange.max}
                    onChange={(e) =>
                      handleTempFilterChange("ratingRange", {
                        ...tempFilters.ratingRange,
                        max: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            {/* Availability */}
            <div className="col-md-6 mb-3">
              <h6>Availability</h6>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={tempFilters.availableForChat}
                  onChange={(e) => handleTempFilterChange("availableForChat", e.target.checked)}
                />
                <label className="form-check-label">Available for Chat</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={tempFilters.availableForCall}
                  onChange={(e) => handleTempFilterChange("availableForCall", e.target.checked)}
                />
                <label className="form-check-label">Available for Call</label>
              </div>
            </div>
            {/* Languages */}
            <div className="col-12 mb-3">
              <h6>Languages</h6>
              <div className="row">
                {getUniqueLanguages().map((language, index) => (
                  <div key={index} className="col-md-4 col-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={tempFilters.selectedLanguages.includes(language)}
                        onChange={() => handleTempLanguageToggle(language)}
                      />
                      <label className="form-check-label">{language}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={clearAllFilters}>
            Clear All
          </Button>
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={applyTempFilters}
            style={{ backgroundColor: "#E9BB37", border: "1px solid #E9BB37" }}
          >
            Apply Filters ({getActiveFiltersCount()})
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Recharge Modal */}
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
                style={{ border: "1px solid #CFD4DA" }}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex justify-content-around my-3">
              {[100, 300, 500].map((preset) => (
                <Button key={preset} variant="outline-primary" onClick={() => handlePresetAmount(preset)}>
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
          <Button
            style={{ backgroundColor: "#E9BB37", border: "1px solid #E9BB37" }}
            variant="primary"
            onClick={handleMakePayment}
          >
            Confirm Recharge
          </Button>
        </Modal.Footer>
      </Modal>
      {open && (
        <ModelOfPriceAndTime
          seconds={time}
          UserData={user}
          Profile={profile}
          onClose={handleClose}
          startCall={connectWithProviderWithCall}
        />
      )}
    </>
  )
}

export default TalkToArchitect
