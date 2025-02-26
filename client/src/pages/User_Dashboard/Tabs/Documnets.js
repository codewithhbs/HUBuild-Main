import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GetData } from '../../../utils/sessionStoreage';
import toast from 'react-hot-toast';
import './documents.css';
import Swal from 'sweetalert2';

export const Documents = () => {
  const Data = GetData('user');
  const UserData = JSON.parse(Data);
  const UserId = UserData?._id;

  const [memberData, setMemberData] = useState({
    qualificationProof: null,
    photo: null,
    adhaarCard: null,
    panCard: null,
  });
  const [uploadedImages, setUploadedImages] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const { data } = await axios.get(
          `https://api.helpubuild.co.in/api/v1/get-single-provider/${UserId}`
        );
        const providerData = data.data;
        setUploadedImages({
          qualificationProof: providerData.qualificationProof?.imageUrl,
          photo: providerData.photo?.imageUrl,
          adhaarCard: providerData.adhaarCard?.imageUrl,
          panCard: providerData.panCard?.imageUrl,
        });
      } catch (error) {
        console.error('Error fetching provider data', error);
        toast.error('Failed to fetch profile data.');
      }
    };
    fetchProvider();
  }, [UserId]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setMemberData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const makeFormData = () => {
    const formData = new FormData();
    Object.keys(memberData).forEach((key) => {
      if (memberData[key]) {
        formData.append(key, memberData[key]);
      }
    });
    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = makeFormData();
    setLoading(true);
    try {
      const res = await axios.put(
        `https://api.helpubuild.co.in/api/v1/update-provider-documents/${UserId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      // toast.success(res.data.message || 'Documents updated successfully!');
      Swal.fire({
        title: 'Success!',
        text: res.data.message || 'Documents updated successfully!',
        icon: 'success', // use lowercase
        confirmButtonText: 'Okay'
      });
    } catch (error) {
      console.error('Error updating documents:', error);
      // toast.error(
      //   error?.response?.data?.errors?.[0] ||
      //   error?.response?.data?.message ||
      //   'Failed to update documents. Please try again later.'
      // );
      Swal.fire({
        title: 'Error!',
        text: error?.response?.data?.errors?.[0] || error?.response?.data?.message || 'Failed to update documents. Please try again later.',
        icon: 'error', // use lowercase
        confirmButtonText: 'Okay'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="documents-section">
      <h2 className="documents-heading">Upload Documents</h2>
      <form onSubmit={handleSubmit} className="documents-form">
        <div className="documents-grid">
          {['qualificationProof', 'photo', 'adhaarCard', 'panCard'].map((field) => (
            <div className="document-field" key={field}>
              <label htmlFor={field} className="document-label">
                {field.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              {uploadedImages[field] && (
                <div className="document-preview">
                  <img
                    src={uploadedImages[field]}
                    alt={`${field} preview`}
                    className="document-image"
                  />
                </div>
              )}
              <input
                type="file"
                name={field}
                id={field}
                className="document-input"
                onChange={handleFileChange}
              />
            </div>
          ))}
          <div className="submit-button-container">
            <button
              type="as_btn"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" role="status" aria-hidden="true"></span>
                  Uploading...
                </>
              ) : (
                'Upload Documents'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Documents