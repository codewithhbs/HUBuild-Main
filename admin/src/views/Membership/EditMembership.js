import React, { useEffect, useState } from 'react';
import { CCol, CFormInput, CFormLabel, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';
import { useParams } from 'react-router-dom';

const EditMembership = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [planPrice, setPlanPrice] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        const value = e.target.value;
        if (value >= 0 || value === '') {
            setPlanPrice(value);
        }
    };

    // Fetch membership details
    const fetchMembership = async () => {
        try {
            const { data } = await axios.get(`https://testapi.dessobuild.com/api/v1/get_single_membership/${id}`);
            setPlanPrice(data.data.planPrice);
        } catch (error) {
            console.error('Error fetching membership:', error);
            toast.error('Failed to fetch membership details. Please try again later.');
        }
    };

    useEffect(() => {
        fetchMembership();
    }, []);

    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!planPrice) {
            toast.error('Please enter a plan price.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put(`https://testapi.dessobuild.com/api/v1/update_membership/${id}`, { planPrice });
            toast.success(res.data.message);
        } catch (error) {
            console.error('Error updating membership:', error);
            toast.error('Failed to update the membership. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Form
                heading="Edit Membership"
                btnText="Back"
                btnURL="/membership/all_membership"
                onSubmit={handleSubmit}
                formContent={
                    <>
                        {/* Plan Price Input */}
                        <CCol md={12}>
                            <CFormLabel htmlFor="planPrice">Plan Price</CFormLabel>
                            <CFormInput
                                id="planPrice"
                                name="planPrice"
                                type="number"
                                placeholder="Enter plan price"
                                value={planPrice}
                                onChange={handleChange}
                                min="0"
                            />
                        </CCol>

                        {/* Submit Button */}
                        <CCol xs={12} className="mt-4">
                            <CButton color="primary" type="submit" disabled={loading}>
                                {loading ? 'Please Wait...' : 'Update'}
                            </CButton>
                        </CCol>
                    </>
                }
            />
        </>
    );
};

export default EditMembership;
