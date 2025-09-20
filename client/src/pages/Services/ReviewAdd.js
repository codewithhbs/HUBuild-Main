import axios from 'axios';
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import './ReviewAdd.css';

const ReviewAdd = ({ user_id, provider_id }) => {
    const [formData, setFormData] = useState({
        provider_id: provider_id,
        rating: 0,
        review: '',
        user_id: user_id,
    });

    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRating = (ratingValue) => {
        setFormData({ ...formData, rating: ratingValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.review || formData.rating === 0) {
            toast.error("Please provide a rating and review.");
            return;
        }
        
        setLoading(true);
        try {
            await axios.post('https://testapi.dessobuild.com/api/v1/create-rating', formData);
            toast.success("Review added successfully!");
            setFormData({ provider_id, rating: 0, review: '', user_id });
            window.location.reload();
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error(error?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const getRatingLabel = () => {
        const rating = hoverRating || formData.rating;
        switch(rating) {
            case 1: return 'Poor';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Very Good';
            case 5: return 'Excellent';
            default: return 'Rate your experience';
        }
    };

    return (
        <div className="review-add-container">
            <div className="review-card">
                <div className="review-header">
                    <h2>Share Your Experience</h2>
                    <p className="text-muted">Your feedback helps us improve our service</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="rating-container">
                        <div className="stars-container">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    className={`star-icon ${
                                        (hoverRating || formData.rating) >= star 
                                            ? 'star-filled' 
                                            : 'star-empty'
                                    }`}
                                    onClick={() => handleRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                />
                            ))}
                        </div>
                        <div className="rating-label">{getRatingLabel()}</div>
                    </div>

                    <div className="form-group">
                        <textarea
                            className="form-control review-textarea"
                            name="review"
                            rows="4"
                            placeholder="Tell us about your experience..."
                            value={formData.review}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        className={`btn btn-submit ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Submitting...
                            </>
                        ) : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewAdd;