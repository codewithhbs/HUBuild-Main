import React, { useEffect, useState } from 'react';
import { CCol, CFormInput, CFormLabel, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';

const EditGlobelDisPer = () => {
    const id = '68637e52a2c584e1cba74f8a';
    const [loading, setLoading] = useState(false);
    const [discountPercent, setDiscountPercent] = useState('');

    // Handle input change
    const handleChange = (e) => {
        setDiscountPercent(e.target.value);
    };

    // Fetch global discount details
    const fetchDiscountDetails = async () => {
        try {
            const { data } = await axios.get(`https://api.helpubuild.in/api/v1/globel_discount/${id}`);
            setDiscountPercent(data.data.discountPercent);
        } catch (error) {
            console.error('Error fetching discount details:', error);
            toast.error('Failed to fetch discount details. Please try again later.');
        }
    };

    useEffect(() => {
        fetchDiscountDetails();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!discountPercent) {
            toast.error('Please enter a discount percentage.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put(`https://api.helpubuild.in/api/v1/update_globel_discount/${id}`, {
                discountPercent
            });
            toast.success(res.data.message);
        } catch (error) {
            console.error('Error updating discount:', error);
            toast.error('Failed to update discount. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            heading="Edit Global Discount"
            btnText=""
            btnURL=""
            onSubmit={handleSubmit}
            formContent={
                <>
                    <CCol md={12}>
                        <CFormLabel htmlFor="discountPercent">Discount Percentage</CFormLabel>
                        <CFormInput
                            id="discountPercent"
                            name="discountPercent"
                            type="number"
                            placeholder="Enter discount percentage"
                            value={discountPercent}
                            onChange={handleChange}
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

export default EditGlobelDisPer;
