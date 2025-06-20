import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { CCol, CFormLabel, CButton } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';
import JoditEditor from 'jodit-react';
import './term.css';

const EditTerm = () => {
    const id = '67f8bb6f160226ea5b6a957f';
    const editor = useRef(null);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');

    // Editor configuration
    const editorConfig = useMemo(() => ({
        readonly: false,
        height: 400,
    }), []);

    // Fetch Term & Condition data
    const fetchTerm = async () => {
        try {
            const { data } = await axios.get(`https://api.helpubuild.in/api/v1/single_term/${id}`);
            setText(data.data.text || '');
        } catch (error) {
            console.error('Error fetching term:', error);
            toast.error('Failed to fetch term. Please try again later.');
        }
    };

    useEffect(() => {
        fetchTerm();
    }, []);

    // Handle editor change
    const handleEditorChange = useCallback((newContent) => {
        setText(newContent);
    }, []);

    // Submit updated data
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text.trim()) {
            toast.error('Please enter the Terms & Conditions.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put(`https://api.helpubuild.in/api/v1/update_term/${id}`, { text });
            toast.success(res.data.message);
        } catch (error) {
            console.error('Error updating term:', error);
            toast.error('Failed to update term. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Form
                heading="Edit Terms & Conditions"
                btnText="Back"
                btnURL="/membership/all_membership"
                onSubmit={handleSubmit}
                formContent={
                    <>
                        <CCol md={12}>
                            <CFormLabel htmlFor="termText">Terms & Conditions</CFormLabel>
                            <JoditEditor
                                ref={editor}
                                value={text}
                                config={editorConfig}
                                onBlur={handleEditorChange}
                                className="dark-editor"
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
        </>
    );
};

export default EditTerm;
