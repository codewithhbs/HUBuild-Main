import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ClientReview = () => {
    const location = useLocation();
    const [userId, setUserId] = useState(null);
    const [providerId, setProviderId] = useState(null);
    const [providerDetails, setProviderDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    // Extract query params from URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        setUserId(searchParams.get("userId"));
        setProviderId(searchParams.get("providerId"));
    }, [location]);

    // Handle review submission
    const handleSendReview = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`https://api.dessobuild.com/api/v1/send-feedback-to-admin`, {
                UserId: userId,
                providerId: providerId,
            });

            if (response.data.success) {
                toast.success("Thank you! Your feedback has been submitted.");
                setTimeout(() => {
                    window.location.href = "/";
                }, 1500);
            } else {
                toast.error(response.data.message || "Failed to send feedback");
            }
        } catch (error) {
            toast.error("Failed to send feedback");
            console.error("Error sending feedback:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchProviderDetails = async () => {
        try {
            const { data } = await axios.get(`https://api.dessobuild.com/api/v1/get-single-provider/${providerId}`);
            console.log("Provider details:", data.data);
            setProviderDetails(data.data);
        } catch (error) {
            console.log("Internal server error:", error);
        }
    }

    useEffect(() => {
        if (providerId) {
            handleFetchProviderDetails();
        }
    }, [providerId]);

    return (
        <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8 col-sm-10">
                        <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                            {/* Header */}
                            <div className="card-header bg-white border-0 pt-4 pb-0">
                                <div className="text-center">
                                    <div className="mb-3">
                                        <i className="fas fa-star text-warning" style={{ fontSize: '2.5rem' }}></i>
                                    </div>
                                    <h3 className="fw-bold text-dark mb-2">Service Feedback</h3>
                                    <p className="text-muted mb-0">Your opinion matters to us</p>
                                </div>
                            </div>

                            <div className="card-body px-4 py-4">
                                {/* Provider Details Section */}
                                {providerDetails ? (
                                    <div className="mb-4">
                                        <div className="row g-0 bg-light rounded-3 p-3 mb-4">
                                            <div className="col-auto">
                                                <div className="position-relative">
                                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                                                         style={{ width: '70px', height: '70px', fontSize: '28px', fontWeight: 'bold' }}>
                                                        {providerDetails.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" 
                                                          style={{ width: '20px', height: '20px' }}></span>
                                                </div>
                                            </div>
                                            <div className="col ms-3">
                                                <h5 className="text-primary mb-1 fw-bold">{providerDetails.name}</h5>
                                                <p className="text-dark mb-1">
                                                    <i className="fas fa-briefcase text-primary me-2"></i>
                                                    <strong>{providerDetails.type}</strong>
                                                </p>
                                                <p className="text-muted small mb-1">
                                                    <i className="fas fa-clock text-warning me-2"></i>
                                                    {providerDetails.yearOfExperience} years experience
                                                </p>
                                                <p className="text-muted small mb-0">
                                                    <i className="fas fa-id-card text-info me-2"></i>
                                                    ID: {providerDetails.unique_id}
                                                </p>
                                            </div>
                                        </div>



                                        <hr className="my-4" />
                                    </div>
                                ) : (
                                    <div className="text-center mb-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="text-muted mt-2">Loading consultant details...</p>
                                    </div>
                                )}

                                {/* Feedback Section */}
                                <div className="text-center">
                                    <h4 className="text-dark mb-3 fw-bold">Are you satisfied with this consultant?</h4>
                                    <p className="text-muted mb-4">
                                        Your feedback helps us improve our services and helps other clients make better decisions.
                                    </p>

                                    <div className="d-grid gap-3 d-md-flex justify-content-md-center">
                                        <button
                                            onClick={handleSendReview}
                                            disabled={loading}
                                            className="btn btn-success btn-lg px-5 py-3 rounded-pill shadow-sm"
                                            style={{ minWidth: '140px' }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-thumbs-up me-2"></i>
                                                    Yes, Satisfied
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                toast.error("Thank you for your feedback. We'll work to improve our services.");
                                                setTimeout(() => {
                                                    window.location.href = "/";
                                                }, 2000);
                                            }}
                                            disabled={loading}
                                            className="btn btn-outline-secondary btn-lg px-5 py-3 rounded-pill"
                                            style={{ minWidth: '140px' }}
                                        >
                                            <i className="fas fa-thumbs-down me-2"></i>
                                            Not Satisfied
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="card-footer bg-light border-0 text-center py-3">
                                <small className="text-muted">
                                    <i className="fas fa-shield-alt me-1"></i>
                                    Your feedback is confidential and helps us serve you better
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientReview;