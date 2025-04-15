import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { GetData } from '../../../utils/sessionStoreage';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2'
import Select from 'react-select';

const Profile = () => {

  const Data = GetData('user');
  const UserData = JSON.parse(Data);
  const UserId = UserData?._id;
  const role = UserData?.type
  const [expertise, setExpertise] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    DOB: '',
    language: '',
    mobileNumber: '',
    coaNumber: '',
    location: '',
    pricePerMin: '',
    bio: '',
    expertiseSpecialization: [],
    yearOfExperience: ''
  });
  

  useEffect(() => {
    const fetchExpertise = async () => {
      try {
        const { data } = await axios.get('https://api.helpubuild.co.in/api/v1/all_expertise');
        const formattedExpertise = data.data.map((exp) => ({ label: exp.expertise, value: exp.expertise }));
        setExpertise(formattedExpertise);
      } catch (error) {
        console.log("Internal server error", error);
      }
    };
    fetchExpertise();
  }, []);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleSelectChange = (selectedOptions) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      expertiseSpecialization: selectedOptions
    }));
  };

  const handleFetchProvider = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `https://api.helpubuild.co.in/api/v1/get-single-provider/${UserId}`
      );
      const allData = data.data;
      setFormData({
        name: allData.name || '',
        email: allData.email || '',
        DOB: allData.DOB || '',
        language: allData.language || '',
        mobileNumber: allData.mobileNumber || '',
        coaNumber: allData.coaNumber || '',
        location: allData.location || '',
        pricePerMin: allData.pricePerMin || '',
        bio: allData.bio || '',
        expertiseSpecialization: allData.expertiseSpecialization.map(exp => ({ label: exp, value: exp })) || [],
        yearOfExperience: allData.yearOfExperience || ''
      });
    } catch (error) {
      console.log('Error fetching provider data', error);
      toast.error('Failed to fetch profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        expertiseSpecialization: formData.expertiseSpecialization.map(exp => exp.value),
      };

      const response = await axios.put(
        `https://api.helpubuild.co.in/api/v1/update-provider-profile/${UserId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Update Response:', response.data);
      Swal.fire({
        title: 'Profile Updated!',
        text: response.data.message,
        icon: 'success', // use lowercase
        confirmButtonText: 'Okay'
      });

    } catch (error) {
      console.log('Error updating profile:', error.response?.data || error.message);
      // toast.error(error?.response?.data?.message || 'Failed to update profile. Please try again.');
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
    handleFetchProvider();
  }, []);

  return (
    <div className="mt-5">
      <h1 className="text-center mb-4">Profile</h1>
      <form onSubmit={handleSubmit} className="card p-4">
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="name" style={{ fontWeight: '700' }} className="form-label">
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
            <label htmlFor="email" style={{ fontWeight: '700' }} className="form-label">
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
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="DOB" style={{ fontWeight: '700' }} className="form-label">
              Date of Birth
            </label>
            <input
              type="date"
              className="form-control"
              id="DOB"
              name="DOB"
              value={formData.DOB}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="language" style={{ fontWeight: '700' }} className="form-label">
              Language
            </label>
            <input
              type="text"
              className="form-control"
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mt-2">
            <label htmlFor="mobileNumber" style={{ fontWeight: '700' }} className="form-label">
              Mobile Number
            </label>
            <input
              type="text"
              className="form-control"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
            />
          </div>
          {
            role === 'Architect' && (
              <div className="col-md-6 mt-2">
                <label htmlFor="coaNumber" style={{ fontWeight: '700' }} className="form-label">
                  COA Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="coaNumber"
                  name="coaNumber"
                  value={formData.coaNumber}
                  onChange={handleChange}
                />
              </div>
            )
          }
          <div className="col-md-6 mt-2">
            <label htmlFor="pricePerMin" style={{ fontWeight: '700' }} className="form-label">
              Price Per Minute
            </label>
            <input
              type="number"
              className="form-control"
              id="pricePerMin"
              name="pricePerMin"
              value={formData.pricePerMin}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mt-2">
            <label htmlFor="location" style={{ fontWeight: '700' }} className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mt-2">
            <label htmlFor="yearOfExperience" style={{ fontWeight: '700' }} className="form-label">
              Year Of Experience
            </label>
            <input
              type="text"
              className="form-control"
              id="yearOfExperience"
              name="yearOfExperience"
              value={formData.yearOfExperience}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mt-2">
          <label htmlFor="expertiseSpecialization" style={{ fontWeight: '700' }} className="form-label font-weight-bold">Expertise/Specialization</label>
          <Select
            id="expertiseSpecialization"
            name="expertiseSpecialization"
            options={expertise}
            value={formData.expertiseSpecialization}
            onChange={handleSelectChange}
            isMulti
          />
        </div>
        </div>
        <div className="mb-3">
          <label htmlFor="bio" style={{ fontWeight: '700' }} className="form-label">
            Bio
          </label>
          <textarea
            className="form-control"
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
