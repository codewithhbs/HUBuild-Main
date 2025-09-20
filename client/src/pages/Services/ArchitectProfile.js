import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { HiBadgeCheck } from "react-icons/hi";
import { useParams } from 'react-router-dom';
import StarRating from '../../components/StarRating/StarRating';
import { GetData } from '../../utils/sessionStoreage';
import ModelOfPriceAndTime from './ModelOfPriceAndTime';
import CallLoader from './CallLoader';
import ReviewAdd from './ReviewAdd';
import RatingSummary from './RatingSummary';
import Swal from 'sweetalert2';
import verifiedBadge from './verified1.jpg'

function ArchitectProfile() {
    const { id } = useParams()
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviews, setReviews] = useState([]);
    const Data = GetData('user')
    const UserData = JSON.parse(Data)
    const [open, setOpen] = useState(false)
    const [user, setUser] = useState(null)
    const [time, setTime] = useState('0')
    const [VenderType, setVenderType] = useState('');
    const [ratingCounts, setRatingCounts] = useState({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    });
    const [ratingPercentages, setRatingPercentages] = useState({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    });
    const [selectedCategory, setSelectedCategory] = useState('Residential');
    const [allService, setAllService] = useState({});
    const [profileLoading, setProfileLoading] = useState(true);
    const [callLoader, setCallLoader] = useState(false);
    const [activeTab, setActiveTab] = useState('gallery');

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, [])

    const handleFetchProvider = async (providerId) => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `https://testapi.dessobuild.com/api/v1/get-service-by-provider/${providerId}/${selectedCategory}`
            );

            const serviceData = data.data.find(
                (service) => service.category === selectedCategory
            );

            if (serviceData) {
                setAllService(serviceData);
            } else {
                setAllService({});
            }
        } catch (error) {
            console.error('Error fetching provider data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchUser = async (providerId) => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `https://testapi.dessobuild.com/api/v1/get-user-by-id/${UserData?._id}`
            );

            setUser(data.data)
        } catch (error) {
            console.error('Error fetching provider data', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProviderData = async function (id) {
        try {
            const response = await axios.post(`https://testapi.dessobuild.com/api/v1/provider_status/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching provider data:", error.message);
            return error?.response?.data || { success: false, message: "Unknown error occurred" };
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    useEffect(() => {
        if (id) {
            handleFetchProvider(id);
        }
    }, [id]);

    const [formData, setFormData] = useState({
        userId: '',
        providerId: id,
    })

    const handleActiveTime = async (Chat) => {
        if (!UserData) {
            return Swal.fire({
                title: 'Error!',
                text: 'Login first',
                icon: 'error',
                confirmButtonText: 'Okay'
            });
        }
        if (UserData.role === 'provider') {
            return Swal.fire({
                title: 'Error!',
                text: "Access Denied: Providers are not authorized to access this feature.",
                icon: 'error',
                confirmButtonText: 'Okay'
            });
        }
        if (!profile.pricePerMin || profile.pricePerMin <= 0) {
            return Swal.fire({
                title: 'Error!',
                text: "Chat cannot be started. Provider pricing information is unavailable or invalid.",
                icon: 'error',
                confirmButtonText: 'Okay'
            });
        }
        if (Chat === 'Chat') {

            const newForm = {
                ...formData,
                userId: UserData._id,
            }
            try {
                const res = await axios.post('https://testapi.dessobuild.com/api/v1/create-chat', newForm)
                window.location.href = '/chat'
            } catch (error) {
                console.log("Internal server error", error)
                const errorMessage = error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later";
                if (errorMessage.includes('Chat is already started. Check Your chat room.')) {
                    return window.location.href = '/chat'
                }
                Swal.fire({
                    title: 'Error!',
                    text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later",
                    icon: 'error',
                    confirmButtonText: 'Okay'
                });

            }
        }
    }

    useEffect(() => {
        if (id) {
            fetchProfile(id);
        }
    }, [id]);

    const fetchProfile = async (id) => {
        setProfileLoading(true)
        try {
            const { data } = await axios.get(`https://testapi.dessobuild.com/api/v1/get-single-provider/${id}`);
            setProfile(data.data);
            setVenderType(data.data.type)
            setProfileLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Unable to fetch profile. Please try again later.');
            setProfileLoading(false);
            toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later")
        } finally {
            setProfileLoading(false);
        }
    };

    const handleFetchReview = async () => {
        try {
            const { data } = await axios.get(
                `https://testapi.dessobuild.com/api/v1/get-review-by-providerId/${id}`
            );
            console.log("Reviews fetched:", data.data);
            setReviews(data.data);

            const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            data.data.forEach((review) => {
                counts[review.rating] = (counts[review.rating] || 0) + 1;
            });

            setRatingCounts(counts);

            const totalRatings = Object.values(counts).reduce((sum, count) => sum + count, 0);
            const percentages = {};
            Object.entries(counts).forEach(([rating, count]) => {
                percentages[rating] = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
            });

            setRatingPercentages(percentages);
        } catch (error) {
            console.log("Internal server error in fetching reviews", error);
        }
    };

    const callCulateMaxTimeForCall = async (walletAmount, pricePerMinute) => {
        try {
            const fixedAmount = Number(parseFloat(walletAmount).toFixed(2));
            const PricePerMin = Number(pricePerMinute);
            let maxTimeForCall = (fixedAmount / PricePerMin) * 60;
            if (PricePerMin === 0) {
                maxTimeForCall = 600
            }

            return maxTimeForCall;

        } catch (error) {
            console.error("Error calculating max time for call:", error);
            return 0;
        }
    };


    const showModelOfPrice = async () => {
        if (UserData && profile) {
            if (UserData.role === 'provider') {
                return Swal.fire({
                    title: 'Error!',
                    text: "Access Denied: Providers are not authorized to access this feature.",
                    icon: 'error',
                    confirmButtonText: 'Okay'
                });
            } else {
                await handleFetchUser()
                console.log("seconds", user)
                setTimeout(async () => {
                    const data = await callCulateMaxTimeForCall(user?.walletAmount, profile.pricePerMin)
                    setOpen(true)
                    setTime(data)
                }, 1400)
            }
        } else {
            Swal.fire({
                title: 'Error!',
                text: "Please login to calculate maximum time for call",
                icon: 'error',
                confirmButtonText: 'Okay'
            });
        }
    }

    const handleClose = () => {
        setOpen(false)
        setTime('0')
    }

    const connectWithProviderWithCall = async () => {
        setCallLoader(true)
        if (!UserData) {
            window.location.href = `/login?redirect=${window.location.href}`
            return Swal.fire({
                title: 'Error!',
                text: 'Login first',
                icon: 'error',
                confirmButtonText: 'Okay'
            });
        }
        try {
            const data = await fetchProviderData(id);

            if (!data.success) {
                setCallLoader(false);
                return Swal.fire({
                    title: 'Error!',
                    text: data.message || "Provider is not available",
                    icon: 'error',
                    confirmButtonText: 'Okay'
                });
            }
        } catch (error) {
            console.error("Error fetching provider data:", error);
            setCallLoader(false);
            return;
        }

        try {
            const res = await axios.post('https://testapi.dessobuild.com/api/v1/create-call', {
                userId: UserData._id,
                providerId: id,
                UserWallet: UserData?.walletAmount,
                ProviderProfileMin: profile.pricePerMin,
                max_duration_allowed: time
            })
            console.log("res", res.data)
            setOpen(false)
            setTime('0')
            setTimeout(() => (
                setCallLoader(false)
            ), 5000)
        } catch (error) {
            console.log(error)
            setCallLoader(false)
            Swal.fire({
                title: 'Error!',
                text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later",
                icon: 'error',
                confirmButtonText: 'Okay'
            });
        }
    }

    useEffect(() => {
        handleFetchUser()
        handleFetchReview();
    }, [])

    if (loading) {
        return (
            <div className="architect-profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return <div className="architect-profile-error">{error}</div>;
    }

    if (!allService) {
        return <div className="architect-profile-error">No services available</div>
    }

    if (profileLoading) {
        return (
            <div className="architect-profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading profile details...</p>
            </div>
        );
    }

    if (callLoader) {
        return <CallLoader />
    }

    return (
        <>
            <div className='architect-profile-container'>
                {/* Breadcrumb */}
                <div className="container-fluid">
                    <nav aria-label="breadcrumb" className="architect-breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a href="/">Home</a>
                            </li>
                            <li className="breadcrumb-item">
                                <a href={`/${profile.type === 'Architect' ? 'talk-to-architect' :
                                    profile.type === 'Interior' ? 'talk-to-interior' :
                                        profile.type === 'Vastu' ? 'Vastu' :
                                            ''}`}>
                                    {profile.type || 'Architects'}
                                </a>
                            </li>
                            {/* <li className="breadcrumb-item">
  <a href={`/${profile.slug || 'Vastu'}`}>
    {profile.category || 'Architects'}
  </a>
</li> */}

                            <li className="breadcrumb-item active" aria-current="page">
                                {profile.name || 'N/A'}
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Profile Header Section */}
                <section className='architect-profile-header'>
                    <div className='container-fluid'>
                        <div className='architect-profile-card'>
                            {profile.isHelpuBuildVerified &&
                                <div className="verified-badge-container">
                                    <img src={verifiedBadge} className="verified-badge-profile" alt="Verified" />
                                </div>
                            }

                            <div className='architect-profile-content'>
                                <div className='architect-profile-image-section'>
                                    <div className='architect-profile-image'>
                                        <img
                                            src={profile?.photo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random`}
                                            alt="Profile"
                                        />
                                    </div>
                                </div>

                                <div className='architect-profile-info'>
                                    <div className="profile-name-section">
                                        <h1 className='architect-name'>
                                            {profile.name}
                                            {profile.isHelpuBuildVerified && <HiBadgeCheck className="verified-icon" />}
                                        </h1>
                                        <span className="architect-id">ID: {profile.unique_id}</span>
                                    </div>

                                    <div className="profile-details-grid">
                                        <div className="profile-detail-item">
                                            <i className="fas fa-user-tag"></i>
                                            <span>{profile.type}</span>
                                        </div>

                                        {profile.experience && (
                                            <div className="profile-detail-item">
                                                <i className="fas fa-briefcase"></i>
                                                <span>{profile.experience} Years Experience</span>
                                            </div>
                                        )}

                                        {profile.pricePerMin && (
                                            <div className="profile-detail-item highlight">
                                                <i className="fas fa-tag"></i>
                                                <span>₹{profile.pricePerMin}/min</span>
                                            </div>
                                        )}
                                    </div>

                                    {profile.language && profile.language.length > 0 && (
                                        <div className="profile-languages">
                                            <h4>Languages</h4>
                                            <div className="language-tags">
                                                {profile.language.map((lang, index) => (
                                                    <span key={index} className="language-tag">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {profile.expertiseSpecialization && profile.expertiseSpecialization.length > 0 && (
                                        <div className="profile-expertise">
                                            <h4>Specializations</h4>
                                            <div className="expertise-tags">
                                                {profile.expertiseSpecialization.map((specialization, index) => (
                                                    <span key={index} className="expertise-tag">
                                                        {specialization}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className='architect-connect-section'>
                                    <div className="connect-buttons">
                                        <button
                                            onClick={() => showModelOfPrice()}
                                            className={`connect-btn ${profile.callStatus ? 'v2CallActiveBtn' : 'v2CallDeactiveBtn'}`}
                                            disabled={!profile.callStatus}
                                        >
                                            <i className="fas fa-phone"></i>
                                            {profile.callStatus ? 'Call Now' : 'Not Available'}
                                        </button>

                                        <button
                                            onClick={() => handleActiveTime("Chat")}
                                            disabled={!profile.chatStatus}
                                            className={`connect-btn ${profile.chatStatus ? 'v2CallActiveBtn' : 'v2CallDeactiveBtn'}`}
                                        >
                                            <i className="fas fa-comments"></i>
                                            {profile.chatStatus ? 'Start Chat' : 'Not Available'}
                                        </button>
                                    </div>

                                    {/* <div className="availability-status">
                                        <div className="status-item">
                                            <span className={`status-indicator ${profile.callStatus ? 'online' : 'offline'}`}></span>
                                            Call {profile.callStatus ? 'Available' : 'Unavailable'}
                                        </div>
                                        <div className="status-item">
                                            <span className={`status-indicator ${profile.chatStatus ? 'online' : 'offline'}`}></span>
                                            Chat {profile.chatStatus ? 'Available' : 'Unavailable'}
                                        </div>
                                    </div> */}
                                </div>
                            </div>

                            {/* About Section */}
                            <div className='architect-about-section'>
                                <h3>About Me</h3>
                                <p>{profile?.bio || 'No bio available at the moment.'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                {VenderType !== 'Vastu' && (
                    <section className="architect-services-section">
                        <div className="container-fluid">
                            <div className="services-header">
                                <h2>Services Offered</h2>
                                <p>Choose a category to view specialized services</p>
                            </div>

                            <div className="category-selector">
                                <button
                                    onClick={() => handleCategoryChange('Residential')}
                                    className={`category-btn ${selectedCategory === 'Residential' ? 'active' : ''}`}
                                >
                                    Residential
                                </button>
                                <button
                                    onClick={() => handleCategoryChange('Commercial')}
                                    className={`category-btn ${selectedCategory === 'Commercial' ? 'active' : ''}`}
                                >
                                    Commercial
                                </button>
                                <button
                                    onClick={() => handleCategoryChange('Landscape')}
                                    className={`category-btn ${selectedCategory === 'Landscape' ? 'active' : ''}`}
                                >
                                    Landscape
                                </button>
                            </div>

                            {loading ? (
                                <div className="services-loading">
                                    <div className="loading-spinner-small"></div>
                                    <p>Loading services...</p>
                                </div>
                            ) : (
                                <div className="services-card">
                                    <h3 className="services-category-title">{selectedCategory} Services</h3>

                                    <div className="services-grid">
                                        <div className="service-item">
                                            <div className="service-icon">
                                                <i className="fas fa-drafting-compass"></i>
                                            </div>
                                            <div className="service-info">
                                                <h5>Concept Design</h5>
                                                <p className="service-price">
                                                    {allService?.conceptDesignWithStructure
                                                        ? `₹${allService.conceptDesignWithStructure}/sq. ft.`
                                                        : 'Price on request'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="service-item">
                                            <div className="service-icon">
                                                <i className="fas fa-tools"></i>
                                            </div>
                                            <div className="service-info">
                                                <h5>Building Service MEP</h5>
                                                <p className="service-price">
                                                    {allService?.buildingServiceMEP
                                                        ? `₹${allService.buildingServiceMEP}/sq. ft.`
                                                        : 'Price on request'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="service-item">
                                            <div className="service-icon">
                                                <i className="fas fa-pencil-ruler"></i>
                                            </div>
                                            <div className="service-info">
                                                <h5>Working Drawing</h5>
                                                <p className="service-price">
                                                    {allService?.workingDrawing
                                                        ? `₹${allService.workingDrawing}/sq. ft.`
                                                        : 'Price on request'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="service-item">
                                            <div className="service-icon">
                                                <i className="fas fa-couch"></i>
                                            </div>
                                            <div className="service-info">
                                                <h5>Interior 3D</h5>
                                                <p className="service-price">
                                                    {allService?.interior3D
                                                        ? `₹${allService.interior3D}/sq. ft.`
                                                        : 'Price on request'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="service-item">
                                            <div className="service-icon">
                                                <i className="fas fa-building"></i>
                                            </div>
                                            <div className="service-info">
                                                <h5>Exterior 3D</h5>
                                                <p className="service-price">
                                                    {allService?.exterior3D
                                                        ? `₹${allService.exterior3D}/sq. ft.`
                                                        : 'Price on request'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Portfolio Section */}
                <section className="architect-portfolio-section">
                    <div className="container-fluid">
                        <div className="portfolio-header">
                            <h2>Portfolio</h2>

                            <div className="portfolio-tabs">
                                <button
                                    className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('gallery')}
                                >
                                    <i className="fas fa-images"></i> Gallery
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('portfolio')}
                                >
                                    <i className="fas fa-file-pdf"></i> Portfolio
                                </button>
                            </div>
                        </div>

                        <div className="portfolio-content">
                            {activeTab === 'gallery' ? (
                                <div className="gallery-grid">
                                    {profile?.portfolio?.GalleryImages && profile.portfolio.GalleryImages.length > 0 ? (
                                        profile.portfolio.GalleryImages.map((image, index) => (
                                            <div key={index} className="gallery-item">
                                                <img src={image?.url} alt={`Gallery ${index + 1}`} />
                                                <div className="gallery-overlay">
                                                    <i className="fas fa-search-plus"></i>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <i className="fas fa-images"></i>
                                            <p>No gallery images available</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="portfolio-viewer">
                                    {profile?.portfolio?.PortfolioLink?.url ? (
                                        <iframe
                                            src={profile.portfolio.PortfolioLink.url}
                                            title="Portfolio Document"
                                            className="portfolio-iframe"
                                        ></iframe>
                                    ) : (
                                        <div className="empty-state">
                                            <i className="fas fa-file-pdf"></i>
                                            <p>No portfolio document available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Reviews Section */}
                <section className="architect-reviews-section">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-5">
                                <RatingSummary
                                    profile={profile}
                                    reviews={reviews}
                                    ratingPercentages={ratingPercentages}
                                />
                            </div>

                            <div className="col-lg-7">
                                <div className="reviews-container">
                                    <div className="reviews-header">
                                        <h3>Customer Reviews</h3>
                                        <span className="reviews-count">{reviews?.length || 0} reviews</span>
                                    </div>

                                    <ReviewAdd user_id={user?._id} provider_id={id} />

                                    <div className="reviews-list">
                                        {reviews && reviews.length > 0 ? (
                                            reviews.reverse().map((item, index) => (
                                                <div key={index} className="review-card">
                                                    <div className="reviewer-info">
                                                        <div className="reviewer-avatar">
                                                            <img
                                                                src={item?.userId?.ProfileImage?.imageUrl ||
                                                                    `https://ui-avatars.com/api/?background=random&name=${item?.userId?.name}`}
                                                                alt={item?.userId?.name}
                                                            />
                                                        </div>
                                                        <div className="reviewer-details">
                                                            <h5 className="reviewer-name">{item?.userId?.name}</h5>
                                                            <div className="review-metadata">
                                                                <StarRating rating={item.rating} />
                                                                <span className="review-date">
                                                                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="review-content">
                                                        <p>{item.review}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="empty-reviews">
                                                <i className="fas fa-comment-slash"></i>
                                                <p>No reviews yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call Modal */}
                {open && (
                    <ModelOfPriceAndTime
                        seconds={time}
                        UserData={user}
                        Profile={profile}
                        onClose={handleClose}
                        startCall={connectWithProviderWithCall}
                    />
                )}
            </div>
        </>
    )
}

export default ArchitectProfile;