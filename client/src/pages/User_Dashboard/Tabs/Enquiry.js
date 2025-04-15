import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GetData } from '../../../utils/sessionStoreage';
import { Link } from 'react-router-dom';

const Enquiry = () => {
  const Data = GetData('user');
  const UserData = JSON.parse(Data);
  const UserId = UserData?._id;

  const [allEnquiries, setEnquiries] = useState([]);

  // Fetch Enquiry Data
  const fetchEnquiryData = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/v1/get-chat-by-providerId/${UserId}`);
      setEnquiries(data.data);
    } catch (error) {
      console.log('Error fetching enquiry data:', error);
      toast.error(
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        'Failed to load enquiries. Please try again later.'
      );
    }
  };

  useEffect(() => {
    fetchEnquiryData();
  }, []);

  return (
    <div className="my-4">
      <div className="card p-4">
        <h3 className="text-center mb-4">Enquiry List</h3>
        {allEnquiries.length === 0 ? (
          <p className="text-center text-muted">No enquiries found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Room ID</th>
                  <th>Payment Status</th>
                  <th>Messages Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allEnquiries.map((enquiry, index) => (
                  <tr key={enquiry._id}>
                    <td>{index + 1}</td>
                    <td>{enquiry.room}</td>
                    <td>
                      <span
                      style={{color:'white', padding:'3px 8px'}}
                        className={`${
                          enquiry.PaymentStatus === 'pending'
                            ? 'bg-warning'
                            : 'bg-success'
                        }`}
                      >
                        {enquiry.PaymentStatus}
                      </span>
                    </td>
                    <td>{enquiry.messages.length}</td>
                    <td>
                      <button className="btn btn-sm btn-primary me-2">
                        <Link to={'/chat'}>View</Link>
                      </button>
                      <button className="btn btn-sm btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enquiry;
