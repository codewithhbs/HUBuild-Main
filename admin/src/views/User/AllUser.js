import React from 'react';
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
    CPagination,
    CPaginationItem,
    CFormSwitch,
    CNavLink,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton,
} from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function AllUser() {
    const token = sessionStorage.getItem('token')
    const [banners, setBanners] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedTransition, setSelectedTransition] = React.useState([]);
    const itemsPerPage = 10;

    // console.log("token", token)

    const handleFetchBanner = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('https://api.helpubuild.co.in/api/v1/users',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setBanners(data.data.reverse() || []);
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error(
                error?.response?.data?.errors?.[0] ||
                error?.response?.data?.message ||
                'Failed to fetching users. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Update Active Status
    const handleUpdateActive = async (id, currentStatus) => {
        setLoading(true);
        try {
            const updatedStatus = !currentStatus;
            const res = await axios.put(`https://api.helpubuild.co.in/api/v1/user-ban/${id}`, {
                isBanned: updatedStatus,
            });
            handleFetchBanner();
            toast.success(res?.data?.message);
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
            await axios.delete(`https://api.helpubuild.co.in/api/v1/user-delete/${id}`);
            // setBanners((prevBanners) => prevBanners.filter((banner) => banner._id !== id));
            handleFetchBanner()
            toast.success('User deleted successfully!');
        } catch (error) {
            console.error('Error deleting User:', error);
            toast.error('Failed to delete the user. Please try again.');
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

    const heading = ['S.No', 'Profile Image', 'Name', 'Email', 'Phone Number', 'Wallet', 'Recharge History', 'IsVerified', 'Block', 'Action'];

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
                    heading="All User"
                    btnText=""
                    btnURL=""
                    tableHeading={heading}
                    tableContent={
                        currentData.map((item, index) => (
                            <CTableRow key={item._id}>
                                <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                                <CTableDataCell>
                                    <img src={item?.ProfileImage?.imageUrl || 'https://via.placeholder.com/100'} width={100} height={100} alt="Profile image" />
                                </CTableDataCell>
                                {/* <CTableDataCell>{item.Gender}</CTableDataCell> */}
                                <CTableDataCell>{item.name || 'N/A'}</CTableDataCell>
                                <CTableDataCell>{item.email || 'N/A'}</CTableDataCell>
                                <CTableDataCell>{item.PhoneNumber || 'N/A'}</CTableDataCell>
                                <CTableDataCell>Rs.{item.walletAmount.toFixed(1) || 0}</CTableDataCell>
                                <CTableDataCell>
                                    <CButton
                                        color="info"
                                        size="sm"
                                        style={{color:'white'}}
                                        onClick={() => openChatTransitionModal(item.rechargeHistory || [])}
                                    >
                                        View
                                    </CButton>
                                </CTableDataCell>
                                <CTableDataCell>{item.isVerified === true ? 'Yes' : 'No'}</CTableDataCell>
                                <CTableDataCell>
                                    <CFormSwitch
                                        id={`formSwitch-${item._id}`}
                                        checked={item.isBanned}
                                        onChange={() => handleUpdateActive(item._id, item.isBanned)}
                                    />
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
                    <CModalTitle>Recharge History</CModalTitle>
                </CModalHeader>
                <CModalBody style={{ maxHeight: '500px', overflowY: 'auto', minWidth: '100%' }}>
                    {selectedTransition.length > 0 ? (
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th style={{whiteSpace:"nowrap"}}>Transaction Id</th>
                                    <th style={{whiteSpace:"nowrap"}}>Amount</th>
                                    <th style={{whiteSpace:"nowrap"}}>Payment Method</th>
                                    <th style={{whiteSpace:"nowrap"}}>Payment Status</th>
                                    <th style={{whiteSpace:"nowrap"}}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedTransition.map((transition) => (
                                    <tr key={transition._id}>
                                        <td>{transition.transactionId}</td>
                                        <td>{transition.amount}</td>
                                        <td>{transition.paymentMethod}</td>
                                        <td>{transition.PaymentStatus}</td>
                                        <td>{new Date(transition.time).toLocaleString()}</td>
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
        </>
    );
}

export default AllUser
