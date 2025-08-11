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
// import { GetData } from '../../utils/sessionStoreage'

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
    // console.log("UserData",UserData)
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
    const [selectedCategory, setSelectedCategory] = useState('Residential'); // Default category
    const [allService, setAllService] = useState({});
    const [profileLoading, setProfileLoading] = useState(true);
    const [callLoader, setCallLoader] = useState(false);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, [])

    const handleFetchProvider = async (providerId) => {
        setLoading(true);
        try {
            // Fetch services for the selected category
            const { data } = await axios.get(
                `https://api.dessobuild.com/api/v1/get-service-by-provider/${providerId}/${selectedCategory}`
            );

            // Find the service data for the selected category
            const serviceData = data.data.find(
                (service) => service.category === selectedCategory
            );

            // Update state with the selected category data
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
            // Fetch services for the selected category
            const { data } = await axios.get(
                `https://api.dessobuild.com/api/v1/get-user-by-id/${UserData?._id}`
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
            const response = await axios.post(`https://api.dessobuild.com/api/v1/provider_status/${id}`);
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
        // handleFetchProvider();
    }, [id]);

    const [formData, setFormData] = useState({
        userId: '',
        providerId: id,
    })

    const handleActiveTime = async (Chat) => {
        if (!UserData) {
            // return toast.error('Login first')
            return Swal.fire({
                title: 'Error!',
                text: 'Login first',
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        }
        if (UserData.role === 'provider') {
            // return toast.error("Access Denied: Providers are not authorized to access this feature.");
            return Swal.fire({
                title: 'Error!',
                text: "Access Denied: Providers are not authorized to access this feature.",
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        }
        if (!profile.pricePerMin || profile.pricePerMin <= 0) {
            // return toast.error("Chat cannot be started. Provider pricing information is unavailable or invalid.");
            return Swal.fire({
                title: 'Error!',
                text: "Chat cannot be started. Provider pricing information is unavailable or invalid.",
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        }
        if (Chat === 'Chat') {

            const newForm = {
                ...formData,
                userId: UserData._id,
            }
            try {
                const res = await axios.post('https://api.dessobuild.com/api/v1/create-chat', newForm)
                window.location.href = '/chat'
            } catch (error) {
                console.log("Internal server error", error)
                // toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later")
                const errorMessage = error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later";
                if (errorMessage.includes('Chat is already started. Check Your chat room.')) {
                    return window.location.href = '/chat'
                }
                Swal.fire({
                    title: 'Error!',
                    text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later",
                    icon: 'error', // use lowercase
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
            const { data } = await axios.get(`https://api.dessobuild.com/api/v1/get-single-provider/${id}`);
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
                `https://api.dessobuild.com/api/v1/get-review-by-providerId/${id}`
            );
            console.log("Reviews fetched:", data.data);
            setReviews(data.data);

            // Calculate rating counts
            const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            data.data.forEach((review) => {
                counts[review.rating] = (counts[review.rating] || 0) + 1;
            });

            setRatingCounts(counts);

            // Calculate percentages
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
            // console.log("PricePerMin",PricePerMin)
            let maxTimeForCall = (fixedAmount / PricePerMin) * 60;
            if (PricePerMin === 0) {
                // throw new Error("Price per minute cannot be zero.");
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
                // return toast.error("Access Denied: Providers are not authorized to access this feature.");
                return Swal.fire({
                    title: 'Error!',
                    text: "Access Denied: Providers are not authorized to access this feature.",
                    icon: 'error', // use lowercase
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
            // toast.error("Please login to calculate maximum time for call")
            Swal.fire({
                title: 'Error!',
                text: "Please login to calculate maximum time for call",
                icon: 'error', // use lowercase
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
            // return toast.error('Login first')
            return Swal.fire({
                title: 'Error!',
                text: 'Login first',
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        }
        try {
            const data = await fetchProviderData(id);  // Ensure `await` is used
            // console.log("Data", data);

            if (!data.success) {
                setCallLoader(false);
                // return toast.error(data.message || "Provider is not available");
                return Swal.fire({
                    title: 'Error!',
                    text: data.message || "Provider is not available",
                    icon: 'error', // use lowercase
                    confirmButtonText: 'Okay'
                });
            }
        } catch (error) {
            console.error("Error fetching provider data:", error);
            setCallLoader(false);
            return;
        }




        try {

            const res = await axios.post('https://api.dessobuild.com/api/v1/create-call', {
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
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        }
    }



    useEffect(() => {
        handleFetchUser()
        handleFetchReview();
    }, [])

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-danger">{error}</div>;
    }

    if (!allService) {
        return <div className="text-center">No services available</div>
    }

    if (profileLoading) {
        return <div className="text-center">Loading profile...</div>;
    }
    if (callLoader) {
        return <CallLoader />
    }

    return (
        <>
            <div className='main-bg'>
                <section className='architecture-section-one'>
                    <div className='container-fluid architecture-section-p pt-3'>
                        <div className='row'>
                            {/* Breadcrumbhy */}
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <a href="#">Home</a>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        {profile.name || 'N/A'}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    <div className='container-fluid architecture-section-p rounded profile-card'>
                    {profile.isHelpuBuildVerified && <img src={verifiedBadge} className="verified-badge-profile" />}
                        <div className='row prfile-custom-card py-5 align-items-center'>
                            <div className='col-xl-4 col-lg-4 col-md-6 col-12'>
                                <div className='a-profile-image text-center'>
                                    <img src={profile?.photo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random`} alt="Profile Picture" className="text-center" /><br />
                                    {/* <button className="btn profile-follow-btn mt-3">Follow us</button> */}
                                </div>
                            </div>
                            <div className='col-xl-4 col-lg-4 col-md-6 col-12'>
                                <div className='profile-info'>
                                    {/* Name */}
                                    {profile.name && (
                                        <h4 className='fw-bold archi-profile-name'>
                                            {profile.name} {profile.isHelpuBuildVerified && <HiBadgeCheck />}
                                        </h4>
                                    )}

                                    {/* Unique ID */}
                                    {profile.unique_id && (
                                        <p className="archi-cateogry">
                                            ID: {profile.unique_id}
                                        </p>
                                    )}

                                    {/* Type */}
                                    {profile.type && (
                                        <p className="archi-cateogry">
                                            {profile.type}
                                        </p>
                                    )}

                                    {/* Language */}
                                    {profile.language && profile.language.length > 0 && (
                                        <p className='archi-Language'>
                                            {profile.language.map((lang, index) => (
                                                <span key={index} className="archi-language-tag">
                                                    {lang}{index < profile.language.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                        </p>
                                    )}

                                    {/* Expertise Specialization */}
                                    {profile.expertiseSpecialization && profile.expertiseSpecialization.length > 0 && (
                                        <p className='archi-experties'>
                                            {profile.expertiseSpecialization.map((specialization, index) => (
                                                <span key={index} className="archi-language-tag">
                                                    {specialization}{index < profile.expertiseSpecialization.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                        </p>
                                    )}

                                    {/* Experience */}
                                    {profile.experience && (
                                        <p className='archi-exp'>
                                            Exp: {profile.experience} Years
                                        </p>
                                    )}

                                    {/* Pricing */}
                                    {profile.pricePerMin && (
                                        <p className="fw-bold archi-duration-price">
                                            ₹ {profile.pricePerMin}/min
                                        </p>
                                    )}
                                </div>
                            </div>


                            <div className='col-xl-4 col-lg-4 col-md-6 col-12'>
                                <div className='connect-area'>
                                    <button onClick={() => showModelOfPrice()} className={` ${profile.callStatus === true ? 'profile-chat-btn' : 'profile-call-btn'}`} disabled={!profile.callStatus} ><i class="fa-solid fa-phone-volume"></i> Call</button>
                                    <button onClick={() => handleActiveTime("Chat")} disabled={!profile.chatStatus} className={` mt-2 ${profile.chatStatus === true ? 'profile-chat-btn' : 'profile-call-btn'}`}><i class="fa-regular fa-comments"></i> Chat</button>
                                    {/* <button className={`btn mt-2 ${profile.meetStatus === true ? 'profile-chat-btn' : 'profile-call-btn'}`} disabled={!profile.meetStatus}><i class="fa-solid fa-video"></i> Video</button> */}
                                </div>
                            </div>

                            <div className="container mt-5">


                                {/* Services Display */}
                                <div className="row mt-5">
                                    {VenderType !== 'Vastu' && (
                                        loading ? (
                                            <div className="text-center">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="col-12">
                                                <div className="text-center">
                                                    <h2 className="mb-4">Our Services</h2>
                                                    <p className="text-muted">
                                                        Choose a category to view the specialized services we offer.
                                                    </p>
                                                </div>

                                                <div style={{ display: 'flex' }} className="justify-content-center align-items-center gap-3">
                                                    <button
                                                        onClick={() => handleCategoryChange('Residential')}
                                                        className={`btn ${selectedCategory === 'Residential' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    >
                                                        Residential
                                                    </button>
                                                    <button
                                                        onClick={() => handleCategoryChange('Commercial')}
                                                        className={`btn ${selectedCategory === 'Commercial' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    >
                                                        Commercial
                                                    </button>
                                                    <button
                                                        onClick={() => handleCategoryChange('Landscape')}
                                                        className={`btn ${selectedCategory === 'Landscape' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    >
                                                        Landscape
                                                    </button>
                                                </div>
                                                <div className="card shadow-sm p-4 mt-4">
                                                    <h3 className="text-center mb-4">
                                                        {selectedCategory} Services
                                                    </h3>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <h5>Concept Design</h5>
                                                            <p className="text-muted">
                                                                {allService?.conceptDesignWithStructure
                                                                    ? `₹${allService.conceptDesignWithStructure}/sq. ft.`
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <h5>Building Service MEP</h5>
                                                            <p className="text-muted">
                                                                {allService?.buildingServiceMEP
                                                                    ? `₹${allService.buildingServiceMEP}/sq. ft.`
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <h5>Working Drawing</h5>
                                                            <p className="text-muted">
                                                                {allService?.workingDrawing
                                                                    ? `₹${allService.workingDrawing}/sq. ft.`
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <h5>Interior 3D</h5>
                                                            <p className="text-muted">
                                                                {allService?.interior3D
                                                                    ? `₹${allService.interior3D}/sq. ft.`
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <h5>Exterior 3D</h5>
                                                            <p className="text-muted">
                                                                {allService?.exterior3D
                                                                    ? `₹${allService.exterior3D}/sq. ft.`
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}


                                </div>
                            </div>





                            <div className='col-xl-12'>
                                <div className='about-architect'>
                                    <h3 className='about-title mb-4'>About me</h3>

                                    <p className='text-center'>{profile?.bio || 'No bio available'}</p>

                                </div>
                            </div>
                            <div className='col-lg-12 mt-4' >
                                {/* <!-- Pills navs --> */}
                                <ul className="nav nav-pills gap-3 mb-3 d-flex justify-content-center" id="ex1" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <a
                                            className="nav-link active"
                                            id="ex2-tab-1"
                                            data-bs-toggle="pill"
                                            href="#ex2-pills-1"
                                            role="tab"
                                            aria-controls="ex2-pills-1"
                                            aria-selected="true"
                                        >
                                            Gallery
                                        </a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a
                                            className="nav-link"
                                            id="ex2-tab-2"
                                            data-bs-toggle="pill"
                                            href="#ex2-pills-2"
                                            role="tab"
                                            aria-controls="ex2-pills-2"
                                            aria-selected="false"
                                        >
                                            Portfolio
                                        </a>
                                    </li>
                                </ul>
                                {/* <!-- Pills navs --> */}

                                {/* <!-- Pills content --> */}
                                <div className="tab-content" id="ex2-content">
                                    <div
                                        className="tab-pane show active"
                                        id="ex2-pills-1"
                                        role="tabpanel"
                                        aria-labelledby="ex2-tab-1"
                                    >
                                        <div className="gallery profile-about-gallery row">
                                            {
                                                profile?.portfolio?.GalleryImages && profile?.portfolio?.GalleryImages.map((image, index) => (
                                                    <div key={index} className="col-6 col-sm-4">
                                                        <img src={image?.url} alt="Profile Picture" className="img-fluid rounded" />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    <div
                                        className="tab-pane"
                                        id="ex2-pills-2"
                                        role="tabpanel"
                                        aria-labelledby="ex2-tab-2"
                                    >
                                        <div className="gallery profile-about-gallery row">
                                            <div className="col-6 col-sm-4 d-flex align-items-center justify-content-center w-100">
                                                <iframe
                                                    src={profile?.portfolio?.PortfolioLink?.url}
                                                    width="100%"
                                                    height="600px"
                                                    title="Portfolio PDF"
                                                ></iframe>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* <!-- Pills content --> */}


                            </div>
                        </div>
                    </div>
                    <ReviewAdd user_id={user?._id} provider_id={id} />

                    <div className='container-fluid architecture-section-p'>
                        <div className='row mt-4'>
                            <div className='col-lg-6'>

                                <RatingSummary
                                    profile={profile}
                                    reviews={reviews}
                                    ratingPercentages={ratingPercentages}
                                />

                            </div>
                            <div className='col-lg-6'>

                                <div className="user-reviews-container">
                                    <div className="reviews-header">
                                        <h3>User Reviews</h3>
                                        <div className="reviews-stats">
                                            <span className="review-count">{reviews?.length || 0} Reviews</span>
                                        </div>
                                    </div>

                                    <div className="reviews-list">
                                        {reviews && reviews.reverse().map((item, index) => (
                                            <div key={index} className="review-item">
                                                <div className="review-user-info">
                                                    <div className="user-avatar-container">
                                                        <img
                                                            src={item?.userId?.ProfileImage?.imageUrl ||
                                                                `https://ui-avatars.com/api/?background=random&name=${item?.userId?.name}`}
                                                            alt={item?.userId?.name}
                                                            className="user-avatar"
                                                        />
                                                        <span className="user-status"></span>
                                                    </div>
                                                    <div className="user-details">
                                                        <h6 className="user-name">{item?.userId?.name}</h6>
                                                        <div className="review-meta">
                                                            <StarRating rating={item.averageRating} />
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
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </section>
                {
                    open && <ModelOfPriceAndTime seconds={time} UserData={user} Profile={profile} onClose={handleClose} startCall={connectWithProviderWithCall} />
                }
            </div>
        </>
    )
}

export default ArchitectProfile;