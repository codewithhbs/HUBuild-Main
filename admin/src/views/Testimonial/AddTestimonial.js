import React from 'react';
import Form from '../../components/Form/Form';
import { CCol, CFormInput, CFormLabel, CFormSelect, CButton, CFormTextarea } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AddTestimonial() {
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        destination: '',
        testimonial: '',
    });
    const [bannerFile, setBannerFile] = React.useState(null);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setBannerFile(file);
    };

    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !bannerFile || !formData.testimonial || !formData.destination) {
            toast.error('Please fill out all required fields and upload a banner.');
            return;
        }

        const payload = new FormData();
        payload.append('name', formData.name);
        payload.append('destination', formData.destination);
        payload.append('testimonial', formData.testimonial);
        payload.append('image', bannerFile);

        setLoading(true);
        try {
            const res = await axios.post('https://api.helpubuild.co.in/api/v1/create-testimonial', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(res.data.message);
            // Redirect or reset form here
            setFormData({
                name: '',
                destination: '',
                testimonial: '',
            });
            // setBannerFile(null);
        } catch (error) {
            console.log('Error submitting banner:', error);
            toast.error(
                error?.response?.data?.errors?.[0] ||
                error?.response?.data?.message ||
                'Failed to add the Testimonial. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Form
                heading="Add Testimonial"
                btnText="Back"
                btnURL="/testimonial/all_testimonial"
                onSubmit={handleSubmit}
                formContent={
                    <>
                        <CCol md={6} lg={6} xl={6} sm={12}>
                            <CFormLabel className="form_label" htmlFor="name">
                                User Name
                            </CFormLabel>
                            <CCol xs>
                                <CFormInput placeholder="" name='name' value={formData.name} onChange={handleChange} aria-label="Name" />
                            </CCol>
                        </CCol>

                        <CCol md={6} lg={6} xl={6} sm={12}>
                            <CFormLabel className="form_label" htmlFor="destination">
                                Destination
                            </CFormLabel>
                            <CCol xs>
                                <CFormInput placeholder="" name='destination' value={formData.destination} onChange={handleChange} aria-label="Destination" />
                            </CCol>
                        </CCol>

                        <CCol md={12} lg={12} xl={12} sm={12}>
                            <CFormLabel className="form_label" htmlFor="image">
                                Upload Profile Image
                            </CFormLabel>
                            <CFormInput
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </CCol>

                        <CCol md={12} lg={12} xl={12} sm={12}>
                            <CFormLabel className="form_label" htmlFor="testimonial">Testimonial</CFormLabel>
                            <CFormTextarea
                                placeholder=""
                                name='testimonial'
                                value={formData.testimonial}
                                onChange={handleChange}
                                style={{height:'150px'}}
                            />
                        </CCol>

                        {/* Submit Button */}
                        <CCol xs={12} className="mt-3">
                            <CButton color="primary" type="submit" disabled={loading}>
                                {loading ? 'Please Wait...' : 'Submit'}
                            </CButton>
                        </CCol>
                    </>
                }
            />
        </>
    );
}

export default AddTestimonial
