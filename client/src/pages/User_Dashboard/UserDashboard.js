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
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [reUploadTrue, setReUploadTrue] = useState(true);
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);

  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false)

  const [token, setToken] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Gallery')
  const [mobileNumber, setMobileNumber] = useState('')

  const [walletAmount, setWalletAmount] = useState(0);

  // Get token from session storage
  const GetToken = () => {
    const data = GetData('token');
    const user = GetData('user');
    const UserData = JSON.parse(user);
    if (data) {
      setToken(data);
    }
    if (UserData) {
      setProviderId(UserData._id)
    }
  };

  // console.log("token ",myProfile)

  const GetMyProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/get-single-provider/${providerId}`);
      // console.log(data)
      setMyProfile(data.data);
      setMobileNumber(data.data.mobileNumber)
      const formattedAmount = data.data.walletAmount.toFixed(2);

      setWalletAmount(formattedAmount);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching profile:', error);
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
      GetMyProfile(); // Fetch profile only if token exists
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
      const response = await axios.post('https://api.helpubuild.co.in/api/v1/addPortfolio?type=Portfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },

      });
      // toast.success('Portfolio uploaded successfully');
      Swal.fire({
        title: 'Success!',
        text: 'Portfolio uploaded successfully',
        icon: 'success', // use lowercase
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
      const res = await axios.put(`https://api.helpubuild.co.in/api/v1/update_provider_profile_image/${providerId}`, formData)
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

  // const handleLogout = () => {
  //   window.location.href = '/'
  // }

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
          const res = await axios.delete(`https://api.helpubuild.co.in/api/v1/delete-provider/${id}`)
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
      const { data } = await axios.get('https://api.helpubuild.co.in/api/v1/get-all-commision')
      const commissiondata = data.data
      // console.log("commission",commissiondata[0]?.commissionPercent)
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
    // setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      // setError("Please enter a valid amount.");
      // toast.error("Please enter a valid amount.");
      Swal.fire({
        title: 'Error!',
        text: "Please enter a valid amount.",
        icon: 'error', // use lowercase
        confirmButtonText: 'Okay'
      });
      return;
    }

    if (parseFloat(amount) > walletAmount) {
      // setError("Insufficient wallet balance.");
      // toast.error("Insufficient wallet balance.");
      Swal.fire({
        title: 'Error!',
        text: "Insufficient wallet balance.",
        icon: 'error', // use lowercase
        confirmButtonText: 'Okay'
      });
      return;
    }

    try {
      const response = await axios.post("https://api.helpubuild.co.in/api/v1/create-withdraw-request", {
        provider: myProfile._id,
        amount: parseFloat(amount),
        commission,
        finalAmount,
        providerWalletAmount: walletAmount,
        commissionPercent: commissionPercent
      });

      if (response.data.success) {
        // toast.success(response.data.message);
        setAmount("");
        setCommission(0);
        setFinalAmount(0);
      } else {
        // setError(response.data.message);
        // toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
        Swal.fire({
          title: 'Error!',
          text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later",
          icon: 'error', // use lowercase
          confirmButtonText: 'Okay'
        });
      }
    } catch (error) {
      console.log("Failed to create withdrawal request. Please try again.", error)
      // toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
      Swal.fire({
        title: 'Error!',
        text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later",
        icon: 'error', // use lowercase
        confirmButtonText: 'Okay'
      });
    }
  };

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  // const mobileNumber = myProfile.mobileNumber

  const sendOtp = async () => {
    try {
      const response = await axios.post('https://api.helpubuild.co.in/api/v1/otp_send_before_update', { mobileNumber });
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

  // Function to verify OTP
  const verifyOtp = async () => {
    try {
      const response = await axios.post('https://api.helpubuild.co.in/api/v1/verify_otp_before_update', { mobileNumber, otp });
      if (response.data.success) {
        setIsOtpVerified(true);
        setActiveTab(3); // Open BankDetail after OTP verification
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

  // Close OTP Modal
  const closeOtpModal = () => {
    document.getElementById('otpModal').style.display = 'none';
  };

  const closeWithdrawModal = () => {
    document.getElementById('withdrawalModal').style.display = 'none';
  };


  if (token === null) {
    return <div className="container my-5 text-center">
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
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!myProfile) {
    return <div className="container my-5 text-center">
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

  }

  return (
    <div className='userdashboard-body-bg'>
      <div className="w-100 mx-auto py-5 h-100 px-2">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col col-xl-12">
            <div className="card  profile-card-header" style={{ borderRadius: 15 }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between">
                  <div className="d-flex flex-row align-items-start">
                    <div style={{ alignItems: 'center' }} className='mb-2 providerProfileHeading'>
                      <a>
                        <div className='' style={{ position: 'relative' }}>
                          <label htmlFor="profile-upload">
                            <img
                              src={myProfile?.photo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(myProfile.name || 'User')}&background=random`}
                              alt="avatar"
                              className="img-fluid object-cover rounded-circle me-3"
                              style={{ width: '80px', height: '80px', cursor: 'pointer' }}
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
                            <span className="badge" style={{
                              position: 'absolute',
                              top: '0',
                              right: '0',
                              padding: '5px',
                              backgroundColor: '#090986',
                              color: 'white'
                            }}>
                              Verified
                            </span>
                          )}
                          {showCropper && selectedImage && (
                            <CropperModal
                              imageSrc={selectedImage}
                              onClose={() => setShowCropper(false)}
                              onCropComplete={handleCropComplete}
                              profileLoading= {profileLoading}
                            />
                          )}
                        </div>
                      </a>
                    </div>
                    <div style={{}} className=''>
                      <h3 className="mb-3 foraligncenter">{myProfile.name}</h3>
                      <p className="small mb-2 foraligncenter">
                        {/* <i className="fas fa-star fa-lg text-warning" />{" "} */}
                        <span>{myProfile?.type}</span>
                        <span className="mx-2">|</span>
                        {`₹ ${myProfile.pricePerMin}/min`} <span className="mx-2">|</span>

                        <span>{myProfile.language && myProfile.language.map((lang, index) => {
                          return (
                            <span key={index} className="archi-language-tag">
                              {lang}{index < myProfile.language.length - 1 ? ', ' : ''}
                            </span>
                          );
                        }) || ''}</span>
                        <span className="mx-2">|</span>
                        <span>{myProfile.expertiseSpecialization && myProfile.expertiseSpecialization.map((lang, index) => {
                          return (
                            <span key={index} className="archi-language-tag">
                              {lang}{index < myProfile.expertiseSpecialization.length - 1 ? ', ' : ''}
                            </span>
                          );
                        }) || ''}</span>
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex' }} className=" flex-column gap-2 align-items-center justify-content-center">
                    <a
                      className="architectur-bar btn btn-primary align-items-center justify-content-center"
                      style={{ display: 'flex', gap: '8px', padding: '8px 16px', borderRadius: '8px' }}
                      href={`https://wa.me/?text=Join%20HelpUBuild%20and%20get%20amazing%20benefits!%20Register%20here:%20https://helpubuild.co.in/member-registration?ref=${myProfile?.couponCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Refer <i className="fa-solid fa-share"></i>
                    </a>



                    <div style={{ display: 'flex' }} className='architectur-bar'>
                      <div className="available-balance medium-device-balance"> Available balance: <main class="balance-avail"> ₹ {walletAmount} </main></div>
                    </div>
                    {/* <div style={{display:'flex',gap:'10px'}}> */}
                    <a onClick={() => sendOtp()} className="profileRecharge">Withdrawal</a>

                    {/* </div> */}
                  </div>
                </div>

                <hr className="my-4" />
                <div className="featured-list d-flex justify-content-start align-items-center">
                  <p onClick={() => setActiveTab('settings')} style={{ fontWeight: '700' }} className="mb-0 text-uppercase forresponsicetab">
                    <i className="fas fa-cog me-2" />{" "}
                    <a href='#settings' style={{ cursor: 'pointer', color: 'black' }} className={`cursor-pointer ${activeTab === 'settings' ? 'text-danger fw-bold text-decoration-underline' : ''}`}>
                      settings
                    </a>
                  </p>
                  <p onClick={() => setActiveTab('Portfolio')} style={{ fontWeight: '700' }} className="mb-0 cursor-pointer text-uppercase forresponsicetab">
                    <i className="fas fa-link marginnone" />{" "}
                    <a href='#portfolio' style={{ cursor: 'pointer', color: 'black' }} className={`cursor-pointer ${activeTab === 'Portfolio' ? 'text-danger fw-bold text-decoration-underline' : ''}`}>
                      Portfolio
                    </a>
                  </p>

                  <p onClick={() => setActiveTab('Wallet')} style={{ fontWeight: '700' }} className="mb-0 cursor-pointer text-uppercase forresponsicetab">
                    <i className="fas fa-link marginnone" />{" "}
                    <a href='#wallet' style={{ cursor: 'pointer', color: 'black' }} className={`cursor-pointer ${activeTab === 'Wallet' ? 'text-danger fw-bold text-decoration-underline' : ''}`}>
                      Wallet
                    </a>
                  </p>

                  <p onClick={() => setActiveTab('Withdraw')} style={{ fontWeight: '700' }} className="mb-0 cursor-pointer text-uppercase forresponsicetab">
                    <i className="fas fa-link marginnone" />{" "}
                    <a href='#withdraw' style={{ cursor: 'pointer', color: 'black' }} className={`cursor-pointer ${activeTab === 'Withdraw' ? 'text-danger fw-bold text-decoration-underline' : ''}`}>
                      Withdraw History
                    </a>
                  </p>

                  <p onClick={() => setActiveTab('Gallery')} style={{ fontWeight: '700' }} className="mb-0 cursor-pointer text-uppercase forresponsicetab marginrightmore">
                    <i className="fas fa-link marginnone" />{" "}
                    <a href='#gallery' style={{ cursor: 'pointer' }} className={`cursor-pointer ${activeTab === 'Gallery' ? 'text-danger fw-bold text-decoration-underline' : ''}`}>
                      Gallery
                    </a>
                    {/* <span className="ms-3 me-4">|</span> */}
                  </p>


                  <button
                    type="button"
                    className="btn forbtnwidth logout_btn mt-2 mx-2 btn-sm btn-floating"
                    title="Delete Account"
                    onClick={() => handleDeleteAccount(providerId)}
                  >
                    Delete Account <i className="fas fa-trash text-body"></i>
                  </button>

                  <button
                    type="button"
                    className="btn forbtnwidth logout_btn mt-2 mx-2 btn-sm btn-floating"
                    title="Logout"
                    onClick={() => handleLogout()}
                  >
                    Logout  <i className="fas fa-sign-out-alt text-body"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>


        {activeTab === "Gallery" && (

          <div id='gallery' className="w-100 py-4 mt-4 mb-3">
            <div className='work-gallery-heading d-flex justify-content-between'>

              <div>
                <h2 className='work-gallery-heading'>
                  <i className="fas fa-lightbulb text-warning me-2" />
                  Your Work Gallery
                  {/* <hr /> */}
                </h2>
              </div>
              <div>
                <div className="add-gallery-btn text-end">
                  <button
                    onClick={() => setShowGalleryUpload(!showGalleryUpload)}
                    className="btn btn-outline-danger btn-lg"
                  >
                    <i className="fas fa-image me-2"></i>
                    Add Gallery
                  </button>
                </div>
              </div>
            </div>
            <div>
              {/* Button to toggle gallery upload */}


              {/* Check if gallery upload is shown */}
              {showGalleryUpload ? (
                <UploadGallery isShow={showGalleryUpload} token={token} />
              ) : (
                <>

                  <div className=" my-5">


                    {myProfile?.portfolio?.GalleryImages?.length > 0 ? (
                      <div className="row g-4">
                        {/* Large item (1st image) */}
                        <div className="col-md-8">
                          <div
                            className="bento-item bento-tall"
                            style={{
                              backgroundImage: `url(${myProfile.portfolio.GalleryImages[0]?.url || "placeholder-large.jpg"})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              height: "300px",
                              borderRadius: "8px",
                            }}
                          ></div>
                        </div>

                        {/* Two small items (2nd and 3rd images) */}
                        <div className="col-md-4">
                          <div className="row g-4">
                            {[1, 2].map((i) => (
                              <div key={i} className="col-12">
                                <div
                                  className="bento-item"
                                  style={{
                                    backgroundImage: `url(${myProfile.portfolio.GalleryImages[i]?.url || "placeholder-small.jpg"})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    height: "140px",
                                    borderRadius: "8px",
                                  }}
                                ></div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Three medium items (4th, 5th, and 6th images) */}
                        {[3, 4, 5].map((i) => (
                          <div key={i} className="col-md-4">
                            <div
                              className="bento-item"
                              style={{
                                backgroundImage: `url(${myProfile.portfolio.GalleryImages[i]?.url || "placeholder-medium.jpg"})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                height: "200px",
                                borderRadius: "8px",
                              }}
                            ></div>
                          </div>
                        ))}

                        {/* Remaining items (7th to 12th images) */}
                        {[6, 7, 8, 9, 10, 11].map((i) => (
                          <div key={i} className="col-md-4">
                            <div
                              className="bento-item"
                              style={{
                                backgroundImage: `url(${myProfile.portfolio.GalleryImages[i]?.url || "placeholder-medium.jpg"})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                height: "200px",
                                borderRadius: "8px",
                              }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Error Handling */
                      <div className="text-center">
                        <h3 className="text-danger">No images available in the gallery!</h3>
                        <p className="text-muted">Please upload images to view them in your gallery.</p>
                        <div className="add-gallery-btn ">
                          <button
                            onClick={() => setShowGalleryUpload(!showGalleryUpload)}
                            className="btn btn-outline-danger btn-lg"
                          >
                            <i className="fas fa-image me-2"></i>
                            Add Gallery
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </>
              )}
              <Reviews />
            </div>

          </div>

        )}
        <>
          {activeTab === 'Portfolio' && (
            <div id='portfolio' className="w-100 py-4 mt-5 mb-3">
              <div style={{ display: 'flex' }} className='align-item-center forbetweenandcenter'>
                <div>
                  <h2>
                    <i className="fas fa-briefcase text-primary me-2" />
                    My Portfolio
                  </h2>
                </div>
                <div>
                  {myProfile?.portfolio?.PortfolioLink && reUploadTrue === false && (
                    <>
                      <div className="text-end mt-4">
                        <button
                          onClick={() => setReUploadTrue(true)}
                          className="btn mb-3 btn-outline-danger btn-lg update-portfolio-btn"
                        >
                          <i className="fas fa-upload me-2"></i>
                          Update Portfolio
                        </button>
                      </div>

                    </>
                  )}
                </div>
              </div>
              {reUploadTrue === false && (
                <Portfolio fileUrl={myProfile?.portfolio?.PortfolioLink} />
              )}

              <div className=' col-md-12'>
                {
                  reUploadTrue && (
                    <>
                      <div className="text-end portfolio-design ">
                        <button
                          onClick={() => setReUploadTrue(false)}
                          className="btn mb-3 btn-outline-info me-3 btn-lg view-portfolio-btn"
                        >
                          <i className="fas fa-eye me-2"></i>

                          View Portfolio
                        </button>
                        <button
                          onClick={handleUpload}
                          className="btn mb-3 btn-lg upload-portfolio-btn"

                          disabled={uploading || files.length === 0}
                        >
                          <i className="fas fa-upload me-2"></i>
                          {uploading ? 'Uploading...' : 'Upload Portfolio'}
                        </button>
                      </div>


                      <div
                        {...getRootProps()}
                        className="dropzone text-center border-3 border-primary p-5 rounded-lg shadow-lg transition-all hover:shadow-xl hover:bg-gray-100"
                        style={{
                          background: '#f7f7f7',
                          cursor: 'pointer',
                        }}
                      >
                        <input {...getInputProps()} />
                        <h5 className="text-muted mb-3">
                          Drag & drop your PDF here, or click to select files
                        </h5>
                        <p className="text-muted mb-4">Max file size: 10MB</p>
                        <i className="fas fa-cloud-upload-alt text-primary fa-4x mb-3" />
                        <p className="text-muted">Only PDF files are allowed</p>
                      </div>
                      <div className="mt-4">
                        {files.length > 0 && (
                          <div className="row">
                            {files.map((file, index) => (
                              <div key={index} className="col-12 col-md-4 mb-3">
                                <div className="card border-0 shadow-sm">
                                  <div className="card-body text-center">
                                    <i className="fas fa-file-pdf text-danger fa-3x mb-2"></i>
                                    <p className="card-text">{file.name}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )
                }


              </div>





            </div>
          )}
        </>

        {activeTab === "settings" && (
          <div id='settings' className="w-100 py-4 mt-5 mb-3">
            <h2 className='foraligncenter'>
              <i className="fas fa-user-cog text-dark me-2" />
              My Settings

            </h2>

            {/* Settings Form */}
            <Settings data={myProfile} />

          </div>
        )}

        {activeTab === "Wallet" && (
          <div id='wallet' className="w-100 py-4 mt-5 mb-3">
            <h2 className='foraligncenter'>
              <i className="fas fa-user-cog text-dark me-2" />
              My Wallet

            </h2>

            <Wallet data={myProfile} />

          </div>
        )}

        {activeTab === "Withdraw" && (
          <div className="w-100 py-4 mt-5 mb-3">
            <a href="#withdraw" className='foraligncenter'>
              <i className="fas fa-user-cog text-dark me-2" />
              Withdraw History

            </a>

            <Withdraw data={myProfile} />

          </div>
        )}

      </div>

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
