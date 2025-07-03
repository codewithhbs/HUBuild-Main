import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { GetData } from '../../../utils/sessionStoreage';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import Select from 'react-select';

const Profile = () => {
  const Data = GetData('user');
  const UserData = JSON.parse(Data);
  const UserId = UserData?._id;
  const role = UserData?.type;
  const [expertise, setExpertise] = useState([]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [newMobileNumber, setNewMobileNumber] = useState('');
  const [originalMobileNumber, setOriginalMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(true); // Assume verified initially
  const [priceError, setPriceError] = useState(''); // New state for price validation
  const otpInputRef = useRef(null);

  // Language options for dropdown
  const languageOptions = [
    { label: 'Hindi', value: 'Hindi' },
    { label: 'English', value: 'English' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    DOB: '',
    language: [],
    mobileNumber: '',
    coaNumber: '',
    location: {
      state: "",
      city: "",
      pincode: "",
      formatted_address: ""
    },
    pricePerMin: '',
    bio: '',
    expertiseSpecialization: [],
    yearOfExperience: ''
  });

  useEffect(() => {
    const fetchExpertise = async () => {
      try {
        const { data } = await axios.get('https://api.helpubuild.in/api/v1/all_expertise');
        const formattedExpertise = data.data.map((exp) => ({ label: exp.expertise, value: exp.expertise }));
        setExpertise(formattedExpertise);
      } catch (error) {
        console.log("Internal server error", error);
      }
    };
    fetchExpertise();
  }, []);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobileNumber') {
      setNewMobileNumber(value);
      setMobileVerified(value === originalMobileNumber);
    } else if (name === 'pricePerMin') {
      // Validate price per minute
      const priceValue = parseFloat(value);
      if (value && priceValue < 20) {
        setPriceError('Price per minute must be 20 or more');
      } else {
        setPriceError('');
      }

      const keys = name.split('.');
      setFormData((prevFormData) => {
        const updatedForm = { ...prevFormData };
        let temp = updatedForm;

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!temp[key]) temp[key] = {};
          temp = temp[key];
        }

        temp[keys[keys.length - 1]] = value;
        return updatedForm;
      });
    } else {
      const keys = name.split('.');

      setFormData((prevFormData) => {
        const updatedForm = { ...prevFormData };
        let temp = updatedForm;

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          // Ensure intermediate objects exist
          if (!temp[key]) temp[key] = {};
          temp = temp[key];
        }

        temp[keys[keys.length - 1]] = value;
        return updatedForm;
      });
    }
  };

  const handleSelectChange = (selectedOptions) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      expertiseSpecialization: selectedOptions
    }));
  };

  // Handle language dropdown change
  const handleLanguageChange = (selectedOptions) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      language: selectedOptions
    }));
  };

  const handleFetchProvider = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `https://api.helpubuild.in/api/v1/get-single-provider/${UserId}`
      );
      const allData = data.data;

      // Convert language string to array format for react-select
      let languageArray = [];
      if (allData.language) {
        if (typeof allData.language === 'string') {
          // If it's a string, split by comma and convert to array
          const languages = allData.language.split(',').map(lang => lang.trim());
          languageArray = languages.map(lang => ({ label: lang, value: lang }));
        } else if (Array.isArray(allData.language)) {
          // If it's already an array, format it properly
          languageArray = allData.language.map(lang => ({ label: lang, value: lang }));
        }
      }

      setFormData({
        name: allData.name || '',
        email: allData.email || '',
        DOB: allData.DOB || '',
        language: languageArray,
        mobileNumber: allData.mobileNumber || '',
        coaNumber: allData.coaNumber || '',
        location: {
          city: allData?.location?.city,
          state: allData?.location?.state || "",
          pincode: allData?.location?.pincode,
          formatted_address: allData?.location?.formatted_address
        },
        pricePerMin: allData.pricePerMin || '',
        bio: allData.bio || '',
        expertiseSpecialization: allData.expertiseSpecialization.map(exp => ({ label: exp, value: exp })) || [],
        yearOfExperience: allData.yearOfExperience || ''
      });

      // Store both original and current mobile number
      setOriginalMobileNumber(allData.mobileNumber || '');
      setNewMobileNumber(allData.mobileNumber || '');
    } catch (error) {
      console.log('Error fetching provider data', error);
      toast.error('Failed to fetch profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    console.log("Sending OTP for new number:", newMobileNumber);

    // Don't send OTP if number hasn't changed
    if (newMobileNumber === originalMobileNumber) {
      console.log("Mobile number unchanged, no OTP needed");
      setMobileVerified(true);
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post(
        `https://api.helpubuild.in/api/v1/provider_number_change_request/${UserId}`,
        { newMobileNumber },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setShowOtpModal(true);
        setOtp(''); // Clear previous OTP if any
        toast.success('OTP sent successfully');

        // Focus on OTP input when modal opens
        setTimeout(() => {
          if (otpInputRef.current) {
            otpInputRef.current.focus();
          }
        }, 100);
      }
    } catch (error) {
      console.log('Error sending OTP:', error.response?.data || error.message);
      Swal.fire({
        title: 'Error!',
        text: error?.response?.data?.message || 'Failed to send OTP. Please try again.',
        icon: 'error',
        confirmButtonText: 'Okay'
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    try {
      const response = await axios.post(
        `https://api.helpubuild.in/api/v1/verify_provider_change_number/${UserId}`,
        {
          otp,
          newMobileNumber
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setShowOtpModal(false);
        setOtp('');
        setMobileVerified(true);

        // Update the formData with verified number
        setFormData(prevFormData => ({
          ...prevFormData,
          mobileNumber: newMobileNumber
        }));

        // Update the original mobile number to the new one
        setOriginalMobileNumber(newMobileNumber);

        Swal.fire({
          title: 'Success!',
          text: 'Mobile number verified successfully',
          icon: 'success',
          confirmButtonText: 'Okay'
        });
      }
    } catch (error) {
      console.log('Error verifying OTP:', error.response?.data || error.message);
      Swal.fire({
        title: 'Error!',
        text: error?.response?.data?.message || 'Failed to verify OTP. Please try again.',
        icon: 'error',
        confirmButtonText: 'Okay'
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate price per minute before submission
    const priceValue = parseFloat(formData.pricePerMin);
    if (formData.pricePerMin && priceValue < 20) {
      Swal.fire({
        title: 'Invalid Price!',
        text: 'Price per minute must be 20 or more.',
        icon: 'error',
        confirmButtonText: 'Okay'
      });
      return;
    }

    // If mobile number is changed but not verified, send OTP first
    if (!mobileVerified) {
      handleSendOtp();
      return;
    }

    setLoading(true);

    try {
      // Make sure to use the newly verified mobile number
      const payload = {
        ...formData,
        mobileNumber: newMobileNumber,
        expertiseSpecialization: formData.expertiseSpecialization.map(exp => exp.value),
        language: formData.language.map(lang => lang.value), // Convert language array to values
      };

      const response = await axios.put(
        `https://api.helpubuild.in/api/v1/update-provider-profile/${UserId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Update Response:', response.data);
      Swal.fire({
        title: 'Profile Updated!',
        text: response.data.message,
        icon: 'success',
        confirmButtonText: 'Okay'
      });

    } catch (error) {
      console.log('Error updating profile:', error.response?.data || error.message);
      Swal.fire({
        title: 'Error!',
        text: error?.response?.data?.message || 'Failed to update profile. Please try again.',
        icon: 'error',
        confirmButtonText: 'Okay'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change separately to prevent focus loss
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  useEffect(() => {
    handleFetchProvider();
  }, []);

  return (
    <div className="mt-5">
      <h1 className="text-center mb-4">Profile</h1>

      {/* OTP Modal - Extracted outside main component to prevent re-renders */}
      {showOtpModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Verify OTP</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOtpModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>We've sent an OTP to your mobile number: {formData.mobileNumber}</p>
                <div className="mb-3">
                  <label htmlFor="otp" className="form-label">Enter OTP</label>
                  <input
                    type="text"
                    className="form-control"
                    id="otp"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="Enter 6-digit OTP"
                    ref={otpInputRef}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-4">
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="name" style={{ fontWeight: '700' }} className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="email" style={{ fontWeight: '700' }} className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="DOB" style={{ fontWeight: '700' }} className="form-label">
              Date of Birth
            </label>
            <input
              type="date"
              className="form-control"
              id="DOB"
              name="DOB"
              value={formData.DOB}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="language" style={{ fontWeight: '700' }} className="form-label">
              Language
            </label>
            <Select
              id="language"
              name="language"
              options={languageOptions}
              value={formData.language}
              onChange={handleLanguageChange}
              isMulti
              placeholder="Select languages..."
            />
          </div>
          <div className="col-md-6 mt-2">
            <label htmlFor="mobileNumber" style={{ fontWeight: '700' }} className="form-label">
              Mobile Number
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                id="mobileNumber"
                name="mobileNumber"
                value={newMobileNumber}
                onChange={handleChange}
              />
              {!mobileVerified && (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? 'Sending...' : 'Verify'}
                </button>
              )}
            </div>
            {!mobileVerified && (
              <small className="text-danger">You'll need to verify this new number.</small>
            )}
          </div>
          {
            role === 'Architect' && (
              <div className="col-md-6 mt-2">
                <label htmlFor="coaNumber" style={{ fontWeight: '700' }} className="form-label">
                  COA Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="coaNumber"
                  name="coaNumber"
                  value={formData.coaNumber}
                  onChange={handleChange}
                />
              </div>
            )
          }
          <div className="col-md-6 mt-2">
            <label htmlFor="pricePerMin" style={{ fontWeight: '700' }} className="form-label">
              Price Per Minute (Set more than 20)
            </label>
            {/* <div className="mb-1">
              <small className="text-primary fw-bold"></small>
            </div> */}
            <input
              type="number"
              className={`form-control ${priceError ? 'is-invalid' : ''}`}
              id="pricePerMin"
              name="pricePerMin"
              value={formData.pricePerMin}
              onChange={handleChange}
              min="20"
            />
            <div className="mt-1">
              <small className="text-muted">25% commission included</small>
            </div>
            {priceError && (
              <div className="invalid-feedback d-block">
                {priceError}
              </div>
            )}
          </div>
          <div className="row mt-2">
            <div className="col-md-6 mb-3">
              <label className="form-label">State</label>
              <input
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">City</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="location.pincode"
                value={formData.location.pincode}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                name="location.formatted_address"
                value={formData.location.formatted_address}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="col-md-6 mt-2">
            <label htmlFor="yearOfExperience" style={{ fontWeight: '700' }} className="form-label">
              Year Of Experience
            </label>
            <input
              type="text"
              className="form-control"
              id="yearOfExperience"
              name="yearOfExperience"
              value={formData.yearOfExperience}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mt-2">
            <label htmlFor="expertiseSpecialization" style={{ fontWeight: '700' }} className="form-label font-weight-bold">
              Expertise/Specialization
            </label>
            <Select
              id="expertiseSpecialization"
              name="expertiseSpecialization"
              options={expertise}
              value={formData.expertiseSpecialization}
              onChange={handleSelectChange}
              isMulti
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="bio" style={{ fontWeight: '700' }} className="form-label">
            Bio
          </label>
          <textarea
            className="form-control"
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        <div className="col-md-12 mt-2 submit-button-container">
          <button
            type="submit"
            className="btn as_btn text-white"
            disabled={loading || !mobileVerified || priceError}
          >
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
        {!mobileVerified && (
          <div className="alert alert-warning mt-3">
            Please verify your new mobile number before updating your profile.
          </div>
        )}
        {priceError && (
          <div className="alert alert-danger mt-3">
            Please fix the price per minute error before updating your profile.
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;