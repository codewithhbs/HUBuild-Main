import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function Forget() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmitFirst = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://api.helpubuild.co.in/api/v1/forgot-password', {
        mobileNumber,
      });

      if (response.data.success) {
        // toast.success('OTP has been sent on whatsapp.');
        Swal.fire({
          title: 'OTP Sended!',
          text: response.data.message,
          icon: 'success', // use lowercase
          confirmButtonText: 'Okay'
        });
        setIsOtpSent(true);
      } else {
        // toast.error(response.data.message || 'Something went wrong!');
        Swal.fire({
          title: 'Error!',
          text: response.data.message || 'Something went wrong!',
          icon: 'error', // use lowercase
          confirmButtonText: 'Okay'
        });
      }
    } catch (err) {
      console.log("Error: " + err);
      // toast.error(err?.response?.data?.message || 'Server error, please try again later.');
      Swal.fire({
        title: 'Error!',
        text: err?.response?.data?.message || 'Server error, please try again later.',
        icon: 'error', // use lowercase
        confirmButtonText: 'Okay'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOtp = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://api.helpubuild.co.in/api/v1/Changepassword', {
        mobileNumber,
        otp,
        password,
      });

      if (response.data.success) {
        // toast.success('Password reset successful. Redirecting...');
        Swal.fire({
          title: 'Password reset successful!',
          text: response.data.message || 'Password reset successful. Redirecting...',
          icon: 'success', // use lowercase
          confirmButtonText: 'Cool'
        });
        window.location.href = '/login';
      } else {
        // toast.error(response.data.message || 'Invalid OTP, please try again.');
        Swal.fire({
          title: 'Error!',
          text: response.data.message || 'Invalid OTP, please try again.',
          icon: 'error', // use lowercase
          confirmButtonText: 'Okay'
        });
      }
    } catch (err) {
      console.log("OTP Error: " + err);
      // toast.error(err?.response?.data?.message || 'Verification failed, please try again.');
      Swal.fire({
        title: 'Error!',
        text: err?.response?.data?.message || 'Verification failed, please try again.',
        icon: 'error', // use lowercase
        confirmButtonText: 'Okay'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-body">
              <h3 className="text-center mb-4">Forgot Password</h3>
              {!isOtpSent ? (
                <form onSubmit={handleSubmitFirst}>
                  <div className="form-group mb-3">
                    <label>Mobile Number</label>
                    <input type="text" className="form-control" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required minLength="10" maxLength="10" pattern="\d{10}" placeholder="Enter your mobile number" />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmitOtp}>
                  <div className="form-group mb-3">
                    <label>Enter OTP</label>
                    <input type="text" className="form-control" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  </div>
                  <div className="form-group mb-3">
                    <label>New Password</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setNewPassword(e.target.value)} required minLength="7" />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Verify OTP & Reset Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forget;
