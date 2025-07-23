import React from 'react'
import './ArchitectureCard.css'
import { Phone, MessageCircle, Video, CheckCircle, Clock, Globe, Award, Tag, IndianRupee } from 'lucide-react';

import StarRating from '../../components/StarRating/StarRating'
const ArchitectureCard = ({ data, onActionClick,
    calculateSquareYardsPrice }) => {

    const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`;

    return (
        <div className="architecture-card">
            <div className="card-content">
                <div className="card-layout">
                    <div className="image-section">
                        <img
                            src={data?.photo?.imageUrl || defaultImage}
                            alt={data?.name}
                            className="profile-image"
                            onError={(e) => {
                                e.currentTarget.src = defaultImage;
                            }}
                        />
                        <div className="rating-container">
                            <StarRating rating={data.averageRating || 0} />
                        </div>
                    </div>

                    <div className="info-section">
                        <div className="header-row">
                            <div className="name-container">
                                <h2>
                                    {data?.name || "Not Available"}
                                    <CheckCircle className="verified-icon" size={20} />
                                </h2>
                                <span className="type-text">
                                    {data.type || "Not Available"}
                                </span>
                            </div>
                            <div className="price-badge">
                                ₹{data?.pricePerMin}/min
                            </div>
                        </div>

                        <div className="details-section">
                            {data.yearOfExperience && (
                                <div className="detail-item">
                                    <Clock size={16} />
                                    <span>{data.yearOfExperience} years experience</span>
                                </div>
                            )}

                            {data.language && data.language.length > 0 && (
                                <div className="detail-item">
                                    <Globe size={16} />
                                    <div className="tag-container">
                                        {data.language.map((lang, index) => (
                                            <span key={index} className="tag">{lang}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data.expertiseSpecialization && data.expertiseSpecialization.length > 0 && (
                                <div className="detail-item">
                                    <Award size={16} />
                                    <div className="tag-container">
                                        {data.expertiseSpecialization.map((spec, index) => (
                                            <span key={index} className="tag">{spec}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="square-yards-price">
                                <IndianRupee size={16} />
                                {` ${calculateSquareYardsPrice(data._id) * 900} for 100 Sq.Yrds (${calculateSquareYardsPrice(data._id)} * 900)`}
                            </div>
                        </div>

                        <div className="actions-container">
                            <button
                                className="action-button call-button"
                                disabled={!data.callStatus}
                                onClick={() => onActionClick('call', data)}
                            >
                                <Phone size={20} />
                                <span>Call</span>
                            </button>

                            <button
                                className="action-button chat-button"
                                disabled={!data.chatStatus}
                                onClick={() => onActionClick('chat', data)}
                            >
                                <MessageCircle size={20} />
                                <span>Chat</span>
                            </button>

                            {data.meetStatus !== undefined && (
                                <button
                                    className="action-button video-button"
                                    disabled={!data.meetStatus}
                                    onClick={() => onActionClick('video', data)}
                                >
                                    <Video size={20} />
                                    <span>Video Call</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ArchitectureCard