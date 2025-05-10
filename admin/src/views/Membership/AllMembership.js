import React, { useState, useEffect } from 'react';
import { CTableDataCell, CTableRow, CSpinner, CPagination, CPaginationItem, CNavLink } from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AllMembership = () => {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchMemberships = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('https://api.helpubuild.in/api/v1/get_all_membership');
            setMemberships(data.data.reverse() || []);
        } catch (error) {
            console.error('Error fetching memberships:', error);
            toast.error('Failed to load memberships. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const deleteMembership = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://api.helpubuild.in/api/v1/delete_membership/${id}`);
            fetchMemberships();
            toast.success('Membership deleted successfully!');
        } catch (error) {
            console.error('Error deleting membership:', error);
            toast.error('Failed to delete membership. Please try again.');
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
                deleteMembership(id);
            }
        });
    };

    useEffect(() => {
        fetchMemberships();
    }, []);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = memberships.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(memberships.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const heading = ['S.No', 'Plan Price', 'Action'];

    return (
        <>
            <Table
                heading="All Memberships"
                btnText="Add Membership"
                btnURL="/membership/add_membership"
                tableHeading={heading}
                tableContent={
                    currentData.map((item, index) => (
                        <CTableRow key={item._id}>
                            <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                            <CTableDataCell>{item.planPrice}</CTableDataCell>
                            <CTableDataCell>
                                <div className="action-parent">
                                    <CNavLink href={`#/membership/edit_membership/${item._id}`} className='edit'>
                                        <i class="ri-pencil-fill"></i>
                                    </CNavLink>
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
        </>
    );
};

export default AllMembership;
