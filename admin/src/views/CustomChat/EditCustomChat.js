import React, { useEffect, useState } from 'react';
import {
    CCol,
    CFormLabel,
    CFormSelect,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CFormInput,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CPagination,
    CPaginationItem,
    CInputGroup,
    CInputGroupText,
    CFormCheck,
    CRow,
    CAlert,
    CSpinner
} from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';
import { useParams, useNavigate } from 'react-router-dom';
import './EditCustomChat.css';
import { cilSearch, cilUser, cilMoney } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

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
        groupName: '',
        userId: '',
        amount: '',
        service: '',
        razorpayOrderId: '',
        transactionId: '',
        PaymentStatus: 'pending'
    });
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [selectedProviders, setSelectedProviders] = useState({
        architects: [],
        interiors: [],
        vastu: []
    });
    const [searchTerms, setSearchTerms] = useState({
        architects: '',
        interiors: '',
        vastu: ''
    });

    // Pagination states
    const [pagination, setPagination] = useState({
        architects: { currentPage: 1, itemsPerPage: 5 },
        interiors: { currentPage: 1, itemsPerPage: 5 },
        vastu: { currentPage: 1, itemsPerPage: 5 }
    });

    const handleFetchSingleCustomChat = async () => {
        try {
            const { data } = await axios.get(`https://testapi.helpubuild.in/api/v1/get-chat-by-id/${id}`);
            const chatData = data.data;
            setChatRoomData(chatData);

            // Handle both array of IDs and array of objects
            let providerIds = [];
            if (chatData.providerIds) {
                providerIds = chatData.providerIds.map(provider => {
                    return typeof provider === 'object' ? provider._id : provider;
                });
            }

            setFormData(prev => ({
                ...prev,
                providerIds: providerIds,
                groupName: chatData.groupName || '',
                userId: typeof chatData.userId === 'object' ? chatData.userId._id : chatData.userId,
                amount: chatData?.amount,
                service: chatData?.service,
                razorpayOrderId: chatData?.razorpayOrderId,
                transactionId: chatData?.transactionId,
                PaymentStatus: chatData?.PaymentStatus
            }));

            // Categorize existing providers for checkbox state
            categorizeExistingProviders(providerIds);

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
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleFetchProvider = async () => {
        try {
            const { data } = await axios.get("https://testapi.helpubuild.in/api/v1/get-all-provider");
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
            const providerIds = chatRoomData.providerIds.map(provider => {
                return typeof provider === 'object' ? provider._id : provider;
            });
            categorizeExistingProviders(providerIds);
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

    // Handle search input change
    const handleSearchChange = (category, value) => {
        setSearchTerms(prev => ({
            ...prev,
            [category]: value
        }));
        // Reset pagination when searching
        setPagination(prev => ({
            ...prev,
            [category]: { ...prev[category], currentPage: 1 }
        }));
    };

    // Handle pagination change
    const handlePageChange = (category, newPage) => {
        setPagination(prev => ({
            ...prev,
            [category]: { ...prev[category], currentPage: newPage }
        }));
    };

    // Filter and sort providers (selected first)
    const filterAndSortProviders = (providers, searchTerm, selectedIds) => {
        let filtered = providers;

        if (searchTerm) {
            filtered = providers.filter(provider =>
                (provider.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (provider?.unique_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (provider.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (provider.mobileNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort: selected providers first, then unselected
        return filtered.sort((a, b) => {
            const aSelected = selectedIds.includes(a._id);
            const bSelected = selectedIds.includes(b._id);

            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
        });
    };

    // Get paginated providers
    const getPaginatedProviders = (category, providers) => {
        const { currentPage, itemsPerPage } = pagination[category];
        const selectedIds = selectedProviders[category];
        const searchTerm = searchTerms[category];

        const sortedProviders = filterAndSortProviders(providers, searchTerm, selectedIds);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return {
            providers: sortedProviders.slice(startIndex, endIndex),
            totalProviders: sortedProviders.length,
            totalPages: Math.ceil(sortedProviders.length / itemsPerPage)
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.providerIds.length === 0) {
            toast.error("Please select at least one provider");
            return;
        }

        setLoading(true);
        try {
            // Use the provided updateManualChatRoom endpoint
            const res = await axios.put(`https://testapi.helpubuild.in/api/v1/manual-chat-room/${id}`, {
                providerIds: formData.providerIds,
                groupName: formData.groupName,
                userId: formData.userId,
                amount: formData.amount,
                service: formData.service,
                razorpayOrderId: formData.razorpayOrderId,
                transactionId: formData.transactionId,
                PaymentStatus: formData.PaymentStatus
            });

            toast.success("Chat room updated successfully!");

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
    const getProviderName = (provider) => {
        if (typeof provider === 'object') {
            return provider.name || provider.email || provider._id || 'Unknown Provider';
        }

        const allProvidersFlat = [
            ...allProviders.architects,
            ...allProviders.interiors,
            ...allProviders.vastu
        ];
        const providerObj = allProvidersFlat.find(p => p._id === provider);
        return providerObj ? (providerObj.name || providerObj.email || providerObj._id) : provider;
    };

    // Get user name
    const getUserName = () => {
        if (chatRoomData && chatRoomData.userId) {
            return chatRoomData.userId.name || chatRoomData.userId.email || chatRoomData.userId._id || 'Unknown User';
        }
        return 'Loading...';
    };

    // Get current providers display
    const getCurrentProvidersDisplay = () => {
        if (!chatRoomData || !chatRoomData.providerIds || chatRoomData.providerIds.length === 0) {
            return 'No providers assigned';
        }

        return chatRoomData.providerIds.map(provider => getProviderName(provider)).join(', ');
    };

    // Render pagination controls
    const renderPagination = (category, totalPages, currentPage) => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        return (
            <div className="pagination-container">
                <nav aria-label="Provider pagination">
                    <ul className="pagination pagination-sm justify-content-center mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(category, currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                        </li>

                        {startPage > 1 && (
                            <>
                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(category, 1)}
                                    >
                                        1
                                    </button>
                                </li>
                                {startPage > 2 && (
                                    <li className="page-item disabled">
                                        <span className="page-link">...</span>
                                    </li>
                                )}
                            </>
                        )}

                        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(category, page)}
                                >
                                    {page}
                                </button>
                            </li>
                        ))}

                        {endPage < totalPages && (
                            <>
                                {endPage < totalPages - 1 && (
                                    <li className="page-item disabled">
                                        <span className="page-link">...</span>
                                    </li>
                                )}
                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(category, totalPages)}
                                    >
                                        {totalPages}
                                    </button>
                                </li>
                            </>
                        )}

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(category, currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    };

    // Render provider table for a category
    const renderProviderTable = (category, allProviders) => {
        const categoryDisplayNames = {
            architects: 'Architect',
            interiors: 'Interior Designer',
            vastu: 'Vastu Consultant'
        };

        const categoryIcons = {
            architects: 'fa-building',
            interiors: 'fa-palette',
            vastu: 'fa-compass'
        };

        const { providers, totalProviders, totalPages } = getPaginatedProviders(category, allProviders);
        const { currentPage } = pagination[category];

        return (
            <div className="provider-card">
                <div className="provider-card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold">
                            <i className={`fas ${categoryIcons[category]} me-2`}></i>
                            {categoryDisplayNames[category]} Providers
                        </h6>
                        <div className="d-flex align-items-center gap-3">
                            <span className="provider-badge">
                                {selectedProviders[category].length} / {allProviders.length} selected
                            </span>
                            <span className="text-light small">
                                Showing {providers.length} of {totalProviders}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="provider-card-body">
                    {/* Search Input */}
                    <div className="search-container">
                        <div className="position-relative">
                            <input
                                type="text"
                                className="search-input"
                                placeholder={`Search ${categoryDisplayNames[category]} providers...`}
                                value={searchTerms[category]}
                                onChange={(e) => handleSearchChange(category, e.target.value)}
                            />
                            <i className="fas fa-search search-icon"></i>
                        </div>
                    </div>

                    {allProviders.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-user-slash fa-3x mb-3"></i>
                            <p className="text-muted mb-0">No {categoryDisplayNames[category]} providers available</p>
                        </div>
                    ) : totalProviders === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-search fa-3x mb-3"></i>
                            <p className="text-muted mb-0">No providers found matching your search</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="provider-table">
                                    <thead>
                                        <tr>
                                            <th className="select-column">Select</th>
                                            <th>Name</th>
                                            <th>Id</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Location</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {providers.map((provider, index) => {
                                            const isSelected = selectedProviders[category].includes(provider._id);
                                            return (
                                                <tr
                                                    key={provider._id}
                                                    className={`provider-row ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleProviderChange(category, provider._id)}
                                                >
                                                    <td className="select-column">
                                                        <div className="form-check">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id={`${category}-${provider._id}`}
                                                                checked={isSelected}
                                                                onChange={() => handleProviderChange(category, provider._id)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="provider-info">
                                                            <div className="provider-avatar">
                                                                {(provider.name || 'U').charAt(0).toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <div className="provider-name">
                                                                    {provider.name || 'Unknown Name'}
                                                                    {isSelected && <i className="fas fa-check-circle selected-icon ms-2"></i>}
                                                                </div>
                                                                <small className="provider-type">
                                                                    {categoryDisplayNames[category]}
                                                                </small>
                                                            </div>

                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p className="rovider-name">
                                                            {(provider.unique_id || 'U')}
                                                        </p>
                                                    </td>
                                                    <td>
                                                        <span className="provider-detail">
                                                            {provider.email || 'No email'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {provider.mobileNumber ? (
                                                            <span className="provider-detail">
                                                                <i className="fas fa-phone me-1"></i>
                                                                {provider.mobileNumber}
                                                            </span>
                                                        ) : (
                                                            <span className="provider-detail">No phone</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {provider.location ? (
                                                            <span className="provider-detail">
                                                                <i className="fas fa-map-marker-alt me-1"></i>
                                                                {provider.location}
                                                            </span>
                                                        ) : (
                                                            <span className="provider-detail">No location</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {renderPagination(category, totalPages, currentPage)}
                        </>
                    )}
                </div>
            </div>
        );
    };

    if (fetchingData) {
        return (
            <div className="loading-container">
                <div className="text-center">
                    <div className="spinner-border mb-3 loading-spinner" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading chat room data...</p>
                </div>
            </div>
        );
    }

    if (!chatRoomData) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="alert alert-danger text-center">
                            <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                            <h5>Chat room not found or failed to load.</h5>
                            <button
                                className="btn btn-primary mt-3"
                                onClick={() => navigate('/project/all_project')}
                            >
                                <i className="fas fa-arrow-left me-2"></i>
                                Go Back to Projects
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-chat-container">
            <Form
                heading="Edit Custom Chat Room"
                btnText="Back to Projects"
                btnURL="/project/all_project"
                onSubmit={handleSubmit}
                formContent={
                    <>
                        {/* Display current chat room info */}
                        <CCol md={12}>
                            <div className="info-card">
                                <div className="info-card-header">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-info-circle me-2"></i>
                                        Current Chat Room Details
                                    </h6>
                                </div>
                                <div className="info-card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <i className="fas fa-user info-icon"></i>
                                                <div>
                                                    <small className="info-label">User</small>
                                                    <span className="info-value">
                                                        {getUserName()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <i className="fas fa-id-card info-icon"></i>
                                                <div>
                                                    <small className="info-label">Chat Room ID</small>
                                                    <span className="info-value font-monospace">
                                                        {id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <i className="fas fa-users info-icon"></i>
                                                <div>
                                                    <small className="info-label">Group Name</small>
                                                    <CFormInput
                                                        type="text"
                                                        value={formData.groupName}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            groupName: e.target.value
                                                        }))}
                                                        placeholder="Enter group name"
                                                        className="group-name-input"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <i className="fas fa-credit-card info-icon"></i>
                                                <div>
                                                    <small className="info-label">Payment Status</small>
                                                    <span
                                                        className={`badge payment-badge ${chatRoomData.PaymentStatus === 'paid' ? 'bg-success' :
                                                            chatRoomData.PaymentStatus === 'pending' ? 'bg-warning' : 'bg-secondary'
                                                            }`}
                                                    >
                                                        {chatRoomData.PaymentStatus || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="info-item">
                                                <i className="fas fa-user-tie info-icon"></i>
                                                <div className="flex-grow-1">
                                                    <small className="info-label">Current Providers</small>
                                                    <span className="info-value">
                                                        {getCurrentProvidersDisplay()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CCol>
                        <CCard className="mb-4">
                            <CCardHeader>
                                <h6 className="mb-0">
                                    <CIcon icon={cilMoney} className="me-2" />
                                    Payment Information
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="paymentStatus">Payment Status</CFormLabel>
                                        <CFormSelect
                                            id="paymentStatus"
                                            value={formData.PaymentStatus}
                                            onChange={(e) => handleInputChange('PaymentStatus', e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="failed">Failed</option>
                                        </CFormSelect>
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="service">Service</CFormLabel>
                                        <CFormInput
                                            id="service"
                                            placeholder="Enter service type"
                                            value={formData.service}
                                            onChange={(e) => handleInputChange('service', e.target.value)}
                                            required={formData.PaymentStatus === 'paid'}
                                        />
                                    </CCol>
                                </CRow>

                                {formData.PaymentStatus === 'paid' && (
                                    <>
                                        <CRow className="mt-3">
                                            <CCol md={12}>
                                                <CFormLabel htmlFor="amount">Amount *</CFormLabel>
                                                <CFormInput
                                                    id="amount"
                                                    type="number"
                                                    placeholder="Enter amount"
                                                    value={formData.amount}
                                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                                    required
                                                />
                                            </CCol>

                                        </CRow>
                                        <CRow className="mt-3">
                                            <CCol md={6}>
                                                <CFormLabel htmlFor="razorpayOrderId">Razorpay Order ID *</CFormLabel>
                                                <CFormInput
                                                    id="razorpayOrderId"
                                                    placeholder="Enter Razorpay order ID"
                                                    value={formData.razorpayOrderId}
                                                    onChange={(e) => handleInputChange('razorpayOrderId', e.target.value)}
                                                    required
                                                />
                                            </CCol>
                                            <CCol md={6}>
                                                <CFormLabel htmlFor="transactionId">Transaction ID *</CFormLabel>
                                                <CFormInput
                                                    id="transactionId"
                                                    placeholder="Enter transaction ID"
                                                    value={formData.transactionId}
                                                    onChange={(e) => handleInputChange('transactionId', e.target.value)}
                                                    required
                                                />
                                            </CCol>
                                        </CRow>
                                    </>
                                )}
                            </CCardBody>
                        </CCard>

                        <CCol md={12}>
                            <div className="section-header">
                                <h5 className="section-title">
                                    <i className="fas fa-users me-2"></i>
                                    Update Providers
                                </h5>
                                <p className="section-description">
                                    Select or deselect providers to add or remove them from this chat room.
                                    Selected providers appear first in each category.
                                </p>
                            </div>

                            {renderProviderTable('architects', allProviders.architects)}
                            {renderProviderTable('interiors', allProviders.interiors)}
                            {renderProviderTable('vastu', allProviders.vastu)}
                        </CCol>

                        {formData.providerIds.length > 0 && (
                            <CCol md={12}>
                                <div className="selection-summary">
                                    <i className="fas fa-check-circle me-2"></i>
                                    <strong>Selected Providers:</strong>&nbsp;
                                    {formData.providerIds.length} provider(s) will be in this chat room
                                </div>
                            </CCol>
                        )}

                        <CCol xs={12} className="mt-4">
                            <div className="action-buttons">
                                <button
                                    type="submit"
                                    disabled={loading || formData.providerIds.length === 0}
                                    className="btn-primary-custom"
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                            Updating Chat Room...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            Update Chat Room
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary-custom"
                                    onClick={() => navigate('/project/all_project')}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Cancel
                                </button>
                            </div>
                        </CCol>
                    </>
                }
            />
        </div>
    );
};

export default EditCustomChat;
