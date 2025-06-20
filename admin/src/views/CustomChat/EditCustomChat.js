import React, { useEffect, useState } from 'react';
import { CCol, CFormLabel, CButton, CCard, CCardBody, CCardHeader, CAlert } from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';
import { useParams, useNavigate } from 'react-router-dom';

const EditCustomChat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [allProviders, setAllProviders] = useState({
        architects: [],
        interiors: [],
        vastu: [],
    });
    const [chatRoomData, setChatRoomData] = useState(null);
    const [formData, setFormData] = useState({
        chatRoomId: id,
        providerIds: [],
    });
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [selectedProviders, setSelectedProviders] = useState({
        architects: [],
        interiors: [],
        vastu: []
    });

    const handleFetchSingleCustomChat = async () => {
        try {
            const { data } = await axios.get(`https://api.helpubuild.in/api/v1/get-chat-by-id/${id}`);
            const chatData = data.data;
            setChatRoomData(chatData);
            
            // Set existing provider IDs in formData
            setFormData(prev => ({
                ...prev,
                providerIds: chatData.providerIds || []
            }));
            
            // Categorize existing providers for checkbox state
            categorizeExistingProviders(chatData.providerIds || []);
            
        } catch (error) {
            console.log("Internal server error", error);
            toast.error("Failed to fetch chat room data");
        } finally {
            setFetchingData(false);
        }
    };

    const categorizeExistingProviders = (existingProviderIds) => {
        // We need to wait for providers to be loaded first
        if (allProviders.architects.length === 0 && allProviders.interiors.length === 0 && allProviders.vastu.length === 0) {
            return;
        }

        const categorized = {
            architects: [],
            interiors: [],
            vastu: []
        };

        existingProviderIds.forEach(providerId => {
            if (allProviders.architects.some(p => p._id === providerId)) {
                categorized.architects.push(providerId);
            } else if (allProviders.interiors.some(p => p._id === providerId)) {
                categorized.interiors.push(providerId);
            } else if (allProviders.vastu.some(p => p._id === providerId)) {
                categorized.vastu.push(providerId);
            }
        });

        setSelectedProviders(categorized);
    };

    const handleFetchProvider = async () => {
        try {
            const { data } = await axios.get("https://api.helpubuild.in/api/v1/get-all-provider");
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

    useEffect(() => {
        handleFetchProvider();
        handleFetchSingleCustomChat();
    }, []);

    // Re-categorize existing providers when allProviders is loaded
    useEffect(() => {
        if (chatRoomData && chatRoomData.providerIds && allProviders.architects.length > 0) {
            categorizeExistingProviders(chatRoomData.providerIds);
        }
    }, [allProviders, chatRoomData]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.providerIds.length === 0) {
            toast.error("Please select at least one provider");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put("https://api.helpubuild.in/api/v1/update-chat-providers", {
                chatRoomId: id,
                providerIds: formData.providerIds
            });
            
            toast.success("Chat room providers updated successfully!");
            
            // Show what was added/removed
            const { addedProviders, removedProviders } = res.data.data;
            if (addedProviders.length > 0) {
                toast.success(`Added ${addedProviders.length} provider(s)`);
            }
            if (removedProviders.length > 0) {
                toast.success(`Removed ${removedProviders.length} provider(s)`);
            }
            
            // Refresh data
            handleFetchSingleCustomChat();
            
        } catch (error) {
            console.log("Internal server error", error);
            toast.error(error.response?.data?.message || "Failed to update chat room");
        } finally {
            setLoading(false);
        }
    };

    // Get provider name by ID
    const getProviderName = (providerId) => {
        const allProvidersFlat = [
            ...allProviders.architects,
            ...allProviders.interiors,
            ...allProviders.vastu
        ];
        const provider = allProvidersFlat.find(p => p._id === providerId);
        return provider ? (provider.name || provider.email || providerId) : providerId;
    };

    // Get user name
    const getUserName = () => {
        if (chatRoomData && chatRoomData.userId) {
            return chatRoomData.userId.name || chatRoomData.userId.email || chatRoomData.userId._id || 'Unknown User';
        }
        return 'Loading...';
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

    if (fetchingData) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!chatRoomData) {
        return (
            <CAlert color="danger">
                Chat room not found or failed to load.
                <CButton 
                    color="link" 
                    onClick={() => navigate('/project/all_project')}
                    className="p-0 ms-2"
                >
                    Go Back
                </CButton>
            </CAlert>
        );
    }

    return (
        <>
            <Form
                heading="Edit Custom Chat Room"
                btnText="Back"
                btnURL="/project/all_project"
                onSubmit={handleSubmit}
                formContent={
                    <>
                        {/* Display current chat room info */}
                        <CCol md={12}>
                            <CAlert color="info">
                                <h6 className="mb-2">Current Chat Room Details:</h6>
                                <p className="mb-1"><strong>User:</strong> {getUserName()}</p>
                                <p className="mb-1"><strong>Chat Room ID:</strong> {id}</p>
                                <p className="mb-0">
                                    <strong>Current Providers:</strong> {
                                        chatRoomData.providerIds?.length > 0 
                                            ? chatRoomData.providerIds.map(getProviderName).join(', ')
                                            : 'No providers assigned'
                                    }
                                </p>
                            </CAlert>
                        </CCol>

                        <CCol md={12} className="mt-4">
                            <CFormLabel>Update Providers</CFormLabel>
                            <p className="text-muted mb-3">
                                Select/deselect providers to add or remove them from this chat room
                            </p>
                            
                            {renderProviderCheckboxes('architects', allProviders.architects)}
                            {renderProviderCheckboxes('interiors', allProviders.interiors)}
                            {renderProviderCheckboxes('vastu', allProviders.vastu)}
                        </CCol>

                        {formData.providerIds.length > 0 && (
                            <CCol md={12}>
                                <div className="alert alert-success">
                                    <strong>Selected Providers:</strong> {formData.providerIds.length} provider(s) will be in this chat room
                                </div>
                            </CCol>
                        )}

                        <CCol xs={12} className="mt-4">
                            <CButton 
                                color="primary" 
                                type="submit" 
                                disabled={loading || formData.providerIds.length === 0}
                                className="me-2"
                            >
                                {loading ? 'Updating Chat Room...' : 'Update Providers'}
                            </CButton>
                            <CButton 
                                color="secondary" 
                                onClick={() => navigate('/project/all_project')}
                            >
                                Cancel
                            </CButton>
                        </CCol>
                    </>
                }
            />
        </>
    );
};

export default EditCustomChat;