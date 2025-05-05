import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function ForgotPassword() {
  // State variables
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setNewPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));

    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    const confirmPwd = e.target.value;
    setConfirmPassword(confirmPwd);

    if (confirmPwd && password !== confirmPwd) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  // Resend timer logic
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
    }

    return () => clearInterval(interval);
  }, [resendTimer]);

  // First form submission - request OTP
  const handleSubmitFirst = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://api.helpubuild.co.in/api/v1/forgot-password', {
        mobileNumber,
      });

      if (response.data.success) {
        Swal.fire({
          title: 'OTP Sent!',
          text: 'An OTP has been sent to your WhatsApp',
          icon: 'success',
          confirmButtonText: 'Continue',
          confirmButtonColor: '#28a745',
        });
        setIsOtpSent(true);
        setResendDisabled(true);
        setResendTimer(60); // 60 seconds countdown
      } else {
        Swal.fire({
          title: 'Error',
          text: response.data.message || 'Failed to send OTP',
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#dc3545',
        });
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        title: 'Server Error',
        text: err?.response?.data?.message || 'Unable to connect to server. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc3545',
      });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const handleResendOtp = async () => {
    if (resendDisabled) return;

    setLoading(true);
    try {
      const response = await axios.post('https://api.helpubuild.co.in/api/v1/forgot-password', {
        mobileNumber,
      });

      if (response.data.success) {
        Swal.fire({
          title: 'OTP Resent!',
          text: 'A new OTP has been sent to your WhatsApp',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true,
        });
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
        setOtp('')
        setResendDisabled(true);
        setResendTimer(60); // 60 seconds countdown
      } else {
        Swal.fire({
          title: 'Failed to Resend',
          text: response.data.message || 'Something went wrong',
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#dc3545',
        });
      }
    } catch (err) {
      console.error("Error resending OTP:", err);
      Swal.fire({
        title: 'Server Error',
        text: err?.response?.data?.message || 'Connection failed. Please check your internet.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc3545',
      });
    } finally {
      setLoading(false);
    }
  };

  // Second form submission - verify OTP and reset password
  const handleSubmitOtp = async (event) => {
    event.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://api.helpubuild.co.in/api/v1/Changepassword', {
        mobileNumber,
        otp,
        password,
      });

      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Your password has been reset successfully.',
          icon: 'success',
          confirmButtonText: 'Login Now',
          confirmButtonColor: '#28a745',
          backdrop: `rgba(0,0,0,0.4)`,
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/login';
          }
        });
      } else {
        Swal.fire({
          title: 'Verification Failed',
          text: response.data.message || 'Invalid OTP, please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc3545',
        });
      }
    } catch (err) {
      console.error("OTP Error:", err?.response?.data);
      Swal.fire({
        title: 'Error',
        text: err?.response?.data?.message || 'Verification failed, please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc3545',
      });
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    const getStrengthLabel = () => {
      switch (passwordStrength) {
        case 0: return 'Very Weak';
        case 1: return 'Weak';
        case 2: return 'Medium';
        case 3: return 'Strong';
        case 4: return 'Very Strong';
        default: return '';
      }
    };

    const getStrengthColor = () => {
      switch (passwordStrength) {
        case 0: return 'danger';
        case 1: return 'danger';
        case 2: return 'warning';
        case 3: return 'info';
        case 4: return 'success';
        default: return 'secondary';
      }
    };

    return password ? (
      <div className="mt-1">
        <small className={`text-${getStrengthColor()}`}>
          Password strength: {getStrengthLabel()}
        </small>
        <div className="progress" style={{ height: '5px' }}>
          <div
            className={`progress-bar bg-${getStrengthColor()}`}
            role="progressbar"
            style={{ width: `${(passwordStrength / 4) * 100}%` }}
            aria-valuenow={passwordStrength}
            aria-valuemin="0"
            aria-valuemax="4"
          ></div>
        </div>
      </div>
    ) : null;
  };

  return (
    <div className="container-fluid h-full mt-5 mb-5 d-flex align-items-center justify-content-center bg-light">
      <div className="row justify-content-center w-100">
        <div className="col-md-10 col-lg-6 col-xl-5">
          <div className="card shadow border-0 rounded-lg">
            <div className="card-header bg-primary text-white text-center py-4">
              <h3 className="mb-0 fw-bold">Reset Your Password</h3>
              <p className="text-white-50 mb-0">We'll help you get back into your account</p>
            </div>

            <div className="card-body p-4 p-lg-5">
              {!isOtpSent ? (
                <>
                  <div className="text-center mb-4">
                    <i className="fas fa-lock fa-3x text-primary mb-3"></i>
                    <p className="text-muted">Enter your registered mobile number to receive an OTP on WhatsApp</p>
                  </div>

                  <form onSubmit={handleSubmitFirst}>
                    <div className="form-floating mb-4">
                      <input
                        type="text"
                        className="form-control"
                        id="mobileNumber"
                        placeholder="Enter your mobile number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        minLength="10"
                        maxLength="10"
                        pattern="\d{10}"
                      />
                      <label htmlFor="mobileNumber">Mobile Number</label>
                    </div>

                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading || mobileNumber.length !== 10}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Sending OTP...
                          </>
                        ) : 'Send OTP'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <i className="fas fa-user-shield fa-3x text-primary mb-3"></i>
                    <p className="text-muted">Enter the OTP sent to your WhatsApp on {mobileNumber}</p>
                  </div>

                  <form onSubmit={handleSubmitOtp}>
                    <div className="mb-4">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="otp"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                        />
                        <label htmlFor="otp">OTP Code</label>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <small className="text-muted">Didn't receive OTP?</small>
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-decoration-none"
                          onClick={handleResendOtp}
                          disabled={resendDisabled}
                        >
                          {resendDisabled
                            ? `Resend in ${resendTimer}s`
                            : 'Resend OTP'}
                        </button>
                      </div>
                    </div>

                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        placeholder="Create new password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        minLength="8"
                      />
                      <label htmlFor="newPassword">New Password</label>
                      <PasswordStrengthIndicator />
                    </div>

                    <div className="form-floating mb-4">
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                      />
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      {passwordError && (
                        <small className="text-danger">{passwordError}</small>
                      )}
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading || passwordError || !otp || !password || !confirmPassword}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Resetting Password...
                          </>
                        ) : 'Reset Password'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setIsOtpSent(false)}
                      >
                        Change Mobile Number
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>

            <div className="card-footer text-center py-3 bg-light">
              <div className="small">
                <a href="/login" className="text-decoration-none">
                  Remember your password? Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;