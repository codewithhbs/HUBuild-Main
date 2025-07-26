import React, { useEffect, useState } from 'react';
import { CCol, CFormInput, CFormLabel, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';
import { useParams } from 'react-router-dom';

const EditExpertise = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [expertise, setExpertise] = useState('');

  // Handle input change
  const handleChange = (e) => {
    setExpertise(e.target.value);
  };

  // Fetch expertise details
  const fetchExpertiseDetails = async () => {
    try {
      const { data } = await axios.get(`https://www.testapi.helpubuild.in/api/v1/single_expertise/${id}`);
      setExpertise(data.data.expertise);
    } catch (error) {
      console.error('Error fetching expertise details:', error);
      toast.error('Failed to fetch expertise details. Please try again later.');
    }
  };

  useEffect(() => {
    fetchExpertiseDetails();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!expertise) {
      toast.error('Please enter an expertise.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(`https://www.testapi.helpubuild.in/api/v1/update_expertise/${id}`, { expertise });
      toast.success(res.data.message);
    } catch (error) {
      console.error('Error updating expertise:', error);
      toast.error('Failed to update expertise. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      heading="Edit Expertise"
      btnText="Back"
      btnURL="/expertise/all_expertise"
      onSubmit={handleSubmit}
      formContent={
        <>
          <CCol md={12}>
            <CFormLabel htmlFor="expertise">Expertise</CFormLabel>
            <CFormInput
              id="expertise"
              name="expertise"
              type="text"
              placeholder="Enter expertise"
              value={expertise}
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

export default EditExpertise;
