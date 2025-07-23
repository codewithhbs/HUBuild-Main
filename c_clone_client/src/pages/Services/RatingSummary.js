import React from 'react';
// import { StarRating } from './StarRating';
import './RatingSummary.css';
import StarRating from '../../components/StarRating/StarRating';

const RatingSummary = ({ profile, reviews, ratingPercentages }) => {
    return (
        <div className="rating-summary-card">
            <div className="rating-header">
                <h5>Rating & Reviews</h5>
                <div className="rating-overview">
                    <div className="rating-score">
                        <span className="score-value">{profile.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="score-max">/5</span>
                    </div>
                    <div className="rating-stars">
                    <StarRating rating={profile.averageRating || 0} />
                        <span className="total-reviews">
                            <i className="bi bi-person"></i> {reviews.length} reviews
                        </span>
                    </div>
                </div>
            </div>

            <div className="rating-bars">
                {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="rating-bar-row">
                        <span className="rating-label">{rating}</span>
                        <div className="rating-progress">
                            <div className="progress-track">
                                <div 
                                    className="progress-fill"
                                    style={{ 
                                        width: `${ratingPercentages[rating]}%`,
                                        backgroundColor: `var(--rating-color-${rating})`
                                    }}
                                />
                            </div>
                            <span className="percentage-label">
                                {Math.round(ratingPercentages[rating])}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingSummary;