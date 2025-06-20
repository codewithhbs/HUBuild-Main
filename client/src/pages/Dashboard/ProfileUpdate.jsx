import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { GetData } from '../../utils/sessionStoreage';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function ProfileUpdate() {
    const Data = GetData('user');
    const UserData = JSON.parse(Data);
    const UserId = UserData?._id;
    const role = UserData?.type;
    const token = GetData('token');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        PhoneNumber: '',
        Gender: '',
        ProfileImage: null // to handle image file
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: files[0]
            }));
        }
    };

    const handleFetchUser = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`https://api.helpubuild.in/api/v1/get-user-by-id/${UserId}`);
            // console.log(data.data);
            const allData = data.data;
            setFormData({
                name: allData.name,
                email: allData.email,
                PhoneNumber: allData.PhoneNumber,
                Gender: allData.gender,
                ProfileImage: allData.ProfileImage?.url || null // add the URL if available
            });
        } catch (error) {
            console.log("Internal server error in getting user data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('PhoneNumber', formData.PhoneNumber);
        // formDataToSend.append('Gender', formData.Gender);

        // If there's a profile image, append it to the form data
        if (formData.ProfileImage) {
            formDataToSend.append('ProfileImage', formData.ProfileImage);
        }

        try {
            const response = await axios.put(
                `https://api.helpubuild.in/api/v1/user/update-profile/${UserId}`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                }
            );
            // toast.success('Profile updated successfully!');
            Swal.fire({
                title: 'Profile Updated!',
                text: response.data.message || 'Profile updated successfully!',
                icon: 'success', // use lowercase
                confirmButtonText: 'Okay'
            });
        } catch (error) {
            console.log("Internal server error in updating", error);
            // toast.error(
            //     error?.response?.data?.message || 'Failed to update profile. Please try again.'
            // );
            Swal.fire({
                title: 'Error!',
                text: error?.response?.data?.message || 'Failed to update profile. Please try again.',
                icon: 'error', // use lowercase
                confirmButtonText: 'Okay'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFetchUser();
    }, []);

    return (
        <div className="mt-5">
            <h1 className="text-center mb-4">Profile</h1>
            <form onSubmit={handleSubmit} className="card p-4" encType="multipart/form-data">
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="name" className="form-label">
                            Name
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6 mt-2">
                        <label htmlFor="PhoneNumber" className="form-label">
                            Mobile Number
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="PhoneNumber"
                            name="PhoneNumber"
                            value={formData.PhoneNumber}
                            onChange={handleChange}
                        />
                    </div>
                    {/* Profile Image Upload */}
                    <div className="col-md-6 mt-2">
                        <label htmlFor="ProfileImage" className="form-label">
                            Profile Image
                        </label>
                        <input
                            type="file"
                            className="form-control"
                            id="ProfileImage"
                            name="ProfileImage"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
                <div className='submit-button-container'>
                <button
                    type="submit"
                    className="btn as_btn text-white"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Update Profile'}
                </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileUpdate;
