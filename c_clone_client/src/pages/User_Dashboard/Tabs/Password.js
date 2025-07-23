import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GetData } from '../../../utils/sessionStoreage';

const Password = () => {
  const Data = GetData('user');
  const UserData = JSON.parse(Data);
  const UserId = UserData?._id;

  const [passwordData, setPasswordData] = useState({
    password: '',
    newPassword: '',
  });

  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        `https://testapi.helpubuild.in/api/v1/update-provider-password/${UserId}`,
        passwordData
      );
      toast.success(res.data.message || 'Password updated successfully!');
      sessionStorage.clear();
      window.location.href = '/login';
      // setPasswordData({ password: '', newPassword: '' }); // Reset form
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Failed to update password. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <div className="card p-4">
        <h3 className="text-center mb-4">Update Password</h3>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-xl-6 col-md-12 mb-2">
              <label htmlFor="password" className="form-label">
                Current Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={passwordData.password}
                onChange={handleChange}
                placeholder="Enter your current password"
                required
              />
            </div>
            {/* </div> */}

            {/* <div className="row mb-3"> */}
            <div className="col-xl-6 col-md-12 mb-2">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="form-control"
                value={passwordData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                required
              />
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="btn as_btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Password;
