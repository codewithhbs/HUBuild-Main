import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useGeolocated } from "react-geolocated";
import { setData } from '../utils/sessionStoreage';
import Swal from 'sweetalert2';

function MembershipRegistration() {
    const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 5000,
    });

    const [memberData, setMemberData] = useState({
        name: '',
        email: '',
        type: '',
        mobileNumber: '',
        gstDetails: '',
        coaNumber: '',
        expertiseSpecialization: [],
        location: '',
        password: '',
        DOB: '',
        photo: null,
        adhaarCard: null,
        panCard: null,
        age: '',
        language: [],
        Qualification: '',
        qualificationProof: null
    });

    const [isPasswordShow, setIsPasswordShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchCurrentLocation = async () => {
        if (!coords) return;
        try {
            const res = await axios.post('https://api.dessobuild.com/Fetch-Current-Location', {
                lat: coords.latitude,
                lng: coords.longitude
            });
            const data = res.data.data.address;
            if (data) {
                setMemberData((prev) => ({ ...prev, location: data.completeAddress }));
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    };

    useEffect(() => {
        if (coords) {
            fetchCurrentLocation();
        }
    }, [coords]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMemberData((prev) => ({
            ...prev,
            [name]: value
        }));
        if (name === 'DOB') {
            CalculateDob(value);
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setMemberData((prev) => ({
            ...prev,
            [name]: files[0]
        }));
    };

    const validateAge = () => {
        if (parseInt(memberData.age) <= 22) {
            // toast.error('Age must be greater than 22');
            Swal.fire({
                title: 'Error!',
                text: 'Age must be greater than 22',
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
            return false;
        }
        return true;
    };

    const validatePhone = () => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(memberData.mobileNumber)) {
            // toast.error('Mobile number must be exactly 10 digits.');
            Swal.fire({
                title: 'Error!',
                text: 'Mobile number must be exactly 10 digits.',
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
            return false;
        }
        if (parseInt(memberData.age) <= 22) {
            // toast.error('Age must be greater than 22.');
            Swal.fire({
                title: 'Error!',
                text: 'Age must be greater than 22.',
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
            return false;
        }
        return true;
    };

    const CalculateDob = (birthDateString) => {
        const today = new Date();
        const birthDate = new Date(birthDateString);
        const age = today.getFullYear() - birthDate.getFullYear();
        setMemberData((prev) => ({ ...prev, age }));
    };

    const makeFormData = () => {
        const formData = new FormData();
        Object.keys(memberData).forEach((key) => {
            if (Array.isArray(memberData[key])) {
                formData.append(key, memberData[key].join(','));
            } else {
                formData.append(key, memberData[key]);
            }
        });
        return formData;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePhone() || !validateAge()) return;
        setLoading(true);
        try {
            const res = await axios.post('https://api.dessobuild.com/api/v1/register-provider', makeFormData());

            // toast.success(res.data.message);
            Swal.fire({
                title: 'Success!',
                text: res.data.message,
                icon: 'success', // use lowercase
                confirmButtonText: 'Okay'
            });
            const { token, user } = res.data;
            setData('token', token);
            setData('islogin', token ? true : false)
            setData('user', JSON.stringify(user))
            window.location.href = "/"
        } catch (error) {
            console.error('Error during registration:', error);
            // toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
            Swal.fire({
                title: 'Error!',
                text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later",
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="py-5">
                <div className="container">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-lg-12 col-xl-11">
                            <div className="card text-black" style={{ borderRadius: 25 }}>
                                <div className="card-body register-bg p-md-5">
                                    <div className="row justify-content-center">
                                        <div className="col-lg-12 col-xl-12 col-md-10 order-2 order-lg-1">
                                            <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4 text-white">
                                                Partner Registration Form
                                            </p>
                                            <form onSubmit={handleSubmit} className="mx-1 mx-md-4">
                                                <div className="row">
                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-user fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white" htmlFor="name" aria-required >
                                                                    Name
                                                                </label>
                                                                <inputm
                                                                    onChange={handleChange}
                                                                    name="name"
                                                                    value={memberData.name}
                                                                    type="text"
                                                                    id="name"
                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-envelope fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white" htmlFor="email">
                                                                    Email
                                                                </label>
                                                                <input
                                                                    onChange={handleChange}
                                                                    name="email"
                                                                    value={memberData.email}
                                                                    type="email"
                                                                    id="email"

                                                                    placeholder="eg:myemail@example."
                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-phone fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white" htmlFor="mobileNumber">
                                                                    Mobile Number
                                                                </label>
                                                                <input
                                                                    onChange={handleChange}
                                                                    name="mobileNumber"
                                                                    value={memberData.mobileNumber}
                                                                    type="tel"

                                                                    id="mobileNumber"
                                                                    placeholder="eg:123456****"
                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-user fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white" htmlFor="type">
                                                                    Partner Type
                                                                </label>
                                                                <select
                                                                    name="type"
                                                                    onChange={handleChange}
                                                                    className="form-control form-select input-shape px-5"
                                                                    value={memberData.type}
                                                                >
                                                                    <option>Select Your Partner Type</option>
                                                                    <option value="Architect">Architect Partner</option>
                                                                    <option value="Interior">Interior Partner</option>
                                                                    <option value="Vastu">Vastu Partner</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {memberData.type === "Architect" && (
                                                        <div className="col-lg-6">
                                                            <div className="d-flex flex-row mb-4">
                                                                <i className="fas fa-id-card fa-lg me-3 fa-fw lable-icon" />
                                                                <div className="form-outline flex-fill mb-0">
                                                                    <label className="form-label text-white" htmlFor="coaNumber">
                                                                        COA Number
                                                                    </label>
                                                                    <input
                                                                        onChange={handleChange}
                                                                        name="coaNumber"
                                                                        value={memberData.coaNumber}
                                                                        type="text"
                                                                        id="coaNumber"
                                                                        className="form-control input-shape px-5"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-book fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white" htmlFor="Qualification">
                                                                    Higher Education
                                                                </label>
                                                                <input
                                                                    onChange={handleChange}
                                                                    name="Qualification"
                                                                    value={memberData.Qualification}
                                                                    type="text"
                                                                    id="Qualification"
                                                                    className="form-control input-shape px-5"
                                                                    placeholder="eg: Diploma in Interior Design , etc"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-cogs fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white" htmlFor="expertiseSpecialization">
                                                                    Expertise Specialization ('separated by commas')
                                                                </label>
                                                                <input
                                                                    onChange={handleChange}
                                                                    name="expertiseSpecialization"
                                                                    value={memberData.expertiseSpecialization}
                                                                    type="text"
                                                                    id="expertiseSpecialization"
                                                                    className="form-control input-shape px-5"
                                                                    placeholder="eg: 3d Design,Productive"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-globe fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white">Location</label>
                                                                <input
                                                                    type="text"
                                                                    name="location"
                                                                    value={memberData.location}
                                                                    onChange={handleChange}
                                                                    placeholder='Write Your Current Location'
                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-cake fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white">Date of Birth</label>
                                                                <input
                                                                    type="date"
                                                                    name="DOB"
                                                                    value={memberData.DOB}
                                                                    onChange={handleChange}

                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-lg-6 d-none">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-birthday-cake fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white">Age</label>
                                                                <input
                                                                    type="text"
                                                                    name="age"
                                                                    value={memberData.age}
                                                                    onChange={handleChange}
                                                                    placeholder='Age Must be Greater Than 22'
                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-language fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white">Language ('separated by commas')</label>
                                                                <input
                                                                    type="text"
                                                                    name="language"
                                                                    value={memberData.language}
                                                                    onChange={handleChange}
                                                                    placeholder='eg: Hinid,English'
                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-id-card fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white">Adhaar Card</label>
                                                                <input
                                                                    type="file"
                                                                    name="adhaarCard"
                                                                    onChange={handleFileChange}
                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-id-card fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white">Profile Image</label>
                                                                <input
                                                                    type="file"
                                                                    name="photo"
                                                                    onChange={handleFileChange}
                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-id-badge fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white">PAN Card</label>
                                                                <input
                                                                    type="file"
                                                                    name="panCard"
                                                                    onChange={handleFileChange}
                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-lg-6">
                                                        <div className="d-flex flex-row mb-4">
                                                            <i className="fas fa-certificate fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white">Qualification Proof</label>
                                                                <input
                                                                    type="file"
                                                                    name="qualificationProof"
                                                                    onChange={handleFileChange}
                                                                    className="form-control input-shape px-5"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Add other fields similarly, maintaining layout */}
                                                    <div className="col-lg-12">
                                                        <div className="d-flex flex-row">
                                                            <i className="fas fa-lock fa-lg me-3 fa-fw lable-icon" />
                                                            <div className="form-outline flex-fill mb-0">
                                                                <label className="form-label text-white" htmlFor="password">
                                                                    Password
                                                                </label>
                                                                <input
                                                                    onChange={handleChange}
                                                                    name="password"
                                                                    value={memberData.password}
                                                                    type={isPasswordShow ? 'text' : 'password'}
                                                                    id="password"
                                                                    className="form-control input-shape px-5"
                                                                />
                                                                <span
                                                                    type="button"
                                                                    onClick={() => setIsPasswordShow(!isPasswordShow)}
                                                                >
                                                                    <i className="far fa-eye pass-showhide"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-center mx-5 mb-3 mb-lg-4">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-lg mt-4 as_btn"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <span>
                                                                Please wait
                                                                <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                                                            </span>
                                                        ) : (
                                                            "Register"
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="col-lg-12">
                                                    <div className="form-check d-flex justify-content-center mb-5">
                                                        <label className="form-check-label text-white" htmlFor="form2Example3">
                                                            Already have an Account? <a href="/login" className="text-warning">Login here</a>
                                                        </label>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </section >
        </>
    );
}

export default MembershipRegistration;