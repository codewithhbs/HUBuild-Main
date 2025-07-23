import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GetData } from '../../../utils/sessionStoreage';
import Swal from 'sweetalert2';

function BankDetail() {
    const Data = GetData('user');
    const UserData = JSON.parse(Data);
    const UserId = UserData?._id;

    const [bankDetail, setBankDetail] = useState({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        panCardNumber: '',
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchBankDetails() {
            try {
                const response = await axios.get(`https://testapi.helpubuild.in/api/v1/get-single-provider/${UserId}`);
                if (response.data.success) {
                    setBankDetail((prev) => ({
                        ...prev,
                        ...response.data.data.bankDetail, // Merge existing fields
                    }));
                }
            } catch (error) {
                console.error('Error fetching bank details:', error);
            }
        }
        fetchBankDetails();
    }, [UserId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBankDetail({ ...bankDetail, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`https://testapi.helpubuild.in/api/v1/update-bank-detail/${UserId}`, bankDetail);
            if (response.data.success) {
                // toast.success('Bank details updated successfully');
                Swal.fire({
                    title: 'Profile Updated!',
                    text: 'Bank details updated successfully',
                    icon: 'success', // use lowercase
                    confirmButtonText: 'Okay'
                });
            }
        } catch (error) {
            console.error('Error updating bank details:', error);
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
        <div className="mt-5">
            <h2 className="text-center mb-4">Update Bank Details</h2>
            <form onSubmit={handleSubmit} className="p-4 border rounded">
                <div className="row">
                    {Object.keys(bankDetail).map((key) => (
                        <div className="mb-3 col-xl-6" key={key}>
                            <label className="form-label text-capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                            <input
                                type="text"
                                className="form-control"
                                name={key}
                                value={bankDetail[key] || ''} // Handle missing values
                                onChange={handleChange}
                                placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`}
                                required
                            />
                        </div>
                    ))}
                </div>
                <div className='submit-button-container'>
                <button type="submit" className="btn as_btn text-white" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Bank Details'}
                </button>
                </div>
            </form>
        </div>
    );
}

export default BankDetail;
