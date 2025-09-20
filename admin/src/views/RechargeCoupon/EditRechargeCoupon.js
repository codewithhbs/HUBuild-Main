import React, { useEffect, useState } from 'react';
import { CCol, CFormInput, CFormLabel, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';
import { useParams } from 'react-router-dom';

const EditRechargeCoupon = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [couponData, setCouponData] = useState({
    couponCode: '',
    discount: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCouponData({
      ...couponData,
      [name]: name === 'discount' ? Number(value) : value
    });
  };

  const fetchCouponDetails = async () => {
    try {
      const { data } = await axios.get(`https://api.dessobuild.com/api/v1/recharge_coupon/${id}`);
      const { couponCode, discount } = data.data;
      setCouponData({ couponCode, discount });
    } catch (error) {
      console.error('Error fetching coupon details:', error);
      toast.error('Failed to fetch coupon details. Please try again later.');
    }
  };

  useEffect(() => {
    fetchCouponDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { couponCode, discount } = couponData;

    if (!couponCode || discount === '') {
      toast.error('Please enter both coupon code and discount.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(`https://api.dessobuild.com/api/v1/update_recharge_coupon/${id}`, {
        couponCode,
        discount
      });
      toast.success(res.data.message || 'Coupon updated successfully.');
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
      btnURL="/recharge_coupon/all_recharge_coupon"
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
              value={couponData.couponCode}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={12} className="mt-3">
            <CFormLabel htmlFor="discount">Discount (%)</CFormLabel>
            <CFormInput
              id="discount"
              name="discount"
              type="number"
              placeholder="Enter discount percentage"
              value={couponData.discount}
              onChange={handleChange}
              min="0"
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

export default EditRechargeCoupon;
