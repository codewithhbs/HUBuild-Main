"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { GetData } from "../../utils/sessionStoreage"
import { toast } from "react-hot-toast"
import "./userdashboard.css"
import Settings from "./Settings"
import { Modal, Button, Form } from "react-bootstrap"
import Swal from "sweetalert2"
import useLogout from "../../components/useLogout/useLogout"
import CropperModal from "../../Helper/CropperModal.js"

function Dashboard() {
  const [myProfile, setMyProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("settings")
  const [amount, setAmount] = useState("")
  const Data = GetData("user")
  const UserData = JSON.parse(Data)
  const userId = UserData?._id
  const token = GetData("token")
  const [walletAmount, setWalletAmount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Coupon related states
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")

  const GetMyProfile = async () => {
    if (!token) {
      console.error("Token is missing")
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.get(`https://api.dessobuild.com/api/v1/get-single-user/${userId}`)
      setMyProfile(data.data)
      const formattedAmount = data.data.walletAmount.toFixed(2)
      setWalletAmount(formattedAmount)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error("Error fetching profile:", error)
    }
  }

  useEffect(() => {
    GetMyProfile()
  }, [])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    setShowCropper(true)
  }

  const handleCropComplete = async (blob) => {
    setProfileLoading(true)
    const formData = new FormData()
    formData.append("ProfileImage", blob)
    try {
      const res = await axios.put(`https://api.dessobuild.com/api/v1/update_user_profile_image/${userId}`, formData)
      if (res.data.success) {
        setProfileLoading(false)
        toast.success("Image updated successfully")
        setShowCropper(false)
        setSelectedImage(null)
        window.location.reload()
      }
    } catch (error) {
      console.log("Internal server error", error)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleOpenModel = async () => {
    if (!token) {
      return Swal.fire({
        title: "Error!",
        text: "Login First!",
        icon: "error",
        confirmButtonText: "Okay",
      })
    } else if (UserData?.role === "provider") {
      return Swal.fire({
        title: "Error!",
        text: `You are a provider. You don't have access.`,
        icon: "error",
        confirmButtonText: "Okay",
      })
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
    setAmount("") // Reset the amount when closing the modal
    setCouponCode("")
    setAppliedCoupon(null)
    setCouponError("")
  }

  const handlePresetAmount = (preset) => {
    setAmount(preset)
  }

  // Function to check coupon
  const handleCheckCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    setCouponLoading(true)
    setCouponError("")

    try {
      const res = await axios.post("https://api.dessobuild.com/api/v1/check_coupon", {
        couponCode: couponCode.trim(),
      })

      if (res.data.success) {
        setAppliedCoupon(res.data.data?.couponCode)
        toast.success("Coupon applied successfully!")
      }
    } catch (error) {
      setCouponError(error?.response?.data?.message || "Invalid coupon code")
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  // Function to remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    setCouponError("")
  }

  const handleMakePayment = async () => {
    if (!amount || amount <= 0) {
      return Swal.fire({
        title: "Error!",
        text: "Please enter a valid amount",
        icon: "error",
        confirmButtonText: "Okay",
      })
    }

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your connection.")
        return
      }

      const UserId = UserData?._id

      // Prepare request body with coupon if applied
      const requestBody = {
        price: amount,
      }

      if (appliedCoupon) {
        requestBody.couponCode = appliedCoupon
      }

      const res = await axios.post(`https://api.dessobuild.com/api/v1/create-payment/${UserId}`, requestBody)

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
      Swal.fire({
        title: "Error!",
        text: error?.response?.data?.message || "Failed to Reacharge. Please try again.",
        icon: "error",
        confirmButtonText: "Okay",
      })
    }
  }

  const handleLogout = useLogout(userId)

  const handleDeleteAccount = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`https://api.dessobuild.com/api/v1/user-delete/${id}`)
          if (res.data.success) {
            Swal.fire("Deleted!", "Your account has been deleted.", "success")
            localStorage.clear()
            window.location.href = "/"
          }
        } catch (error) {
          console.log("Internal server error", error)
          Swal.fire("Error!", "Something went wrong. Please try again.", "error")
        }
      }
    })
  }

  if (token === null) {
    return (
      <div className="container my-5 text-center">
        <div className="w-100">
          <img
            src="https://i.ibb.co/C56bwYQ/401-Error-Unauthorized-pana.png"
            alt="401 Unauthorized"
            className="img-fluid mx-auto d-block mb-4"
            style={{ maxWidth: "80%", height: "auto" }}
          />
        </div>
        <p className="fs-4 text-muted">You are not authorized to view this page.</p>
        <a href="/login" className="btn btn-outline-danger as_btn btn-lg mt-3">
          <i className="fas fa-sign-in-alt me-2"></i>
          Login
        </a>
      </div>
    )
  }

  if (loading || !myProfile) {
    return (
      <div className="forDisplayFlex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='userdashboard-body-bg' style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="container-fluid py-4 px-3 px-md-4">
          {/* Profile Header Card */}
          <div className="card shadow-lg border-0 mb-4" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="forDisplayFlex forjustify align-items-center">
                    <div className="position-relative for-margin-right">
                      <label htmlFor="profile-upload" className="cursor-pointer">
                        <img
                          src={
                            myProfile?.ProfileImage?.imageUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              myProfile.name || "User",
                            )}&background=random`
                          }
                          alt="avatar"
                          className="rounded-circle object-cover"
                          style={{ width: '100px', height: '100px', cursor: 'pointer', border: '3px solid #042F66' }}
                        />
                      </label>
                      <input
                        type="file"
                        id="profile-upload"
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {myProfile?.isVerified && (
                        <span className="position-absolute top-0 end-0 badge bg-success rounded-pill p-1">
                          <i className="fas fa-check-circle me-1"></i>Verified
                        </span>
                      )}
                      {showCropper && selectedImage && (
                        <CropperModal
                          imageSrc={selectedImage}
                          onClose={() => setShowCropper(false)}
                          onCropComplete={handleCropComplete}
                          profileLoading={profileLoading}
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="mb-1 text-dark fw-bold for-text-center">{myProfile.name}</h3>
                      <p className="text-muted mb-2">
                        <span className="me-2">{myProfile.email}</span>
                        <span className="mx-2">|</span>
                        <span>{myProfile.PhoneNumber}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mt-3 mt-md-0">
                  <div className="forDisplayFlex flex-column gap-3">
                    <div style={{display:'flex'}} className="align-items-center justify-content-between bg-light p-3 rounded">
                      <span className="text-dark fw-medium">Available Balance:</span>
                      <span className="text-success fw-bold fs-5">₹{walletAmount}</span>
                    </div>
                    
                    <button 
                      onClick={handleOpenModel} 
                      className="btn btn-primary"
                      style={{ backgroundColor: '#042F66', borderColor: '#042F66' }}
                    >
                      <i className="fas fa-wallet me-2"></i> Recharge Wallet
                    </button>
                  </div>
                </div>
              </div>
              
              <hr className="my-4" />
              
              {/* Action Buttons */}
              <div className="forDisplayFlex flex-wrap gap-2">
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDeleteAccount(userId)}
                >
                  <i className="fas fa-trash me-1"></i> Delete Account
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => handleLogout()}
                >
                  <i className="fas fa-sign-out-alt me-1"></i> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h4 className="card-title text-primary mb-4" style={{ color: '#042F66' }}>
                  <i className="fas fa-cog me-2"></i>Account Settings
                </h4>
                <Settings data={myProfile} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recharge Modal */}
      <Modal show={showModal} onHide={handleCloseModel} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#042F66', color: 'white' }}>
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

            <div className="forDisplayFlex justify-content-around my-3">
              {[100, 300, 500].map((preset) => (
                <Button 
                  key={preset} 
                  variant="outline-primary" 
                  onClick={() => handlePresetAmount(preset)}
                  style={{ color: '#042F66', borderColor: '#042F66' }}
                >
                  ₹{preset}
                </Button>
              ))}
            </div>

            {/* Coupon Section */}
            <Form.Group className="mb-3">
              <Form.Label>Coupon Code (Optional)</Form.Label>
              <div className="forDisplayFlex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  style={{ border: "1px solid #CFD4DA" }}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={appliedCoupon !== null}
                />
                {!appliedCoupon ? (
                  <Button
                    variant="outline-success"
                    onClick={handleCheckCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? "Checking..." : "Apply"}
                  </Button>
                ) : (
                  <Button variant="outline-danger" onClick={handleRemoveCoupon}>
                    Remove
                  </Button>
                )}
              </div>

              {couponError && <div className="text-danger small mt-1">{couponError}</div>}

              {appliedCoupon && (
                <div className="text-success small mt-1">
                  <i className="fas fa-check-circle me-1"></i>
                  Coupon "{appliedCoupon.couponCode}" applied successfully!
                  {appliedCoupon.discountPercentage && <span> ({appliedCoupon.discountPercentage}% discount)</span>}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModel}>
            Close
          </Button>
          <Button
            style={{ backgroundColor: "#042F66", borderColor: "#042F66" }}
            variant="primary"
            onClick={handleMakePayment}
          >
            Confirm Recharge
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Dashboard