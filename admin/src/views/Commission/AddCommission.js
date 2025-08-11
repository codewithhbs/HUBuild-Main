import React, { useState } from 'react';
import { CCol, CFormInput, CFormLabel, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';

const AddCommission = () => {
    const [loading, setLoading] = useState(false);
    const [commissionPercent, setCommissionPercent] = useState('');

    const handleChange = (e) => {
        setCommissionPercent(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!commissionPercent) {
            toast.error('Please enter commission percentage.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('https://api.dessobuild.com/api/v1/create-commission', {
                commissionPercent,
            });
            toast.success(res.data.message || 'Commission added successfully');
            setCommissionPercent('');
        } catch (error) {
            console.error('Error adding commission:', error);
            toast.error(error?.response?.data?.message || 'Failed to add commission.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            heading="Add Admin Commission"
            btnText="Back"
            btnURL="/admin-commission/all_commissions"
            onSubmit={handleSubmit}
            formContent={
                <>
                    <CCol md={12}>
                        <CFormLabel htmlFor="commissionPercent">Commission Percentage (%)</CFormLabel>
                        <CFormInput
                            type="number"
                            id="commissionPercent"
                            name="commissionPercent"
                            placeholder="Enter commission percentage"
                            value={commissionPercent}
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol xs={12} className="mt-4">
                        <CButton color="primary" type="submit" disabled={loading}>
                            {loading ? 'Please Wait...' : 'Submit'}
                        </CButton>
                    </CCol>
                </>
            }
        />
    );
};

export default AddCommission;
