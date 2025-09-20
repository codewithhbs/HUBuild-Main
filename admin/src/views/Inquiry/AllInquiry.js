import React from 'react';
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
    CPagination,
    CPaginationItem,
    CFormSelect,
} from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AllInquiry = () => {
    const [contacts, setContacts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    // Fetch contacts
    const fetchContacts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('https://testapi.dessobuild.com/api/v1/get-contact');
            setContacts(data.data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contacts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchContacts();
    }, []);

    // Update status
    const handleUpdateStatus = async (id, status) => {
        setLoading(true);
        try {
            const res = await axios.put(`https://testapi.dessobuild.com/api/v1/update-contact/${id}`, { status });
            setContacts((prev) =>
                prev.map((contact) =>
                    contact._id === id ? { ...contact, status } : contact
                )
            );
            toast.success(res?.data?.message || 'Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(
                error?.response?.data?.message || 'Failed to update status. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Add note
    const handleAddNote = async (id) => {
        const { value: note } = await Swal.fire({
            title: 'Add Note',
            input: 'textarea',
            inputLabel: 'Note',
            inputPlaceholder: 'Enter your note here...',
            inputAttributes: { 'aria-label': 'Type your note here' },
            showCancelButton: true,
        });

        if (note) {
            setLoading(true);
            try {
                const res = await axios.put(`https://testapi.dessobuild.com/api/v1/add-note/${id}`, { note });
                setContacts((prev) =>
                    prev.map((contact) =>
                        contact._id === id
                            ? { ...contact, notes: [...(contact.notes || []), note] }
                            : contact
                    )
                );
                toast.success(res?.data?.message || 'Note added successfully!');
            } catch (error) {
                console.error('Error adding note:', error);
                toast.error(
                    error?.response?.data?.message || 'Failed to add note. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        }
    };

    // Delete contact
    const handleDeleteContact = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://testapi.dessobuild.com/api/v1/delete-contact/${id}`);
            setContacts((prev) => prev.filter((contact) => contact._id !== id));
            toast.success('Contact deleted successfully!');
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast.error(
                error?.response?.data?.message || 'Failed to delete contact. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Confirm delete
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
                handleDeleteContact(id);
            }
        });
    };

    // Pagination logic
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = contacts.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(contacts.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const heading = [
        'S.No',
        'Name',
        'Subject',
        'Number',
        'Message',
        'Status',
        'Actions',
    ];

    return (
        <>
            {loading ? (
                <div className="spin-style">
                    <CSpinner color="primary" variant="grow" />
                </div>
            ) : contacts.length === 0 ? (
                <div className="no-data">
                    <p>No data available</p>
                </div>
            ) : (
                <Table
                    heading="All Inquiries"
                    tableHeading={heading}
                    tableContent={currentData.map((item, index) => (
                        <CTableRow key={item._id}>
                            <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                            <CTableDataCell>{item.name} {item.lastName}</CTableDataCell>
                            <CTableDataCell>{item.subject}</CTableDataCell>
                            <CTableDataCell>{item.number}</CTableDataCell>
                            <CTableDataCell>{item.message}</CTableDataCell>
                            <CTableDataCell>
                                <CFormSelect
                                    size="sm"
                                    value={item.status}
                                    onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Solved">Solved</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Rejected">Rejected</option>
                                </CFormSelect>
                            </CTableDataCell>
                            <CTableDataCell>
                                <div className="action-parent" style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() =>
                                            Swal.fire({
                                                title: 'Notes',
                                                html: item.notes?.length
                                                    ? `<ul style="text-align: left;">${item.notes.map(
                                                        (note) => `<li>${note}</li>`
                                                    ).join('')}</ul>`
                                                    : 'No notes available.',
                                                icon: 'info',
                                            })
                                        }
                                    >
                                        View Notes
                                    </button>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => handleAddNote(item._id)}
                                    >
                                        Add Note
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => confirmDelete(item._id)}
                                    >
                                        Delete
                                    </button>
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

export default AllInquiry;
