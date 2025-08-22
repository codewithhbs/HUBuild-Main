import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ClientReview = () => {
    const location = useLocation();
    const [userId, setUserId] = useState(null);
    const [providerId, setProviderId] = useState(null);

    // Extract query params from URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        setUserId(searchParams.get("userId"));
        setProviderId(searchParams.get("providerId"));
    }, [location]);

    // Handle review submission
    const handleSendReview = async () => {
        try {
            const response = await axios.post(`https://api.dessobuild.com/api/v1/send-feedback-to-admin`, {
                UserId: userId,
                providerId: providerId,
            });

            if (response.data.success) {
                toast.success("Thank you! Your feedback has been submitted.");
            } else {
                toast.error(response.data.message || "Failed to send feedback");
            }
        } catch (error) {
            toast.error("Failed to send feedback");
            console.error("Error sending feedback:", error);
        }
    };

    return (
        <div style={{backgroundColor:'#ededed'}} className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
                <div className="card-body text-center">
                    <h4 className="card-title mb-3">Are you satisfied with this consultant?</h4>
                    <p className="card-text text-muted mb-4">
                        Do you want to continue the service?
                    </p>

                    <div className="d-flex justify-content-center gap-3">
                        <button
                            onClick={handleSendReview}
                            className="btn btn-success px-4"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => toast("No feedback submitted")}
                            className="btn btn-secondary px-4"
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientReview;
