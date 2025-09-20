import React, { useState } from 'react';
import { CCol, CFormInput, CFormLabel, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';

const AddMembership = () => {
    const [loading, setLoading] = useState(false);
    const [planPrice, setPlanPrice] = useState('');

    const handleChange = (e) => {
        const value = e.target.value;
        if (value >= 0 || value === '') {
            setPlanPrice(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!planPrice) {
            toast.error('Please enter a plan price.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('https://testapi.dessobuild.com/api/v1/create_membership', { planPrice });
            toast.success(res.data.message);
            setPlanPrice('');
        } catch (error) {
            console.error('Error adding membership:', error);
            toast.error(error?.response?.data?.message || 'Failed to add membership.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            heading="Add Membership"
            btnText="Back"
            btnURL="/membership/all_membership"
            onSubmit={handleSubmit}
            formContent={
                <CCol md={12}>
                    <CFormLabel htmlFor="planPrice">Plan Price</CFormLabel>
                    <CFormInput
                        type="number"
                        id="planPrice"
                        name="planPrice"
                        placeholder="Enter plan price"
                        value={planPrice}
                        onChange={handleChange}
                         min="0"
                    />
                    <CCol xs={12} className="mt-4">
                        <CButton color="primary" type="submit" disabled={loading}>
                            {loading ? 'Please Wait...' : 'Submit'}
                        </CButton>
                    </CCol>
                </CCol>
            }
        />
    );
};

export default AddMembership;
