import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
    CPagination,
    CPaginationItem,
    CFormSwitch,
    CButton,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormSelect,
    CFormInput
} from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function AllProvider() {
    const navigate = useNavigate();
    const [providers, setProviders] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedTransition, setSelectedTransition] = React.useState([]);
    const [verificationModal, setVerificationModal] = React.useState(false);
    const [selectedProvider, setSelectedProvider] = React.useState(null);
    const [accountVerified, setAccountVerified] = React.useState('Pending');
    const [verificationRejectReason, setVerificationRejectReason] = React.useState('');
    const [filters, setFilters] = React.useState({
        search: '',
        type: '',
        accountVerified: '',
        isBanned: '',
    });
    const itemsPerPage = 10;

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('https://api.helpubuild.in/api/v1/get-all-provider');
            setProviders(data.data.reverse() || []);
        } catch (error) {
            console.error('Error fetching provider:', error);
            toast.error(
                error?.response?.data?.message || 'Failed to fetch provider. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    const updateIsBanned = async (id, currentStatus) => {
        setLoading(true);
        try {
            const updatedStatus = !currentStatus;
            const res = await axios.put(
                `https://api.helpubuild.in/api/v1/update-provider-isbanned/${id}`,
                { isBanned: updatedStatus }
            );
            fetchProviders();
            toast.success(res?.data?.message || 'Provider status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(
                error?.response?.data?.message || 'Failed to update the status. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const openChatTransitionModal = (transitions) => {
        setSelectedTransition(transitions);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://api.helpubuild.in/api/v1/delete-consultant-permanent/${id}`);
            fetchProviders();
            toast.success('Provider deleted successfully!');
        } catch (error) {
            console.error('Error deleting provider:', error);
            toast.error('Failed to delete the provider. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e) => {
        const { value } = e.target;
        const providerId = e.target.getAttribute("data-id");

        if (!providerId || providerId === "null" || providerId.length !== 24) {
            toast.error("Invalid Provider ID. Please refresh and try again.");
            return;
        }

        setAccountVerified(value);
        setSelectedProvider(providerId);

        if (value === 'Rejected') {
            setVerificationRejectReason('');
            setVerificationModal(true);
        } else {
            setVerificationRejectReason('');
            handleAccountVerification(value, providerId);
        }
    };

    const handleAccountVerification = async (status, providerId = selectedProvider) => {
        if (!providerId || providerId === "null" || providerId.length !== 24) {
            toast.error("Invalid Provider ID. Please refresh and try again.");
            return;
        }

        if (status === 'Rejected' && !verificationRejectReason) {
            toast.error('Please provide a rejection reason.');
            return;
        }

        try {
            const res = await axios.put(
                `https://api.helpubuild.in/api/v1/provider_verify/${providerId}`,
                { accountVerified: status, verificationRejectReason }
            );

            toast.success(res?.data?.message || 'Account verification updated successfully.');
            setVerificationRejectReason('');
            setSelectedProvider(null);
            fetchProviders();
            setVerificationModal(false);
        } catch (error) {
            console.error("Internal server error", error);
            toast.error(error?.response?.data?.message || 'Error verifying account.');
        }
    };

    const confirmDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                handleDelete(id);
            }
        });
    };

    const handleHelpuBuildVerify = async (id, currentStatus) => {
        try {
            const updatedStatus = !currentStatus;
            const res = await axios.put(
                `https://api.helpubuild.in/api/v1/verified-provider/${id}`,
                { isHelpuBuildVerified: updatedStatus }
            );
            toast.success(res?.data?.message || "Status updated successfully!");
            fetchProviders(); // Refresh the list
        } catch (error) {
            console.log("Internal server error", error);
            toast.error(error.response.data.message || "Failed to update verification status.");
        }
    };


    React.useEffect(() => {
        fetchProviders();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const filteredData = providers.filter((item) => {
        const searchMatch = filters.search
            ? item.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.mobileNumber?.includes(filters.search)
            : true;

        const typeMatch = filters.type ? item.type === filters.type : true;
        const verifiedMatch = filters.accountVerified ? item.accountVerified === filters.accountVerified : true;
        const isBannedMatch = filters.isBanned !== ''
            ? String(item.isBanned) === filters.isBanned
            : true;

        return searchMatch && typeMatch && verifiedMatch && isBannedMatch;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const viewProviderDetails = (provider) => {
        navigate(`/provider/${provider._id}`, { state: { provider } });
    };

    const heading = [
        'S.No',
        'Unique ID',
        'Name',
        'Email',
        'Phone Number',
        'Type',
        'Wallet Amount',
        'Portfolio',
        'NDA',
        'Term',
        'Is Blocked',
        'Profile Approve',
        'Architect Verified',
        'Chat Transition',
        'Action',
    ];

    return (
        <>
            {/* Filters */}
            <div className="mb-4 d-flex flex-wrap gap-2">
                <CFormInput
                    type="text"
                    placeholder="Search by name/email/phone"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                />
                <CFormSelect name="type" value={filters.type} onChange={handleFilterChange}>
                    <option value="">All Types</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Service Provider">Service Provider</option>
                </CFormSelect>
                <CFormSelect name="accountVerified" value={filters.accountVerified} onChange={handleFilterChange}>
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                </CFormSelect>
                <CFormSelect name="isBanned" value={filters.isBanned} onChange={handleFilterChange}>
                    <option value="">All Block Status</option>
                    <option value="true">Blocked</option>
                    <option value="false">Unblocked</option>
                </CFormSelect>
                <CButton color="secondary" onClick={() => setFilters({ search: '', type: '', accountVerified: '', isBanned: '' })}>
                    Clear Filters
                </CButton>
            </div>

            {loading ? (
                <div className="spin-style">
                    <CSpinner color="primary" variant="grow" />
                </div>
            ) : (
                <Table
                    heading="All Consultant"
                    btnText=""
                    btnURL=""
                    tableHeading={heading}
                    tableContent={currentData.map((item, index) => (
                        <CTableRow key={item._id}>
                            <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                            <CTableDataCell>{item.unique_id || 'N/A'}</CTableDataCell>
                            <CTableDataCell>{item.name || 'N/A'}</CTableDataCell>
                            <CTableDataCell>{item.email || 'N/A'}</CTableDataCell>
                            <CTableDataCell>{item.mobileNumber || 'N/A'}</CTableDataCell>
                            <CTableDataCell>{item.type || 'N/A'}</CTableDataCell>
                            <CTableDataCell>Rs. {item.walletAmount ? item.walletAmount.toFixed(1) : '0.0'}</CTableDataCell>
                            <CTableDataCell>
                                {item.portfolio?.PortfolioLink?.url ? (
                                    <a
                                        href={item.portfolio.PortfolioLink.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Portfolio
                                    </a>
                                ) : (
                                    'N/A'
                                )}
                            </CTableDataCell>
                            <CTableDataCell>
                                <span className={`badge ${item.nda ? 'bg-success' : 'bg-danger'}`}>
                                    {item.nda ? 'Accepted' : 'Rejected'}
                                </span>
                            </CTableDataCell>
                            <CTableDataCell>
                                <span className={`badge ${item.termAndCondition ? 'bg-success' : 'bg-danger'}`}>
                                    {item.termAndCondition ? 'Accepted' : 'Rejected'}
                                </span>
                            </CTableDataCell>
                            <CTableDataCell>
                                <CFormSwitch
                                    id={`formSwitch-${item._id}`}
                                    checked={item.isBanned}
                                    onChange={() => updateIsBanned(item._id, item.isBanned)}
                                />
                            </CTableDataCell>
                            <CTableDataCell>
                                <CFormSelect
                                    value={item.accountVerified || "Pending"}
                                    onChange={(e) => handleChange(e)}
                                    data-id={item._id || ""}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Verified">Verified</option>
                                    <option value="Rejected">Rejected</option>
                                </CFormSelect>
                            </CTableDataCell>
                            <CTableDataCell>
                                <CFormSwitch
                                    id={`architectSwitch-${item._id}`}
                                    checked={item.isHelpuBuildVerified}
                                    onChange={() => handleHelpuBuildVerify(item._id, item.isHelpuBuildVerified)}
                                />
                            </CTableDataCell>

                            <CTableDataCell>
                                <CButton
                                    color="info"
                                    size="sm"
                                    onClick={() => openChatTransitionModal(item.chatTransition || [])}
                                >
                                    View Chat Transition
                                </CButton>
                            </CTableDataCell>
                            <CTableDataCell>
                                <div className="action-parent">
                                    <CButton
                                        color="primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => viewProviderDetails(item)}
                                    >
                                        View Details
                                    </CButton>
                                    <div
                                        className="delete"
                                        onClick={() => confirmDelete(item._id)}
                                    >
                                        <i className="ri-delete-bin-fill"></i>
                                    </div>
                                </div>
                            </CTableDataCell>
                        </CTableRow>
                    ))}
                    pagination={
                        <CPagination className="justify-content-center">
                            <CPaginationItem
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                Previous
                            </CPaginationItem>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <CPaginationItem
                                    key={index}
                                    active={index + 1 === currentPage}
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </CPaginationItem>
                            ))}
                            <CPaginationItem
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                Next
                            </CPaginationItem>
                        </CPagination>
                    }
                />
            )}

            {/* Chat Transition Modal */}
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Chat Transition Details</CModalTitle>
                </CModalHeader>
                <CModalBody style={{ maxHeight: '500px', overflowY: 'auto', minWidth: '100%' }}>
                    {selectedTransition.length > 0 ? (
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Price/Min</th>
                                    <th>Addition</th>
                                    <th>Remaining Time</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedTransition.map((transition) => (
                                    <tr key={transition._id}>
                                        <td>{new Date(transition.startChatTime).toLocaleString()}</td>
                                        <td>{new Date(transition.endingChatTime).toLocaleString()}</td>
                                        <td>{transition.providerPricePerMin}</td>
                                        <td>{transition.deductionAmount}</td>
                                        <td>{transition.chatTimingRemaining} mins</td>
                                        <td>{new Date(transition.Date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No chat transition data available.</p>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Verification Modal */}
            <CModal visible={verificationModal} onClose={() => setVerificationModal(false)}>
                <CModalHeader>
                    <CModalTitle>Account Verification</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CFormInput
                        type="text"
                        placeholder="Enter rejection reason"
                        value={verificationRejectReason}
                        onChange={(e) => setVerificationRejectReason(e.target.value)}
                    />
                </CModalBody>
                <CModalFooter>
                    <CButton color="primary" onClick={() => handleAccountVerification('Rejected')}>Submit</CButton>
                    <CButton color="secondary" onClick={() => setVerificationModal(false)}>Close</CButton>
                </CModalFooter>
            </CModal>
        </>
    );
}

export default AllProvider;
