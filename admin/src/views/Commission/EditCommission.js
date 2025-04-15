import React, { useEffect, useState } from 'react';
import { CCol, CFormInput, CFormLabel, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';
import { useParams } from 'react-router-dom';

const EditCommission = () => {
    // const { id } = useParams();
    const id = '675a98006fcbd3c680f2653b'
    const [loading, setLoading] = useState(false);
    const [commissionPercent, setCommissionPercent] = useState('');

    // Fetch commission details
    const fetchCommissionDetails = async () => {
        try {
            const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/get-single-commision/${id}`);
            setCommissionPercent(data.data.commissionPercent);
        } catch (error) {
            console.error('Error fetching commission details:', error);
            toast.error('Failed to fetch commission details. Please try again later.');
        }
    };

    useEffect(() => {
        fetchCommissionDetails();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!commissionPercent) {
            toast.error('Please enter commission percentage.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put(`https://api.helpubuild.co.in/api/v1/update-commission/${id}`, {
                commissionPercent
            });
            toast.success(res.data.message || 'Commission updated successfully');
        } catch (error) {
            console.error('Error updating commission:', error);
            toast.error(error?.response?.data?.message || 'Failed to update commission.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            heading="Edit Admin Commission"
            btnText="Back"
            btnURL="/admin-commission/all_commissions"
            onSubmit={handleSubmit}
            formContent={
                <>
                    <CCol md={12}>
                        <CFormLabel htmlFor="commissionPercent">Commission Percentage (%)</CFormLabel>
                        <CFormInput
                            id="commissionPercent"
                            name="commissionPercent"
                            type="number"
                            placeholder="Enter commission percentage"
                            value={commissionPercent}
                            onChange={(e) => setCommissionPercent(e.target.value)}
                        />
                    </CCol>
                    <CCol xs={12} className="mt-4">
                        <CButton color="primary" type="submit" disabled={loading}>
                            {loading ? 'Please Wait...' : 'Update'}
                        </CButton>
                    </CCol>
                </>
            }
        />
    );
};

export default EditCommission;
