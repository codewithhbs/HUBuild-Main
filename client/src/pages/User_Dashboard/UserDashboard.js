import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GetData } from '../../utils/sessionStoreage';
import { useDropzone } from 'react-dropzone';
import Portfolio from './Portfolio';
import UploadGallery from './UploadGallery';
import Settings from './Settings.js';
import './userdashboard.css';
import Wallet from './Wallet.js';
import Withdraw from './Withdraw.js';
import Reviews from '../../components/Reviews.js';
import Swal from 'sweetalert2';
import useLogout from '../../components/useLogout/useLogout.js';
import CropperModal from '../../Helper/CropperModal.js';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  // All state variables remain exactly the same
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [reUploadTrue, setReUploadTrue] = useState(true);
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false)
  const [token, setToken] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Gallery')
  const [mobileNumber, setMobileNumber] = useState('')
  const [walletAmount, setWalletAmount] = useState(0);
  const [statuses, setStatuses] = useState({
    chatStatus: "",
    callStatus: "",
  });

  // All functions remain exactly the same
  const GetToken = () => {
    const data = GetData('token');
    const user = GetData('user');
    const UserData = JSON.parse(user);
    if (data) {
      setToken(data);
    }
    if (UserData) {
      setProviderId(UserData._id)
    } else {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const GetMyProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`https://api.dessobuild.com/api/v1/get-single-provider/${providerId}`);
      setMyProfile(data.data);
      setMobileNumber(data.data.mobileNumber)
      const formattedAmount = data.data.walletAmount.toFixed(2);
      setWalletAmount(formattedAmount);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching profile:', error);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProvider = async () => {
    try {
      const { data } = await axios.get(
        `https://api.dessobuild.com/api/v1/get-single-provider/${providerId}`
      );
      const allData = data.data;
      setStatuses({
        chatStatus: allData.chatStatus || '',
        callStatus: allData.callStatus || '',
      });
    } catch (error) {
      console.log('Error fetching provider data', error);
      toast.error('Failed to fetch profile data.');
    }
  };

  const handleToggle = async (statusType) => {
    const updatedStatus = !statuses[statusType];
    const previousStatuses = { ...statuses };
    setStatuses({ ...statuses, [statusType]: updatedStatus });

    try {
      const response = await axios.put(
        `https://api.dessobuild.com/api/v1/update-available-status/${providerId}`,
        { [statusType]: updatedStatus }
      );
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${response.data.message}`,
        })
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update status',
          icon: 'error',
          confirmButtonText: 'Okay'
        });
        setStatuses(previousStatuses);
      }
    } catch (error) {
      console.log('Internal server error', error);
      Swal.fire({
        title: 'Error!',
        text: 'Error updating status',
        icon: 'error',
        confirmButtonText: 'Okay'
      });
      setStatuses(previousStatuses);
    }
  };

  const onDrop = (acceptedFiles) => {
    setFiles([...files, ...acceptedFiles]);
  };
  
  useEffect(() => {
    GetToken();
  }, []);

  useEffect(() => {
    if (token) {
      GetMyProfile();
      handleFetchProvider();
    }
  }, [token]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.pdf',
    maxFiles: 5,
    maxSize: 15 * 1024 * 1024,
  });

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((file) => formData.append('PortfolioLink', file));

    setUploading(true);

    try {
      const response = await axios.post('https://api.dessobuild.com/api/v1/addPortfolio?type=Portfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire({
        title: 'Success!',
        text: 'Portfolio uploaded successfully',
        icon: 'success',
        confirmButtonText: 'Okay'
      });
      setUploading(false);
      window.location.reload()
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleIsDeactived = async (id, isDeactived) => {
    try {
      const res = await axios.patch(`https://api.dessobuild.com/api/v1/update-provider-deactive-status/${id}`)
      if (res.data.success) {
        toast.success(res.data.message);
        window.location.reload()
      }
    } catch (error) {
      console.log("Internal server error", error)
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (blob) => {
    setProfileLoading(true)
    const formData = new FormData();
    formData.append('photo', blob);
    try {
      const res = await axios.put(`https://api.dessobuild.com/api/v1/update_provider_profile_image/${providerId}`, formData)
      if (res.data.success) {
        setProfileLoading(false)
        toast.success('Image updated successfully');
        setShowCropper(false);
        setSelectedImage(null);
        window.location.reload()
      }
    } catch (error) {
      console.log("Internal server error", error)
    } finally {
      setProfileLoading(false)
    }
  };

  const handleLogout = useLogout(providerId);

  const handleDeleteAccount = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will permanently delete your account!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`https://api.dessobuild.com/api/v1/delete-provider/${id}`)
          if (res.data.success) {
            localStorage.clear()
            window.location.href = '/'
          }
        } catch (error) {
          console.log("Internal server error", error)
        }
      }
    });
  }

  const [amount, setAmount] = useState("");
  const [commission, setCommission] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [commissionPercent, setCommissionPercent] = useState(0)

  const handleFetchCommission = async () => {
    try {
      const { data } = await axios.get('https://api.dessobuild.com/api/v1/get-all-commision')
      const commissiondata = data.data
      setCommissionPercent(commissiondata[0]?.commissionPercent)
    } catch (error) {
      console.log("Internale server error", error)
    }
  }

  useEffect(() => {
    handleFetchCommission();
  }, [])

  const handleAmountChange = (e) => {
    const inputAmount = parseFloat(e.target.value) || 0;
    const calculatedCommission = (inputAmount * commissionPercent) / 100;
    const calculatedFinalAmount = inputAmount - calculatedCommission;

    setAmount(e.target.value);
    setCommission(calculatedCommission);
    setFinalAmount(calculatedFinalAmount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      Swal.fire({
        title: 'Error!',
        text: "Please enter a valid amount.",
        icon: 'error',
        confirmButtonText: 'Okay'
      });
      return;
    }

    if (parseFloat(amount) > walletAmount) {
      Swal.fire({
        title: 'Error!',
        text: "Insufficient wallet balance.",
        icon: 'error',
        confirmButtonText: 'Okay'
      });
      return;
    }

    try {
      const response = await axios.post("https://api.dessobuild.com/api/v1/create-withdraw-request", {
        provider: myProfile._id,
        amount: parseFloat(amount),
        commission,
        finalAmount,
        providerWalletAmount: walletAmount,
        commissionPercent: commissionPercent
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setAmount("");
        setCommission(0);
        setFinalAmount(0);
        closeWithdrawModal();
      } else {
        Swal.fire({
          title: 'Error!',
          text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later",
          icon: 'error',
          confirmButtonText: 'Okay'
        });
      }
    } catch (error) {
      console.log("Failed to create withdrawal request. Please try again.", error)
      Swal.fire({
        title: 'Error!',
        text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later",
        icon: 'error',
        confirmButtonText: 'Okay'
      });
    }
  };

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const sendOtp = async () => {
    try {
      const response = await axios.post('https://api.dessobuild.com/api/v1/otp_send_before_update', { mobileNumber });
      if (response.data.success) {
        setOtpSent(true);
        setTimeout(() => {
          document.getElementById('otpModal').style.display = 'block';
        }, 200);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Try again.');
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post('https://api.dessobuild.com/api/v1/verify_otp_before_update', { mobileNumber, otp });
      if (response.data.success) {
        setIsOtpVerified(true);
        setActiveTab(3);
        setOtpSent(false);
        setOtp('');
        closeOtpModal();
        setTimeout(() => {
          document.getElementById('withdrawalModal').style.display = 'block';
        }, 200);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('OTP verification failed.');
    }
  };

  const closeOtpModal = () => {
    document.getElementById('otpModal').style.display = 'none';
  };

  const closeWithdrawModal = () => {
    document.getElementById('withdrawalModal').style.display = 'none';
  };

  if (token === null) {
    return (
      <div className="container my-5 text-center">
        <div className="w-100">
          <img
            src="https://i.ibb.co/C56bwYQ/401-Error-Unauthorized-pana.png"
            alt="401 Unauthorized"
            className="img-fluid mx-auto d-block mb-4"
            style={{ maxWidth: '80%', height: 'auto' }}
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

  if (loading) {
    return (
      <div className="forDisplayFlex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!myProfile) {
    return (
      <div className="container my-5 text-center">
        <div className="w-100">
          <img
            src="https://i.ibb.co/C56bwYQ/401-Error-Unauthorized-pana.png"
            alt="401 Unauthorized"
            className="img-fluid mx-auto d-block mb-4"
            style={{ maxWidth: '80%', height: 'auto' }}
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

  return (
    <div className='userdashboard-body-bg' style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container-fluid py-4 px-3 px-md-4">
        {/* Profile Header Card */}
        <div className="card shadow-lg border-0 mb-4" style={{ borderRadius: '15px' }}>
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="forDisplayFlex forjustify align-items-center">
                  <div className="position-relative me-4">
                    <label htmlFor="profile-upload" className="cursor-pointer">
                      <img
                        src={myProfile?.photo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(myProfile.name || 'User')}&background=random`}
                        alt="avatar"
                        className="rounded-circle object-cover"
                        style={{ width: '100px', height: '100px', cursor: 'pointer', border: '3px solid #042F66' }}
                      />
                    </label>
                    <input
                      type="file"
                      id="profile-upload"
                      style={{ display: 'none' }}
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
                    <p className="text-muted for-text-center mb-2">
                      <span className="badge bg-primary me-2 text-light">{myProfile?.type}</span>
                      <span className="me-2">₹{myProfile.pricePerMin}/min</span>
                    </p>
                    <div className="forDisplayFlex for-justify-center flex-wrap gap-2 mb-2">
                      {myProfile.language && myProfile.language.map((lang, index) => (
                        <span key={index} className="badge bg-light text-dark border">
                          {lang}
                        </span>
                      ))}
                    </div>
                    <div className="forDisplayFlex for-justify-center flex-wrap gap-2">
                      {myProfile.expertiseSpecialization && myProfile.expertiseSpecialization.map((spec, index) => (
                        <span key={index} className="badge bg-light text-dark border">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mt-3 mt-md-0">
                <div className="forDisplayFlex flex-column gap-3">
                  <a
                    className="btn btn-primary forDisplayFlex align-items-center justify-content-center"
                    href={`https://wa.me/?text=Join%20HelpUBuild%20and%20get%20amazing%20benefits!%20Register%20here:%20https://dessobuild.com/member-registration?ref=${myProfile?.couponCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: '#042F66', borderColor: '#042F66' }}
                  >
                    <i className="fa-solid fa-share me-2"></i> Refer & Earn
                  </a>
                  
                  <div style={{display:'flex'}} className="align-items-center justify-content-between bg-light p-3 rounded">
                    <span className="text-dark fw-medium">Available Balance:</span>
                    <span className="text-success fw-bold fs-5">₹{walletAmount}</span>
                  </div>
                  
                  <button 
                    onClick={() => sendOtp()} 
                    className="btn btn-outline-primary"
                    style={{ color: '#042F66', borderColor: '#042F66' }}
                  >
                    <i className="fas fa-wallet me-2"></i> Withdraw Funds
                  </button>
                </div>
              </div>
            </div>
            
            <hr className="my-4" />
            
            {/* Status Toggles */}
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="forDisplayFlex align-items-center justify-content-between p-3 bg-light rounded">
                  <span className="fw-medium">Chat Availability</span>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={statuses.chatStatus}
                      onChange={() => handleToggle('chatStatus')}
                      style={{ width: '3em', height: '1.5em' }}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="forDisplayFlex align-items-center justify-content-between p-3 bg-light rounded">
                  <span className="fw-medium">Call Availability</span>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={statuses.callStatus}
                      onChange={() => handleToggle('callStatus')}
                      style={{ width: '3em', height: '1.5em' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <ul className="nav nav-tabs nav-justified" id="dashboardTabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'Gallery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Gallery')}
                  style={{ 
                    color: activeTab === 'Gallery' ? '#042F66' : '#6c757d',
                    borderBottom: activeTab === 'Gallery' ? '3px solid #042F66' : 'none'
                  }}
                >
                  <i className="fas fa-image me-2"></i> Gallery
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'Portfolio' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Portfolio')}
                  style={{ 
                    color: activeTab === 'Portfolio' ? '#042F66' : '#6c757d',
                    borderBottom: activeTab === 'Portfolio' ? '3px solid #042F66' : 'none'
                  }}
                >
                  <i className="fas fa-briefcase me-2"></i> Portfolio
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                  style={{ 
                    color: activeTab === 'settings' ? '#042F66' : '#6c757d',
                    borderBottom: activeTab === 'settings' ? '3px solid #042F66' : 'none'
                  }}
                >
                  <i className="fas fa-cog me-2"></i> Settings
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'Withdraw' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Withdraw')}
                  style={{ 
                    color: activeTab === 'Withdraw' ? '#042F66' : '#6c757d',
                    borderBottom: activeTab === 'Withdraw' ? '3px solid #042F66' : 'none'
                  }}
                >
                  <i className="fas fa-history me-2"></i> Withdraw History
                </button>
              </li>
            </ul>
            
            {/* Action Buttons */}
            <div className="forDisplayFlex flex-wrap gap-2 mt-3">
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDeleteAccount(providerId)}
              >
                <i className="fas fa-trash me-1"></i> Delete Account
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleLogout()}
              >
                <i className="fas fa-sign-out-alt me-1"></i> Logout
              </button>
              <button
                className="btn btn-outline-warning btn-sm"
                onClick={() => handleIsDeactived(providerId, !myProfile.isDeactived)}
              >
                <i className="fas fa-user-slash me-1"></i> 
                {myProfile.isDeactived ? "Activate Account" : "Deactivate Account"}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Gallery Tab */}
          {activeTab === "Gallery" && (
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="forDisplayFlex justify-content-between align-items-center mb-4">
                  <h4 className="card-title mb-0 text-primary" style={{ color: '#042F66' }}>
                    <i className="fas fa-image me-2"></i>Your Work Gallery
                  </h4>
                  <button
                    onClick={() => setShowGalleryUpload(!showGalleryUpload)}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#042F66', borderColor: '#042F66' }}
                  >
                    <i className="fas fa-plus me-2"></i>
                    {showGalleryUpload ? 'View Gallery' : 'Add Images'}
                  </button>
                </div>
                
                {showGalleryUpload ? (
                  <UploadGallery isShow={showGalleryUpload} token={token} />
                ) : (
                  <>
                    {myProfile?.portfolio?.GalleryImages?.length > 0 ? (
                      <div className="row g-3">
                        {myProfile.portfolio.GalleryImages.map((image, index) => (
                          <div key={index} className="col-6 col-md-4 col-lg-3">
                            <div className="gallery-item rounded overflow-hidden shadow-sm">
                              <img 
                                src={image.url} 
                                alt={`Gallery ${index + 1}`}
                                className="img-fluid w-100"
                                style={{ height: '200px', objectFit: 'cover' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="fas fa-image fa-4x text-muted mb-3"></i>
                        <h5 className="text-muted">No images in your gallery yet</h5>
                        <p className="text-muted">Upload images to showcase your work</p>
                        <button
                          onClick={() => setShowGalleryUpload(true)}
                          className="btn btn-primary mt-2"
                          style={{ backgroundColor: '#042F66', borderColor: '#042F66' }}
                        >
                          <i className="fas fa-upload me-2"></i>Upload Images
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                <div className="mt-5">
                  <Reviews />
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'Portfolio' && (
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="forDisplayFlex justify-content-between align-items-center mb-4">
                  <h4 className="card-title mb-0 text-primary" style={{ color: '#042F66' }}>
                    <i className="fas fa-briefcase me-2"></i>My Portfolio
                  </h4>
                  {myProfile?.portfolio?.PortfolioLink && reUploadTrue === false && (
                    <button
                      onClick={() => setReUploadTrue(true)}
                      className="btn btn-outline-primary"
                      style={{ color: '#042F66', borderColor: '#042F66' }}
                    >
                      <i className="fas fa-edit me-2"></i>Update Portfolio
                    </button>
                  )}
                </div>
                
                {reUploadTrue === false && (
                  <Portfolio fileUrl={myProfile?.portfolio?.PortfolioLink} />
                )}

                {reUploadTrue && (
                  <>
                    <div className="forDisplayFlex justify-content-end gap-2 mb-4">
                      <button
                        onClick={() => setReUploadTrue(false)}
                        className="btn btn-outline-secondary"
                      >
                        <i className="fas fa-eye me-2"></i>View Portfolio
                      </button>
                      <button
                        onClick={handleUpload}
                        className="btn btn-primary"
                        disabled={uploading || files.length === 0}
                        style={{ backgroundColor: '#042F66', borderColor: '#042F66' }}
                      >
                        {uploading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-upload me-2"></i>Upload Portfolio
                          </>
                        )}
                      </button>
                    </div>

                    <div
                      {...getRootProps()}
                      className="dropzone-border p-5 text-center rounded bg-light cursor-pointer"
                      style={{ border: '2px dashed #042F66' }}
                    >
                      <input {...getInputProps()} />
                      <i className="fas fa-cloud-upload-alt text-primary fa-3x mb-3" style={{ color: '#042F66' }}></i>
                      <h5 className="text-dark">Drag & drop your PDF files here</h5>
                      <p className="text-muted">or click to browse your files</p>
                      <p className="text-muted small">Maximum 5 PDF files, 15MB each</p>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4">
                        <h6 className="text-dark mb-3">Selected Files:</h6>
                        <div className="row">
                          {files.map((file, index) => (
                            <div key={index} className="col-md-6 col-lg-4 mb-3">
                              <div className="card border-0 shadow-sm">
                                <div className="card-body forDisplayFlex align-items-center">
                                  <i className="fas fa-file-pdf text-danger fa-2x me-3"></i>
                                  <div className="flex-grow-1 text-truncate">
                                    <p className="mb-0 text-truncate">{file.name}</p>
                                    <small className="text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

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

          {/* Withdraw History Tab - UNCHANGED AS REQUESTED */}
          {activeTab === "Withdraw" && (
            <div id='Withdraw' className="w-100 py-4 mt-5 mb-3">
              <h2 className='foraligncenter'>
                <i className="fas fa-user-cog text-dark me-2" />
                Withdraw History
              </h2>
              <Withdraw data={myProfile} />
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal - UNCHANGED AS REQUESTED */}
      <div
        className="modal fade show"
        id="withdrawalModal"
        style={{ display: 'none' }}
        tabIndex="-1"
        aria-labelledby="withdrawalModalLabel"
        aria-hidden="true"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="withdrawalModalLabel">
                Create Withdrawal Request
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeWithdrawModal}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">
                    Enter Amount
                  </label>
                  <input
                    style={{ border: '1px solid #0000001a' }}
                    type="number"
                    className="form-control"
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter withdrawal amount"
                  />
                </div>

                <div className="mt-4">
                  <p className="text-muted">
                    <strong>Commission Percentage:</strong> {commissionPercent}%
                  </p>
                  <p className="text-muted">
                    <strong>Commission Amount:</strong> ₹{commission.toFixed(2)}
                  </p>
                  <p className="text-muted">
                    <strong>Final Amount:</strong> ₹{finalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeWithdrawModal}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Modal - UNCHANGED AS REQUESTED */}
      {otpSent && (
        <div id="otpModal" className="modal fade show" style={{ display: 'block' }} aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">OTP Verification</h4>
                <button type="button" className="btn-close" onClick={closeOtpModal}></button>
              </div>
              <div className="modal-body">
                <p>An OTP has been sent to your registered mobile number: <strong>{mobileNumber}</strong></p>
                <input
                  type="text"
                  className="form-control mt-2 border"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeOtpModal}>Cancel</button>
                <button className="btn btn-primary" onClick={verifyOtp}>Verify OTP</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;