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
    });
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
            const { data } = await axios.get("https://api.helpubuild.co.in/api/v1/get_all_membership");
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
            const res = await axios.post("https://api.helpubuild.co.in/Fetch-Current-Location", {
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
            const res = await axios.post(`https://api.helpubuild.co.in/api/v1/buy_membership/${providerId}`, {
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
                    callback_url: "https://api.helpubuild.co.in/api/v1/membership_payment_verify",
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

        try {
            const res = await axios.post("https://api.helpubuild.co.in/api/v1/register-provider", memberData);
            toast.success(res.data.message);
            setData("token", res.data.token);
            setData("islogin", !!res.data.token);
            setData("user", res.data.user);
            // Proceed to payment after registration
            await handlePayment(res.data.user._id);
        } catch (error) {
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

    const handleCheckCouponCode = async () => {
        if (!memberData.couponCode) {
            toast.error("Please enter a coupon code.");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post("https://api.helpubuild.co.in/api/v1/check_coupon_code", {
                couponCode: memberData.couponCode,
            });
            if (res.data.success) {
                setCouponMessage(res.data.message);
                setCouponDetail(res.data.data);
                toast.success(res.data.message);
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: "Invalid coupon code.",
                    icon: 'error', // use lowercase
                    confirmButtonText: 'Okay'
                });
            }
        } catch (error) {
            console.error("Error checking coupon:", error);
            Swal.fire({
                title: 'Error!',
                text: error?.response?.data?.message || "Please try again later",
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        } finally {
            setLoading(false);
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

                    <div className="col-lg-6 mb-3">
                        <label className="form-label">Coupon Code</label>
                        <div className="input-group">
                            <input type="text" name="couponCode" value={memberData.couponCode} onChange={handleChange} className="form-control" />
                            <button type="button" className="btn btn-outline-primary" onClick={handleCheckCouponCode}>Apply</button>
                        </div>
                    </div>

                    {/* Display Coupon Details Based on Message */}
                    {couponDetail && (
                        <div className="col-lg-12">
                            <div className="alert alert-success mt-3">
                                <h5>Coupon Details</h5>
                                {couponMessage.includes("Refer by admin") && (
                                    <>
                                        <p>
                                            <strong>Coupon Code:</strong> {couponDetail.couponCode}
                                        </p>
                                        <p>
                                            <strong>Discount:</strong> {couponDetail.discount}%
                                        </p>
                                    </>
                                )}

                                {couponMessage.includes("Refer by provider") && (
                                    <>
                                        <p>
                                            <strong>Coupon Code:</strong> {couponDetail.couponCode}
                                        </p>
                                        <p>
                                            <strong>Discount:</strong> {couponDetail?.discount?.discountPercent}%
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="card text-center mb-4 shadow-sm border-0">
                        <div className="card-body">
                            <h3 className="card-title text-primary fw-bold">Membership Plan</h3>
                            <p className="card-text fs-4">
                                <strong className="text-success">
                                    {memberShip !== null ? `₹${memberShip}` : "Loading..."}
                                </strong>
                            </p>
                            <p className="text-muted">Get exclusive access to premium features.</p>
                        </div>
                    </div>
                </div>
                <button type="submit" className="btn btn-success">{loading ? "Loading..." : "Register"}</button>
            </form>
        </div>
    );
};

export default StepWizard;
