import React, { useEffect, useState } from 'react';
import { CCol, CFormInput, CFormLabel, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';
import { useParams } from 'react-router-dom';

const EditAdminCoupon = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'couponCode') setCouponCode(value);
        if (name === 'discount') setDiscount(value);
    };

    // Fetch admin coupon details
    const fetchCouponDetails = async () => {
        try {
            const { data } = await axios.get(`https://api.helpubuild.in/api/v1/admin_coupon/${id}`);
            setCouponCode(data.data.couponCode);
            setDiscount(data.data.discount);
        } catch (error) {
            console.error('Error fetching coupon details:', error);
            toast.error('Failed to fetch coupon details. Please try again later.');
        }
    };

    useEffect(() => {
        fetchCouponDetails();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!couponCode || !discount) {
            toast.error('Please enter both coupon code and discount.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put(`https://api.helpubuild.in/api/v1/update_admin_coupon/${id}`, {
                couponCode,
                discount
            });
            toast.success(res.data.message);
        } catch (error) {
            console.error('Error updating coupon:', error);
            toast.error('Failed to update coupon. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            heading="Edit Admin Coupon"
            btnText="Back"
            btnURL="/admin-coupon/all_admin_coupon"
            onSubmit={handleSubmit}
            formContent={
                <>
                    <CCol md={12}>
                        <CFormLabel htmlFor="couponCode">Coupon Code</CFormLabel>
                        <CFormInput
                            id="couponCode"
                            name="couponCode"
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={handleChange}
                        />
                    </CCol>
                    <CCol md={12} className="mt-3">
                        <CFormLabel htmlFor="discount">Discount</CFormLabel>
                        <CFormInput
                            id="discount"
                            name="discount"
                            type="number"
                            placeholder="Enter discount percentage"
                            value={discount}
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

export default EditAdminCoupon;
