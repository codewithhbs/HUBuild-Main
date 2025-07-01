import React, { useState } from 'react'
import loginimage from './login-img.webp'
import axios from 'axios';
import toast from 'react-hot-toast';
import { setData } from '../../utils/sessionStoreage';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
// axios.defaults.withCredentials = true;

const PartnerLogin = () => {
    const [logindata, setLoginData] = useState({
        any: '',
        password: '',
        loginFrom: 'provider'
    });

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleChange = (e) => {
        const { name, value } = e.target

        setLoginData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleloginSubmit = async (e) => {

        e.preventDefault()
        try {
            const { data } = await axios.post('https://testapi.helpubuild.in/api/v1/login', logindata, {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*`',
                    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
                }
            });
            console.log(data)
            const { token, user, message } = data
            // console.log("user?.isMember", user?.isMember)
            if (user?.isMember === false) {
                const handlePayment = async (providerId) => {
                    try {
                        const scriptLoaded = await loadRazorpayScript();
                        if (!scriptLoaded) {
                            toast.error("Failed to load Razorpay SDK. Please check your connection.");
                            return;
                        }
                        const res = await axios.post(`https://testapi.helpubuild.in/api/v1/buy_membership/${providerId}`);
                        const order = res.data.data.razorpayOrder;
                        const amount = res.data.data.discountAmount;
                        const providerData = res.data.data.provider;
                        if (order) {
                            const options = {
                                key: "rzp_live_bmq7YMRTuGvvfu",
                                amount: amount * 100,
                                currency: "INR",
                                name: "Help U Build",
                                description: "Buying Membership",
                                order_id: order.id,
                                // callback_url: "https://testapi.helpubuild.in/api/v1/membership_payment_verify",
                                handler: async function (response) {
                                    // This runs on successful payment
                                    try {
                                        const { data } = await axios.post("https://testapi.helpubuild.in/api/v1/membership_payment_verify", {
                                            razorpay_payment_id: response.razorpay_payment_id,
                                            razorpay_order_id: response.razorpay_order_id,
                                            razorpay_signature: response.razorpay_signature,
                                            providerId: providerId
                                        });

                                        const { token, user, message } = data
                                        setData('token', token)
                                        setData('islogin', token ? true : false)
                                        setData('user', user)
                                        toast.success("Membership purchase successful!");
                                        // navigate("/"); // or wherever you want
                                        window.location.href = '/'
                                    } catch (err) {
                                        console.error("Verification failed:", err);
                                        toast.error("Payment verification failed.");
                                    }
                                },
                                prefill: {
                                    name: providerData.name,
                                    email: providerData.email,
                                    contact: providerData.mobileNumber,
                                },
                                theme: {
                                    color: "#F37254",
                                },
                            };

                            const rzp = new window.Razorpay(options);
                            rzp.open();

                        }
                    } catch (error) {
                        console.error("Payment error:", error);
                        toast.error("Payment failed. Please try again.");
                    }
                };
                handlePayment(user._id)
            } else {
                setData('token', token)
                setData('islogin', token ? true : false)
                setData('user', user)
                toast.success(message);
                window.location.href = '/profile?role=provider'
            }


        } catch (error) {
            console.log(error)
            console.log('An err or occurred. Please try again.')
            // toast.error(error?.response?.data?.message)
            Swal.fire({
                title: 'Error!',
                text: error?.response?.data?.message || 'An err or occurred. Please try again.',
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        }
    };


    return (
        <>
            <section className="bg-light">
                <div className="container py-5 h-100">
                    <div className="row d-flex justify-content-center align-items-center">
                        <div className="col col-xl-10">
                            <div className="card login-bg" style={{ borderRadius: "1rem" }}>
                                <div className="row g-0">
                                    <div className="col-md-6 col-lg-6 d-none d-md-block">
                                        <img
                                            src={loginimage}
                                            alt="login form"
                                            className="img-fluid"
                                            style={{ borderRadius: "1rem 0 0 1rem" }}
                                        />
                                    </div>
                                    <div className="col-md-6 col-lg-6 d-flex align-items-center">
                                        <div className="card-body p-4 p-lg-5 text-black">
                                            <form>
                                                <div className="d-flex align-items-center mb-3 pb-1">
                                                    <span className="h1 fw-bold mb-0 text-white">Login</span>
                                                </div>
                                                <h5
                                                    className="fw-normal mb-3 pb-3 text-white"
                                                    style={{ letterSpacing: 1 }}
                                                >
                                                    Sign into your account
                                                </h5>
                                                <div data-mdb-input-init="" className="form-outline mb-4">
                                                    <label className="form-label text-white" htmlFor="form2Example17">
                                                        Email or Phone
                                                    </label>
                                                    <input
                                                        onChange={handleChange}
                                                        name="any"
                                                        type="text"
                                                        value={logindata.any}
                                                        id="form2Example17"
                                                        className="form-control form-control-lg input-shape"
                                                    />
                                                </div>

                                                <div data-mdb-input-init="" className="form-outline mb-4 position-relative">
                                                    <label className="form-label text-white" htmlFor="form2Example27">
                                                        Password
                                                    </label>
                                                    <input
                                                        onChange={handleChange}
                                                        name="password"
                                                        type={showPassword ? "text" : "password"}
                                                        value={logindata.password}
                                                        id="form2Example27"
                                                        className="form-control form-control-lg input-shape"
                                                    />
                                                    <i
                                                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                                                        onClick={togglePasswordVisibility}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '70%',
                                                            right: '15px',
                                                            transform: 'translateY(-50%)',
                                                            cursor: 'pointer',
                                                            color: '#999'
                                                        }}
                                                    ></i>
                                                </div>
                                                <div className="pt-1 mb-4">
                                                    <button
                                                        onClick={handleloginSubmit}
                                                        data-mdb-button-init=""
                                                        data-mdb-ripple-init=""
                                                        className="btn text-white"
                                                        style={{ backgroundColor: '#F0AF36' }}
                                                        type="button"
                                                    >
                                                        Login Now
                                                    </button>
                                                </div>
                                                <div className='' style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px' }}>
                                                    <a className="small text-white" href="/forget-password">Forgot password?
                                                    </a>
                                                    <Link to={'/member-registration'} style={{ backgroundColor: '#F0AF36' }} className='btn text-white'>Become a Partner</Link>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}

export default PartnerLogin
