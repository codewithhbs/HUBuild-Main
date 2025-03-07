import React from 'react';
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
    CPagination,
    CPaginationItem,
    CFormSwitch,
    CNavLink,
} from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function AllBlogs() {
    const [banners, setBanners] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    const handleFetchBanner = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('https://api.helpubuild.co.in/api/v1/get-all-blog');
            setBanners(data.data || []); // Ensure default empty array
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast.error('Failed to load blogs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Update Active Status
    const handleUpdateActive = async (id, currentStatus) => {
        setLoading(true);
        // console.log("i am hit",currentStatus)
        try {
            const updatedStatus = !currentStatus;
            const res = await axios.put(`https://api.helpubuild.co.in/api/v1/update-testimonial-status/${id}`, {
                active: updatedStatus,
            });

            // console.log("i am hit 2")

            setBanners((prevBanners) =>
                prevBanners.map((banner) =>
                    banner._id === id ? { ...banner, active: updatedStatus } : banner
                )
            );
            // toast.success('Status updated successfully!');
            toast.success(res?.data?.message);
        } catch (error) {
            console.error('Error updating status:', error);
            // toast.error('Unable to update status. Please try again.');
            toast.error(
                error?.response?.data?.errors?.[0] ||
                error?.response?.data?.message ||
                'Failed to update the status. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    // Delete Banner
    const handleDeleteBanner = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://api.helpubuild.co.in/api/v1/delete-blog/${id}`);
            setBanners((prevBanners) => prevBanners.filter((banner) => banner._id !== id));
            toast.success('Blog deleted successfully!');
        } catch (error) {
            console.error('Error deleting blog:', error);
            toast.error('Failed to delete the blog. Please try again.');
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

    const heading = ['S.No', 'Small Image', 'Large Image', 'Title', 'Content', 'Action'];

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
                    heading="All Blogs"
                    btnText="Add Blog"
                    btnURL="/blogs/add_blogs"
                    tableHeading={heading}
                    tableContent={
                        currentData.map((item, index) => (
                            <CTableRow key={item._id}>
                                <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                                <CTableDataCell>
                                    <img src={item?.image?.url} alt="small image" width={100} />
                                </CTableDataCell>
                                <CTableDataCell>
                                    <img src={item?.largeImage?.url} alt="small image" width={100} />
                                </CTableDataCell>
                                <CTableDataCell>{item.title}</CTableDataCell>
                                <CTableDataCell>{item.content}</CTableDataCell>
                                <CTableDataCell>
                                    <div className="action-parent">
                                        <CNavLink href={`#/blogs/edit_blogs/${item._id}`} className='edit'>
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
            )}
        </>
    );
}

export default AllBlogs
