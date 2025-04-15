import React, { useState, useEffect } from 'react';
import { CTableDataCell, CTableRow, CPagination, CPaginationItem, CNavLink } from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AllExpertise = () => {
    const [expertiseList, setExpertiseList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchExpertise = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/v1/all_expertise');
            setExpertiseList(data.data.reverse() || []);
        } catch (error) {
            console.error('Error fetching expertise:', error);
            toast.error('Failed to load expertise. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const deleteExpertise = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/v1/delete_expertise/${id}`);
            fetchExpertise();
            toast.success('Expertise deleted successfully!');
        } catch (error) {
            console.error('Error deleting expertise:', error);
            toast.error('Failed to delete expertise. Please try again.');
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
                deleteExpertise(id);
            }
        });
    };

    useEffect(() => {
        fetchExpertise();
    }, []);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = expertiseList.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(expertiseList.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const heading = ['S.No', 'Expertise', 'Action'];

    return (
        <>
            <Table
                heading="All Expertise"
                btnText="Add Expertise"
                btnURL="/expertise/add_expertise"
                tableHeading={heading}
                tableContent={
                    currentData.map((item, index) => (
                        <CTableRow key={item._id}>
                            <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                            <CTableDataCell>{item.expertise}</CTableDataCell>
                            <CTableDataCell>
                                <div className="action-parent">
                                    <CNavLink href={`#/expertise/edit_expertise/${item._id}`} className='edit'>
                                        <i className="ri-pencil-fill"></i>
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

export default AllExpertise;
