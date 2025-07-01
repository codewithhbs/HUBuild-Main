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
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilUser, cilMoney } from '@coreui/icons';
import axios from 'axios';
import toast from 'react-hot-toast';
import Form from '../../components/Form/Form';

const AddCustomChat = () => {
    const [allProviders, setAllProviders] = useState({
        architects: [],
        interiors: [],
        vastu: [],
    });
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        userId: "",
        providerIds: [],
        groupName: '',
        amount: '',
        service: '',
        time: '',
        razorpayOrderId: '',
        transactionId: '',
        PaymentStatus: 'pending'
    });
    const [loading, setLoading] = useState(false);
    const [selectedProviders, setSelectedProviders] = useState({
        architects: [],
        interiors: [],
        vastu: []
    });

    // Search and pagination states
    const [searchQueries, setSearchQueries] = useState({
        architects: '',
        interiors: '',
        vastu: ''
    });
    const [currentPages, setCurrentPages] = useState({
        architects: 1,
        interiors: 1,
        vastu: 1
    });
    const [itemsPerPage] = useState(5);

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

    const handleFetchUser = async () => {
        try {
            const { data } = await axios.get("https://testapi.helpubuild.in/api/v1/get-all-user");
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

    // Handle form field changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle user selection
    const handleUserChange = (e) => {
        handleInputChange('userId', e.target.value);
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

    // Search functionality
    const handleSearchChange = (category, value) => {
        setSearchQueries(prev => ({
            ...prev,
            [category]: value
        }));
        setCurrentPages(prev => ({
            ...prev,
            [category]: 1
        }));
    };

    // Filter providers based on search
    const getFilteredProviders = (category) => {
        const providers = allProviders[category];
        const searchQuery = searchQueries[category].toLowerCase();

        if (!searchQuery) return providers;

        return providers.filter(provider =>
            (provider.name && provider.name.toLowerCase().includes(searchQuery)) ||
            (provider.email && provider.email.toLowerCase().includes(searchQuery)) ||
            provider._id.toLowerCase().includes(searchQuery)
        );
    };

    // Pagination logic
    const getPaginatedProviders = (category) => {
        const filteredProviders = getFilteredProviders(category);
        const currentPage = currentPages[category];
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return {
            providers: filteredProviders.slice(startIndex, endIndex),
            totalPages: Math.ceil(filteredProviders.length / itemsPerPage),
            totalItems: filteredProviders.length
        };
    };

    // Handle page change
    const handlePageChange = (category, page) => {
        setCurrentPages(prev => ({
            ...prev,
            [category]: page
        }));
    };

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

        // Validate payment fields if payment status is paid
        if (formData.PaymentStatus === 'paid') {
            if (!formData.amount || !formData.service || !formData.time || !formData.razorpayOrderId || !formData.transactionId) {
                toast.error("Please fill all payment related fields when payment status is paid");
                return;
            }
        }

        setLoading(true);
        try {
            const res = await axios.post("https://testapi.helpubuild.in/api/v1/create_manual_chat_room", formData);
            toast.success("Chat room created successfully!");

            // Reset form
            setFormData({
                userId: "",
                providerIds: [],
                groupName: '',
                amount: '',
                service: '',
                time: '',
                razorpayOrderId: '',
                transactionId: '',
                PaymentStatus: 'pending'
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

    // Render provider table for a category
    const renderProviderTable = (category, providers) => {
        const { providers: paginatedProviders, totalPages, totalItems } = getPaginatedProviders(category);
        const currentPage = currentPages[category];

        return (
            <CCard className="mb-4">
                <CCardHeader>
                    <CRow className="align-items-center">
                        <CCol md={6}>
                            <h6 className="mb-0">
                                <CIcon icon={cilUser} className="me-2" />
                                {category.charAt(0).toUpperCase() + category.slice(0, -1)} Providers
                                <span className="badge bg-info ms-2">{totalItems}</span>
                            </h6>
                        </CCol>
                        <CCol md={6}>
                            <CInputGroup>
                                <CInputGroupText>
                                    <CIcon icon={cilSearch} />
                                </CInputGroupText>
                                <CFormInput
                                    placeholder={`Search ${category}...`}
                                    value={searchQueries[category]}
                                    onChange={(e) => handleSearchChange(category, e.target.value)}
                                />
                            </CInputGroup>
                        </CCol>
                    </CRow>
                </CCardHeader>
                <CCardBody>
                    {paginatedProviders.length === 0 ? (
                        <CAlert color="info">
                            {totalItems === 0
                                ? `No ${category} providers available`
                                : `No ${category} providers found matching your search`
                            }
                        </CAlert>
                    ) : (
                        <>
                            <CTable hover responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell style={{ width: '50px' }}>Select</CTableHeaderCell>
                                        <CTableHeaderCell>Name</CTableHeaderCell>
                                        <CTableHeaderCell>Email</CTableHeaderCell>
                                        <CTableHeaderCell>ID</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {paginatedProviders.map((provider) => (
                                        <CTableRow key={provider._id}>
                                            <CTableDataCell>
                                                <CFormCheck
                                                    id={`${category}-${provider._id}`}
                                                    checked={selectedProviders[category].includes(provider._id)}
                                                    onChange={() => handleProviderChange(category, provider._id)}
                                                />
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <strong>{provider.name || 'N/A'}</strong>
                                            </CTableDataCell>
                                            <CTableDataCell>{provider.email || 'N/A'}</CTableDataCell>
                                            <CTableDataCell>
                                                <code>{provider?.unique_id}</code>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>

                            {totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <span className="text-muted">
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                                    </span>
                                    <CPagination>
                                        <CPaginationItem
                                            disabled={currentPage === 1}
                                            onClick={() => handlePageChange(category, currentPage - 1)}
                                        >
                                            Previous
                                        </CPaginationItem>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <CPaginationItem
                                                key={index + 1}
                                                active={currentPage === index + 1}
                                                onClick={() => handlePageChange(category, index + 1)}
                                            >
                                                {index + 1}
                                            </CPaginationItem>
                                        ))}
                                        <CPaginationItem
                                            disabled={currentPage === totalPages}
                                            onClick={() => handlePageChange(category, currentPage + 1)}
                                        >
                                            Next
                                        </CPaginationItem>
                                    </CPagination>
                                </div>
                            )}
                        </>
                    )}
                </CCardBody>
            </CCard>
        );
    };

    return (
        <>
            <Form
                heading="Create Custom Chat Room"
                btnText="Back"
                btnURL="/project/all_project"
                onSubmit={handleSubmit}
                formContent={
                    <>
                        {/* Basic Information */}
                        <CCard className="mb-4">
                            <CCardHeader>
                                <h6 className="mb-0">Basic Information</h6>
                            </CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol md={6}>
                                        <CFormLabel className="form_label" htmlFor="groupName">
                                            Group Name *
                                        </CFormLabel>
                                        <CFormInput
                                            id="groupName"
                                            placeholder="Enter group name"
                                            value={formData.groupName}
                                            onChange={(e) => handleInputChange('groupName', e.target.value)}
                                            required
                                        />
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="userId">Select User *</CFormLabel>
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
                                </CRow>
                            </CCardBody>
                        </CCard>

                        {/* Payment Information */}
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

                        {/* Provider Selection */}
                        <CCol md={12}>
                            <CFormLabel>Select Providers *</CFormLabel>
                            <p className="text-muted mb-3">
                                You can select one or multiple providers from any category
                            </p>

                            {renderProviderTable('architects', allProviders.architects)}
                            {renderProviderTable('interiors', allProviders.interiors)}
                            {renderProviderTable('vastu', allProviders.vastu)}
                        </CCol>

                        {/* Selected Providers Summary */}
                        {formData.providerIds.length > 0 && (
                            <CCol md={12}>
                                <CAlert color="success">
                                    <strong>Selected Providers:</strong> {formData.providerIds.length} provider(s) selected
                                    <div className="mt-2">
                                        <small>
                                            Architects: {selectedProviders.architects.length} |
                                            Interiors: {selectedProviders.interiors.length} |
                                            Vastu: {selectedProviders.vastu.length}
                                        </small>
                                    </div>
                                </CAlert>
                            </CCol>
                        )}

                        {/* Submit Button */}
                        <CCol xs={12} className="mt-4">
                            <CButton
                                color="primary"
                                type="submit"
                                size="lg"
                                disabled={loading || !formData.userId || formData.providerIds.length === 0}
                                className="px-4"
                            >
                                {loading ? (
                                    <>
                                        <CSpinner size="sm" className="me-2" />
                                        Creating Chat Room...
                                    </>
                                ) : (
                                    'Create Chat Room'
                                )}
                            </CButton>
                        </CCol>
                    </>
                }
            />
        </>
    );
};

export default AddCustomChat;