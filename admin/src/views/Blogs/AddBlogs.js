import React, { useMemo, useRef } from 'react';
import { CCol, CFormInput, CFormLabel, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import JoditEditor from 'jodit-react';
import Form from '../../components/Form/Form';

function AddBlogs() {
    const editor = useRef(null);
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        title: '',
        content: '',
    });
    const [smallImage, setSmallImage] = React.useState(null);
    const [largeImage, setLargeImage] = React.useState(null);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    // Handle file selection
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (type === 'image') {
            setSmallImage(file);
        } else if (type === 'large') {
            setLargeImage(file);
        }
    };

    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.content || !smallImage || !largeImage) {
            toast.error('Please fill out all fields and upload both images.');
            return;
        }

        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('content', formData.content);
        payload.append('image', smallImage);
        payload.append('largeImage', largeImage);

        setLoading(true);
        try {
            const res = await axios.post('https://api.helpubuild.co.in/api/v1/create-blog', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(res.data.message);
            // Reset the form
            setFormData({
                title: '',
                content: '',
            });
            setSmallImage(null);
            setLargeImage(null);
        } catch (error) {
            console.error('Error submitting blog:', error);
            toast.error(
                error?.response?.data?.message || 'Failed to add the blog. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    const config = useMemo(
        () => ({
            readonly: false,
            placeholder: 'Start typing...',
            height: 400,
        }),
        []
    );

    return (
        <>
            <Form
                heading="Add Blog"
                btnText="Back"
                btnURL="/blogs/all_blogs"
                onSubmit={handleSubmit}
                formContent={
                    <>
                        <CCol md={6}>
                            <CFormLabel htmlFor="image">Upload Small Image</CFormLabel>
                            <CFormInput
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'image')}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel htmlFor="largeImage">Upload Large Image</CFormLabel>
                            <CFormInput
                                type="file"
                                id="largeImage"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'large')}
                            />
                        </CCol>

                        <CCol md={12}>
                            <CFormLabel htmlFor="title">Title</CFormLabel>
                            <CFormInput
                                id="title"
                                name="title"
                                placeholder="Enter blog title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </CCol>

                        <CCol md={12} className="mt-3">
                            <CFormLabel>Content</CFormLabel>
                            <JoditEditor
                                ref={editor}
                                value={formData.content}
                                config={config}
                                tabIndex={1}
                                onBlur={(newContent) =>
                                    setFormData((prevFormData) => ({ ...prevFormData, content: newContent }))
                                }
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
        </>
    );
}

export default AddBlogs;
