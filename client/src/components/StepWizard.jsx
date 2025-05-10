import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useGeolocated } from "react-geolocated";
import { setData } from "../utils/sessionStoreage";
import "./wizard.css";
import { useSearchParams } from "react-router-dom";
import Swal from 'sweetalert2'

const StepWizard = () => {
    const [searchParams] = useSearchParams();
    const referralCode = searchParams.get("ref");
    const [memberShip, setMemberShip] = useState(null);
    const [memberData, setMemberData] = useState({
        name: "",
        email: "",
        type: "",
        mobileNumber: "",
        location: "",
        password: "",
        couponCode: "",
        agree: false,
    });
    const [discountedPrice, setDiscountedPrice] = useState(null);
    const [couponDetail, setCouponDetail] = useState(null);
    const [couponMessage, setCouponMessage] = useState("");

    const [isPasswordShow, setIsPasswordShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const { coords } = useGeolocated({ positionOptions: { enableHighAccuracy: false }, userDecisionTimeout: 5000 });

    useEffect(() => {
        if (coords) fetchCurrentLocation();
    }, [coords]);

    const handleFetchmembership = async () => {
        try {
            const { data } = await axios.get("https://api.helpubuild.in/api/v1/get_all_membership");
            setMemberShip(data.data[0].planPrice);
        } catch (error) {
            console.log("Internal server error", error)
        }
    }
    useEffect(() => {
        handleFetchmembership();
    }, [])

    const fetchCurrentLocation = async () => {
        try {
            const res = await axios.post("https://api.helpubuild.in/Fetch-Current-Location", {
                lat: coords.latitude,
                lng: coords.longitude,
            });
            setMemberData((prev) => ({ ...prev, location: res.data.data.address.completeAddress }));
        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };

    useEffect(() => {
        if (referralCode) {
            setMemberData((prev) => ({ ...prev, couponCode: referralCode }));
        }
    }, [referralCode]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setMemberData((prev) => ({ ...prev, [name]: value }));
    };

    const validatePhone = () => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(memberData.mobileNumber)) {
            Swal.fire({
                title: 'Error!',
                text: "Mobile number must be exactly 10 digits.",
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
            return false;
        }
        return true;
    };

    const validatePassword = () => {
        if (memberData.password.length < 7) {
            Swal.fire({
                title: 'Error!',
                text: "Password must be at least 7 characters long.",
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
            return false;
        }
        return true;
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (providerId) => {
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error("Failed to load Razorpay SDK. Please check your connection.");
                return;
            }
            const res = await axios.post(`https://api.helpubuild.in/api/v1/buy_membership/${providerId}`, {
                couponCode: memberData.couponCode,
            });
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
                    // callback_url: "https://api.helpubuild.in/api/v1/membership_payment_verify",
                    handler: async function (response) {
                        // This runs on successful payment
                        try {
                            const { data } = await axios.post("https://api.helpubuild.in/api/v1/membership_payment_verify", {
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
                            window.location.href = '/profile'
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePhone() || !validatePassword()) return;
        setLoading(true);

        if (memberData.agree === false) {
            setLoading(false)
            Swal.fire({
                title: 'Error!',
                text: "Please accept terms and conditions",
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        }

        try {
            const res = await axios.post("https://api.helpubuild.in/api/v1/register-provider", memberData);
            // const message = res.data.message;
            // console.log("message",message)
            // toast.success(res.data.message);
            // setData("token", res.data.token);
            // setData("islogin", !!res.data.token);
            // setData("user", res.data.user);
            // Proceed to payment after registration
            await handlePayment(res.data.user._id);
        } catch (error) {
            console.log("Internal server error", error)
            const message = error?.response?.data?.message;
            if (message == 'Email already exists, but payment is pending' || message == 'Mobile Number already exists, but payment is pending') {
                console.log("i am in")
                await handlePayment(error?.response?.data?.data);
                return;
            }
            Swal.fire({
                title: 'Error!',
                text: error?.response?.data?.message || "Please try again later in register",
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckCouponCode = async (code = null) => {
        const couponToCheck = code || memberData.couponCode;

        if (!couponToCheck) {
            toast.error("Please enter a coupon code.");
            return;
        }



        try {
            const res = await axios.post("https://api.helpubuild.in/api/v1/check_coupon_code", {
                couponCode: couponToCheck,
            });

            if (res.data.success) {
                setCouponMessage(res.data.message);
                setCouponDetail(res.data.data);

                // Calculate discounted price
                let discountPercent = 0;

                if (res.data.message.includes("Refer by admin")) {
                    discountPercent = res.data.data.discount;
                } else if (res.data.message.includes("Refer by provider")) {
                    discountPercent = res.data.data?.discount?.discountPercent || 0;
                }

                const discounted = memberShip - (memberShip * (discountPercent / 100));
                setDiscountedPrice(discounted);

                Swal.fire({
                    title: 'Coupon Applied!',
                    text: `${res.data.message}. You saved ₹${(memberShip * (discountPercent / 100)).toFixed(2)}!`,
                    icon: 'success',
                    confirmButtonText: 'Great!'
                });
            } else {
                setCouponDetail(null);
                setCouponMessage("");
                setDiscountedPrice(memberShip);

                Swal.fire({
                    title: 'Invalid Coupon',
                    text: "The coupon code you entered is invalid or expired.",
                    icon: 'error',
                    confirmButtonText: 'Try Another'
                });
            }
        } catch (error) {
            console.error("Error checking coupon:", error);

            Swal.fire({
                title: 'Coupon Error',
                text: error?.response?.data?.message || "Failed to verify coupon. Please try again.",
                icon: 'error',
                confirmButtonText: 'Okay'
            });

            setCouponDetail(null);
            setCouponMessage("");
            setDiscountedPrice(memberShip);
        }
    };


    return (
        <div className="container mt-5 mb-5">
            <form onSubmit={handleSubmit}>
                <h1 className="text-center mb-5">Partner Registration</h1>
                <div className="row">
                    {["name", "email", "mobileNumber", "location"].map((field, index) => (
                        <div key={index} className="col-lg-6 mb-3">
                            <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                            <input type="text" name={field} value={memberData[field]} onChange={handleChange} className="form-control" />
                        </div>
                    ))}

                    <div className="col-lg-6 mb-3">
                        <label className="form-label">Partner Type</label>
                        <select name="type" onChange={handleChange} value={memberData.type} className="form-control">
                            <option value="">Select Your Type</option>
                            <option value="Architect">Architect</option>
                            <option value="Interior">Interior Designer</option>
                            <option value="Vastu">Vastu Expert</option>
                        </select>
                    </div>

                    <div className="col-lg-6 mb-3">
                        <label className="form-label">Password</label>
                        <div className="input-group">
                            <input type={isPasswordShow ? "text" : "password"} name="password" value={memberData.password} onChange={handleChange} className="form-control" />
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setIsPasswordShow(!isPasswordShow)}>
                                <i className="far fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div className="step-content">
                        <h4 className="mb-4 text-primary">Membership Details</h4>

                        <div className="card mb-4 shadow-sm border-0 bg-light">
                            <div className="card-body text-center p-4">
                                <div className="mb-3">
                                    <span className="badge bg-primary p-2 fs-6">Premium Membership</span>
                                </div>

                                <h3 className="card-title fw-bold mb-3">
                                    {memberShip !== null ? (
                                        <>
                                            {couponDetail ? (
                                                <div className="d-flex justify-content-center align-items-center">
                                                    <span className="text-decoration-line-through text-muted me-2">₹{memberShip}</span>
                                                    <span className="text-success">₹{discountedPrice}</span>
                                                </div>
                                            ) : (
                                                <span className="text-success">₹{memberShip}</span>
                                            )}
                                        </>
                                    ) : (
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    )}
                                </h3>

                                <div className="mb-4">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item bg-transparent">
                                            <i className="fas fa-check-circle text-success me-2"></i>
                                            Get exclusive access to premium features.
                                        </li>

                                    </ul>
                                </div>

                                {couponDetail && (
                                    <div className="alert alert-success d-flex align-items-center mb-3">
                                        <i className="fas fa-tag me-2"></i>
                                        <div>
                                            <strong>Coupon Applied:</strong> {couponMessage}
                                            {couponMessage.includes("Refer by admin") && (
                                                <span className="d-block mt-1">
                                                    You save {couponDetail.discount}% (₹{(memberShip * (couponDetail.discount / 100)).toFixed(2)})
                                                </span>
                                            )}
                                            {couponMessage.includes("Refer by provider") && (
                                                <span className="d-block mt-1">
                                                    You save {couponDetail?.discount?.discountPercent}% (₹{(memberShip * (couponDetail?.discount?.discountPercent / 100)).toFixed(2)})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Have a Coupon Code?</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="couponCode"
                                    value={memberData.couponCode}
                                    onChange={handleChange}
                                    className="form-control form-control-lg"
                                    placeholder="Enter coupon code if available"
                                />
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handleCheckCouponCode()}

                                >
                                    Apply

                                </button>
                            </div>
                        </div>

                      


                    </div>
                    <div className="col-lg-12">
                        <div style={{ display: 'flex' }} className="form-check justify-content-start mb-4">
                            <input
                                className="form-check-input me-2"
                                type="checkbox"
                                id="termsCheck"
                                checked={memberData.agree}
                                onChange={(e) =>
                                    setMemberData({ ...memberData, agree: e.target.checked })
                                }
                                required
                            />
                            <label className="form-check-label text-black" htmlFor="termsCheck">
                                I agree to the
                                <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-warning ms-1">
                                    Terms & Conditions
                                </a>
                            </label>
                        </div>
                    </div>
                </div>
                <button type="submit" className="btn btn-success">{loading ? "Loading..." : "Register"}</button>
            </form>
        </div>
    );
};

export default StepWizard;
