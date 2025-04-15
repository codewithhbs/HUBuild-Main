import React from 'react';
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
    CPagination,
    CPaginationItem,
    CFormSelect,
    CButton,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function AllWithdraw() {
    const [banners, setBanners] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedTransition, setSelectedTransition] = React.useState({});
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    const handleFetchBanner = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('https://api.helpubuild.co.in/api/v1/get-all-withdrawals');
            setBanners(data.data.reverse() || []); // Ensure default empty array
        } catch (error) {
            console.error('Error fetching banners:', error);
            toast.error('Failed to load banners. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus, providerId) => {
        setLoading(true);
        try {
            const res = await axios.put(`https://api.helpubuild.co.in/api/v1/update-withdraw-status/${id}`, { status: newStatus, providerId: providerId });
            // toast.success('Status updated successfully!');
            toast.success(res?.data?.message);
            handleFetchBanner(); // Refresh the provider list to reflect changes
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(
                error?.response?.data?.errors?.[0] ||
                error?.response?.data?.message ||
                'Failed to update the status. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    const openChatTransitionModal = (transitions) => {
        setSelectedTransition(transitions);
        setModalVisible(true);
    };

    // Delete Banner
    const handleDeleteBanner = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://api.helpubuild.co.in/api/v1/delete-withdraw-request/${id}`);
            // setBanners((prevBanners) => prevBanners.filter((banner) => banner._id !== id));
            handleFetchBanner();
            toast.success('Withdraw request deleted successfully!');
        } catch (error) {
            console.error('Error deleting Withdraw request:', error);
            toast.error('Failed to delete the Withdraw request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Confirm Delete
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
                handleDeleteBanner(id);
            }
        });
    };

    React.useEffect(() => {
        handleFetchBanner();
    }, []);

    // Calculate paginated data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = banners.slice(startIndex, startIndex + itemsPerPage);

    // Calculate total pages
    const totalPages = Math.ceil(banners.length / itemsPerPage);

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const heading = ['S.No', 'Provider Name', 'Provider Number', 'Request Amount', 'Commission %', 'Commission Amount', 'Final Amount', 'Bank Detail', 'Status', 'Action'];

    return (
        <>
            {loading ? (
                <div className="spin-style">
                    <CSpinner color="primary" variant="grow" />
                </div>
            ) : banners.length === 0 ? (
                <div className="no-data">
                    <p>No data available</p>
                </div>
            ) : (
                <Table
                    heading="All Withdraw Request"
                    btnText=""
                    btnURL="/testimonial/add_testimonial"
                    tableHeading={heading}
                    tableContent={
                        currentData.map((item, index) => (
                            <CTableRow key={item._id}>
                                <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                                <CTableDataCell>
                                    {item?.provider?.name}
                                </CTableDataCell>
                                <CTableDataCell>{item?.provider?.mobileNumber}</CTableDataCell>
                                <CTableDataCell>Rs. {item.amount}</CTableDataCell>
                                <CTableDataCell>{item.commissionPercent}%</CTableDataCell>
                                <CTableDataCell>Rs.{item.commission}</CTableDataCell>
                                <CTableDataCell>Rs.{item.finalAmount}</CTableDataCell>
                                <CTableDataCell>
                                    <CButton
                                        color="info"
                                        size="sm"
                                        style={{ color: 'white' }}
                                        onClick={() => openChatTransitionModal(item?.provider?.bankDetail)}
                                    >
                                        {/* {console.log("object",item?.provider?.bankDetail)} */}
                                        View Detail
                                    </CButton>
                                </CTableDataCell>
                                <CTableDataCell>
                                    <CFormSelect
                                        aria-label="Change Status"
                                        value={item.status}
                                        onChange={(e) => handleStatusChange(item._id, e.target.value, item?.provider?._id)} // Add a handler for status change
                                    >
                                        <option value={item.status}>{item.status}</option>
                                        {['Pending', 'Approved', 'Rejected']
                                            .filter((status) => status !== item.status) // Exclude the current status
                                            .map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                    </CFormSelect>
                                </CTableDataCell>

                                <CTableDataCell>
                                    <div className="action-parent">
                                        {/* <CNavLink href={`#/testimonial/edit_testimonial/${item._id}`} className='edit'>
                                            <i class="ri-pencil-fill"></i>
                                        </CNavLink> */}
                                        <div
                                            className="delete"
                                            onClick={() => confirmDelete(item._id)}
                                        >
                                            <i className="ri-delete-bin-fill"></i>
                                        </div>
                                    </div>
                                </CTableDataCell>
                            </CTableRow>
                        ))
                    }
                    pagination={
                        <CPagination className="justify-content-center">
                            <CPaginationItem
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                Previous
                            </CPaginationItem>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <CPaginationItem
                                    key={index}
                                    active={index + 1 === currentPage}
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </CPaginationItem>
                            ))}
                            <CPaginationItem
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                Next
                            </CPaginationItem>
                        </CPagination>
                    }
                />
            )}



            {/* Modal for Chat Transition Details */}
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Bank Details</CModalTitle>
                </CModalHeader>
                <CModalBody style={{ maxHeight: '500px', overflowY: 'auto', minWidth: '100%' }}>
                    {selectedTransition ? (
                        <table className="table table-bordered">
                            {console.log("object",selectedTransition)}
                            <thead>
                                <tr>
                                    <th>Holder Name</th>
                                    <th>Account Number</th>
                                    <th>Bank Name</th>
                                    <th>Branch Name</th>
                                    <th>IFCE Code</th>
                                    <th>Pan Card Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{selectedTransition.accountHolderName}</td>
                                    <td>{selectedTransition.accountNumber}</td>
                                    <td>{selectedTransition.bankName}</td>
                                    <td>{selectedTransition.branchName}</td>
                                    <td>{selectedTransition.ifscCode}</td>
                                    <td>{selectedTransition.panCardNumber}</td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <p>No bank detail available.</p>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    );
}

export default AllWithdraw
