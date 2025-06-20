import React, { useEffect, useState } from 'react';
import { CCol, CFormLabel, CFormSelect, CButton, CCard, CCardBody, CCardHeader, CFormInput } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';

const AddCustomChat = () => {
    const [allProviders, setAllProviders] = useState({
        architects: [],
        interiors: [],
        vastu: [],
        groupName: ''
    });
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        userId: "",
        providerIds: [],
    });
    const [loading, setLoading] = useState(false);
    const [selectedProviders, setSelectedProviders] = useState({
        architects: [],
        interiors: [],
        vastu: []
    });

    const handleFetchProvider = async () => {
        try {
            const { data } = await axios.get("http://localhost:5000/api/v1/get-all-provider");
            const allData = data.data;
            const architects = allData.filter((item) => item.type === "Architect");
            const interiors = allData.filter((item) => item.type === "Interior");
            const vastu = allData.filter((item) => item.type === "Vastu");
            setAllProviders({ architects, interiors, vastu });
        } catch (error) {
            console.log("Internal server error", error);
            toast.error("Failed to fetch providers");
        }
    };

    const handleFetchUser = async () => {
        try {
            const { data } = await axios.get("http://localhost:5000/api/v1/get-all-user");
            const allData = data.data;
            setUsers(allData);
        } catch (error) {
            console.log("Internal server error", error);
            toast.error("Failed to fetch users");
        }
    };

    useEffect(() => {
        handleFetchProvider();
        handleFetchUser();
    }, []);

    // Handle user selection
    const handleUserChange = (e) => {
        setFormData(prev => ({
            ...prev,
            userId: e.target.value
        }));
    };

    // Handle provider selection for each category
    const handleProviderChange = (category, providerId) => {
        setSelectedProviders(prev => {
            const updatedCategory = prev[category].includes(providerId)
                ? prev[category].filter(id => id !== providerId)
                : [...prev[category], providerId];

            const newSelectedProviders = {
                ...prev,
                [category]: updatedCategory
            };

            // Update formData with all selected provider IDs
            const allSelectedIds = [
                ...newSelectedProviders.architects,
                ...newSelectedProviders.interiors,
                ...newSelectedProviders.vastu
            ];

            setFormData(prevFormData => ({
                ...prevFormData,
                providerIds: allSelectedIds
            }));

            return newSelectedProviders;
        });
    };

    const handlechange = (e) => {
        setFormData(prev => ({
            ...prev,
            groupName: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.userId) {
            toast.error("Please select a user");
            return;
        }

        if (formData.providerIds.length === 0) {
            toast.error("Please select at least one provider");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/v1/create_manual_chat_room", formData);
            toast.success("Chat room created successfully!");

            // Reset form
            setFormData({
                userId: "",
                providerIds: [],
                groupName: ''
            });
            setSelectedProviders({
                architects: [],
                interiors: [],
                vastu: []
            });
        } catch (error) {
            console.log("Internal server error", error);
            toast.error(error.response?.data?.message || "Failed to create chat room");
        } finally {
            setLoading(false);
        }
    };

    // Render provider checkboxes for a category
    const renderProviderCheckboxes = (category, providers) => (
        <CCard className="mb-3">
            <CCardHeader>
                <h6 className="mb-0">{category.charAt(0).toUpperCase() + category.slice(0, -1)} Providers</h6>
            </CCardHeader>
            <CCardBody>
                {providers.length === 0 ? (
                    <p className="text-muted">No {category} providers available</p>
                ) : (
                    <div className="row">
                        {providers.map((provider) => (
                            <div key={provider._id} className="col-md-6 mb-2">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`${category}-${provider._id}`}
                                        checked={selectedProviders[category].includes(provider._id)}
                                        onChange={() => handleProviderChange(category, provider._id)}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor={`${category}-${provider._id}`}
                                    >
                                        {provider.name || provider.email || provider._id}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CCardBody>
        </CCard>
    );

    return (
        <>
            <Form
                heading="Create Custom Chat Room"
                btnText="Back"
                btnURL="/project/all_project"
                onSubmit={handleSubmit}
                formContent={
                    <>
                        <CCol md={12} lg={12} xl={12} sm={12}>
                            <CFormLabel className="form_label" htmlFor="name">
                                Group Name
                            </CFormLabel>
                            <CCol xs>
                                <CFormInput placeholder="" name='name' value={formData.groupName} onChange={handlechange} aria-label="Name" />
                            </CCol>
                        </CCol>
                        <CCol md={12}>
                            <CFormLabel htmlFor="userId">Select User</CFormLabel>
                            <CFormSelect
                                id="userId"
                                value={formData.userId}
                                onChange={handleUserChange}
                                required
                            >
                                <option value="">Choose a user...</option>
                                {users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name || user.email || user._id}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>

                        <CCol md={12} className="mt-4">
                            <CFormLabel>Select Providers</CFormLabel>
                            <p className="text-muted mb-3">
                                You can select one or multiple providers from any category
                            </p>

                            {renderProviderCheckboxes('architects', allProviders.architects)}
                            {renderProviderCheckboxes('interiors', allProviders.interiors)}
                            {renderProviderCheckboxes('vastu', allProviders.vastu)}
                        </CCol>

                        {formData.providerIds.length > 0 && (
                            <CCol md={12}>
                                <div className="alert alert-info">
                                    <strong>Selected Providers:</strong> {formData.providerIds.length} provider(s) selected
                                </div>
                            </CCol>
                        )}

                        <CCol xs={12} className="mt-4">
                            <CButton
                                color="primary"
                                type="submit"
                                disabled={loading || !formData.userId || formData.providerIds.length === 0}
                            >
                                {loading ? 'Creating Chat Room...' : 'Create Chat Room'}
                            </CButton>
                        </CCol>
                    </>
                }
            />
        </>
    );
};

export default AddCustomChat;