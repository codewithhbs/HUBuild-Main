// StarRating.js
import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        // <div className="star-rating me-4">
        <div className="star-rating">
            {/* Render full stars */}
            {[...Array(fullStars)].map((_, index) => (
                <FaStar key={index} style={{fontSize:'15px'}} color="gold" />
            ))}
            {/* Render half star if applicable */}
            {halfStar && <FaStarHalfAlt style={{fontSize:'15px'}} color="gold" />}
            {/* Render empty stars */}
            {[...Array(emptyStars)].map((_, index) => (
                <FaRegStar key={index} style={{fontSize:'15px'}} color="gold" />
            ))}
        </div>
    );
};

export default StarRating;
