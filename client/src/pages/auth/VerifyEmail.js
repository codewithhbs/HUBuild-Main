import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { setData } from '../../utils/sessionStoreage';
import Swal from 'sweetalert2';

const VerifyEmail = () => {
    const [query] = useSearchParams();
    const email = query.get("email");
    const ExpiresTime = query.get("expires");

    const [otp, setOtp] = useState(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        const currentTime = new Date().getTime();
        const expiresAt = new Date(ExpiresTime).getTime();
        const differenceOfTime = expiresAt - currentTime;

        // Calculate remaining time in seconds
        const initialTimer = Math.floor(differenceOfTime / 1000);
        setTimer(initialTimer);

        if (initialTimer <= 0) {
            setCanResend(true); // Enable "Resend OTP" if expired
            return;
        }

        // Timer countdown effect
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval); // Stop timer when it reaches 0
                    setCanResend(true); // Enable the resend button
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [ExpiresTime]);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus(); // Move to the next input field
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus(); // Move to the previous input field
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValidOtp = otp.every((digit) => digit !== '' && !isNaN(digit));
        if (!isValidOtp) {
            // toast.error('Please enter all 6 digits of the OTP');
            Swal.fire({
                title: 'Error!',
                text: 'Please enter all 6 digits of the OTP',
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
            return;
        }

        const otpString = otp.join('');

        setLoading(true);

        try {
            const response = await axios.post(`https://api.dessobuild.com/api/v1/verify/email`, {
                email,
                otp: otpString,
            });
            // toast.success(response.data.message);

            const { token, user } = response.data
            setData('token', token)
            setData('islogin', token ? true : false)
            setData('user', user)
            window.location.href = '/'
        } catch (error) {
            // toast.error(
            //     error?.response?.data?.message ||
            //     'Failed to verify OTP. Please try again.'
            // );
            Swal.fire({
                title: 'Error!',
                text: error?.response?.data?.message || 'Failed to verify OTP. Please try again.',
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (canResend) {
            setLoading(true);
            setOtp(Array(6).fill(''));
            setTimer(0); // Reset timer on resend

            try {
                const response = await axios.post(`https://api.dessobuild.com/api/v1/resend-otp/email`, {
                    email,
                });
                // alert(response.data.message);
                // toast.success(response.data.message);
                Swal.fire({
                    title: 'Success!',
                    text: response.data.message,
                    icon: 'success', // use lowercase
                    confirmButtonText: 'Cool'
                });
                setCanResend(false); // Disable the button after resending
                setTimer(180); // Reset the timer for 3 minutes
            } catch (error) {
                console.log("Internal server error", error)
                // toast.error(
                //     error?.response?.data?.message ||
                //     'Failed to resend OTP. Please try again later.'
                // );
                Swal.fire({
                    title: 'Error!',
                    text: error?.response?.data?.message || "Failed to resend OTP. Please try again later.",
                    icon: 'error', // use lowercase
                    confirmButtonText: 'Cool'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center pt-5 pb-5">
            <div className="card p-5 text-center shadow-lg rounded-4" style={{ maxWidth: '420px', width: '100%' }}>
                <h4 className="mb-3 text-dark fw-bold">Phone Number Verification</h4>
                <p className="text-muted">
                    Enter the one-time password (OTP) sent to your whatsapp on <strong>{email}</strong> to verify your number.
                </p>

                <div id="otp" style={{ display: 'flex' }} className=" justify-content-center mb-4">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            className="otp-input mx-1 text-center"
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}
                        />
                    ))}
                </div>

                <button
                    className="btn btn-primary btn-lg w-100 mb-3"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <p className="text-muted">
                    {canResend ? (
                        <button className="btn btn-link" onClick={handleResend}>Resend OTP</button>
                    ) : (
                        <span>Resend OTP in {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}</span>
                    )}
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
