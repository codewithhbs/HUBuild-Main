import React from 'react';
import Form from '../../components/Form/Form';
import { CCol, CFormInput, CFormLabel, CFormSelect, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AddWorkDescriptionImage() {
    const [loading, setLoading] = React.useState(false);
    const [bannerFile, setBannerFile] = React.useState(null);
    const [formData, setFormData] = React.useState({
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setBannerFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bannerFile) {
            // toast.error('Please fill out all required fields and upload a banner.');
            toast.error('Please fill out all required fields and upload a image.');
            return;
        }

        const payload = new FormData();
        payload.append('image', bannerFile);

        setLoading(true);
        try {
            const res = await axios.post('https://api.helpubuild.co.in/api/v1/create-describe-work-image', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Image added successfully!');
        } catch (error) {
            console.log('Error submitting image:', error);
            toast.error(
                error?.response?.data?.errors?.[0] ||
                error?.response?.data?.message ||
                'Failed to add the image. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Form
                heading="Add Work Description Images"
                btnText="Back"
                btnURL="/work_description_image/all_work_description_image"
                onSubmit={handleSubmit}
                formContent={
                    <>
                        <CCol md={6} lg={6} xl={6} sm={12}>
                            <CFormLabel className="form_label" htmlFor="image">
                                Upload Image
                            </CFormLabel>
                            <CFormInput
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </CCol>

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

export default AddWorkDescriptionImage
