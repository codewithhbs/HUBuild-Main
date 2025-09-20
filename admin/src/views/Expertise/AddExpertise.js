import React, { useState } from 'react';
import { CCol, CFormInput, CFormLabel, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';

const AddExpertise = () => {
  const [loading, setLoading] = useState(false);
  const [expertiseData, setExpertiseData] = useState({
    expertise: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpertiseData({ ...expertiseData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!expertiseData.expertise) {
      toast.error('Please enter expertise.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('https://api.dessobuild.com/api/v1/create_expertise', expertiseData);
      toast.success(res.data.message);
      setExpertiseData({ expertise: '' });
    } catch (error) {
      console.error('Error adding expertise:', error);
      toast.error(error?.response?.data?.message || 'Failed to add expertise.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      heading="Add Expertise"
      btnText="Back"
      btnURL="/expertise/all_expertise"
      onSubmit={handleSubmit}
      formContent={
        <>
          <CCol md={12}>
            <CFormLabel htmlFor="expertise">Expertise</CFormLabel>
            <CFormInput
              type="text"
              id="expertise"
              name="expertise"
              placeholder="Enter expertise"
              value={expertiseData.expertise}
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

export default AddExpertise;
