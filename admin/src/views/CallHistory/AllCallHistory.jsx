import React from 'react';
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
    CPagination,
    CPaginationItem,
    CNavLink,
} from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AllCallHistory = () => {
    const [calls, setCalls] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    const handleFetchCalls = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('https://testapi.helpubuild.in/api/v1/get-call-by-admin');
            setCalls(data.data.reverse() || []);
        } catch (error) {
            console.error('Error fetching call history:', error);
            toast.error('Failed to load call history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCall = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://testapi.helpubuild.in/api/v1/delete-call-by-admin/${id}`);
            setCalls((prevCalls) => prevCalls.filter((call) => call._id !== id));
            toast.success('Call history deleted successfully!');
        } catch (error) {
            console.error('Error deleting call record:', error);
            toast.error('Failed to delete the record. Please try again.');
        } finally {
            setLoading(false);
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
                handleDeleteCall(id);
            }
        });
    };

    React.useEffect(() => {
        handleFetchCalls();
    }, []);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = calls.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(calls.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const heading = [
        'S.No',
        'Caller ID',
        'Provider Name',
        'User Name',
        'From Number',
        'To Number',
        'Talk Time',
        'Cost of Call',
        'Status',
        'Created At',
        'Action'
    ];

    return (
        <>
            {loading ? (
                <div className="spin-style">
                    <CSpinner color="primary" variant="grow" />
                </div>
            ) : calls.length === 0 ? (
                <div className="no-data">
                    <p>No call history available</p>
                </div>
            ) : (
                <Table
                    heading="All Call History"
                    tableHeading={heading}
                    tableContent={currentData.map((item, index) => (
                        <CTableRow key={item._id}>
                            <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                            <CTableDataCell>{item.callerId}</CTableDataCell>
                            <CTableDataCell>{item.providerId?.name}</CTableDataCell>
                            <CTableDataCell>{item.userId?.name}</CTableDataCell>
                            <CTableDataCell>{item.from_number}</CTableDataCell>
                            <CTableDataCell>{item.to_number}</CTableDataCell>
                            <CTableDataCell>{item.TalkTime}</CTableDataCell>
                            <CTableDataCell>₹ {item.cost_of_call}</CTableDataCell>
                            <CTableDataCell>{item.status}</CTableDataCell>
                            <CTableDataCell>{new Date(item.createdAt).toLocaleString()}</CTableDataCell>
                            <CTableDataCell>
                                <div className="action-parent">
                                    {/* <CNavLink href={`#/call-history/view/${item._id}`} className='edit'>
                                        <i className="ri-eye-fill"></i>
                                    </CNavLink> */}
                                    <div className="delete" onClick={() => confirmDelete(item._id)}>
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
        </>
    );
};

export default AllCallHistory;
