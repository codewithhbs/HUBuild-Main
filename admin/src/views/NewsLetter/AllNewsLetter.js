import React, { useState, useEffect } from 'react';
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
    CPagination,
    CPaginationItem,
    CButton,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
    CFormTextarea
} from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AllNewsLetter = () => {
    const [newsletters, setNewsletters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [message, setMessage] = useState('');
    const itemsPerPage = 10;

    const fetchNewsletters = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('https://api.dessobuild.com/api/v1/all_newsletter');
            setNewsletters(data.data.reverse() || []);
        } catch (error) {
            console.error('Error fetching newsletters:', error);
            toast.error(
                error?.response?.data?.message || 'Failed to fetch newsletters. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNewsletters();
    }, []);

    const handleSendNewsLetter = async () => {
        setLoading(true);
        try {
            const response = await axios.post('https://api.dessobuild.com/api/v1/send_message_newsletter', { message });
            toast.success(response.data.message);
            setModalVisible(false);
            setMessage('');
        } catch (error) {
            console.error('Error sending newsletter:', error);
            toast.error(
                error?.response?.data?.message || 'Failed to send newsletter. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNewsletter = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://api.dessobuild.com/api/v1/delete_newsletter/${id}`);
            fetchNewsletters();
            toast.success('Newsletter deleted successfully!');
        } catch (error) {
            console.error('Error deleting newsletter:', error);
            toast.error('Failed to delete the newsletter. Please try again.');
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
                handleDeleteNewsletter(id);
            }
        });
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = newsletters.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(newsletters.length / itemsPerPage);

    return (
        <>
            <CButton color="primary" className="mb-3" onClick={() => setModalVisible(true)}>
                Send Newsletter
            </CButton>
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
                <CModalHeader>Send Newsletter</CModalHeader>
                <CModalBody>
                    <CFormTextarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your newsletter message here..."
                    />
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleSendNewsLetter} disabled={loading}>
                        {loading ? <CSpinner size="sm" /> : 'Send'}
                    </CButton>
                </CModalFooter>
            </CModal>
            {loading ? (
                <div className="spin-style">
                    <CSpinner color="primary" variant="grow" />
                </div>
            ) : newsletters.length === 0 ? (
                <div className="no-data">
                    <p>No newsletters available</p>
                </div>
            ) : (
                <Table
                    heading="All Newsletters"
                    tableHeading={['S.No', 'Email', 'Action']}
                    tableContent={
                        currentData.map((item, index) => (
                            <CTableRow key={item._id}>
                                <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                                <CTableDataCell>{item.email || 'N/A'}</CTableDataCell>
                                <CTableDataCell>
                                    <CButton color="danger" size="sm" onClick={() => confirmDelete(item._id)}>
                                        Delete
                                    </CButton>
                                </CTableDataCell>
                            </CTableRow>
                        ))
                    }
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
        </>
    );
}

export default AllNewsLetter;
