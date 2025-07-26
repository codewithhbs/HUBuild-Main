import React, { useState } from 'react';
import { CCol, CFormInput, CFormLabel, CButton, CFormCheck } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';

const AddRechargeCoupon = () => {
  const [loading, setLoading] = useState(false);
  const [couponData, setCouponData] = useState({
    couponCode: '',
    discount: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCouponData({
      ...couponData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!couponData.couponCode || !couponData.discount) {
      toast.error('Please enter both Coupon Code and Discount.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('https://api.helpubuild.in/api/v1/create_recharge_coupon', couponData);
      toast.success(res.data.message || 'Coupon added successfully');
      setCouponData({ couponCode: '', discount: '' });
    } catch (error) {
      console.error('Error adding coupon:', error);
      toast.error(error?.response?.data?.message || 'Failed to add coupon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      heading="Add Admin Coupon"
      btnText="Back"
      btnURL="/recharge_coupon/all_recharge_coupon"
      onSubmit={handleSubmit}
      formContent={
        <>
          <CCol md={12}>
            <CFormLabel htmlFor="couponCode">Coupon Code</CFormLabel>
            <CFormInput
              type="text"
              id="couponCode"
              name="couponCode"
              placeholder="Enter coupon code"
              value={couponData.couponCode}
              onChange={handleChange}
            />
          </CCol>

          <CCol md={12} className="mt-3">
            <CFormLabel htmlFor="discount">Discount (%)</CFormLabel>
            <CFormInput
              type="number"
              id="discount"
              name="discount"
              placeholder="Enter discount percentage"
              value={couponData.discount}
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

export default AddRechargeCoupon;
