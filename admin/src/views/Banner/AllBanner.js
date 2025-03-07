import React from 'react';
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
    CPagination,
    CPaginationItem,
    CFormSwitch,
} from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function AllBanner() {
    const [banners, setBanners] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    // Fetch banners
    const handleFetchBanner = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('https://api.helpubuild.co.in/api/v1/get-all-banner');
            setBanners(data.data);
        } catch (error) {
            console.log('Internal server error in getting banner', error);
        } finally {
            setLoading(false);
        }
    };

    // Update Active Status
    const handleUpdateActive = async (id, currentStatus) => {
        try {
            // API call to update active status
            const updatedStatus = !currentStatus;
            await axios.put(`https://api.helpubuild.co.in/api/v1/update-banner-status/${id}`, {
                active: updatedStatus,
            });

            // Update the banners state
            setBanners((prevBanners) =>
                prevBanners.map((banner) =>
                    banner._id === id ? { ...banner, active: updatedStatus } : banner
                )
            );
            toast.success('Status updated successfully')
        } catch (error) {
            console.log('Error updating active status:', error);
            toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later")
        }
    };

    // Delete Banner
    const handleDeleteBanner = async (id) => {
        try {
            setLoading(true);
            await axios.delete(`https://api.helpubuild.co.in/api/v1/delete-banner/${id}`);
            setBanners((prevBanners) => prevBanners.filter((banner) => banner._id !== id));
            toast.success('Banner deleted successfully');
        } catch (error) {
            console.log('Error deleting banner:', error);
            toast.error(
                error?.response?.data?.errors?.[0] ||
                error?.response?.data?.message ||
                'Please try again later'
            );
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

    const heading = ['S.No', 'Banner Image', 'View In', 'Active', 'Action'];

    return (
        <>
            {loading ? (
                <div className="spin-style">
                    <CSpinner color="primary" variant="grow" />
                </div>
            ) : (
                <Table
                    heading="All Banner"
                    btnText="Add Banner"
                    btnURL="/banner/add-banner"
                    tableHeading={heading}
                    tableContent={
                        currentData &&
                        currentData.map((item, index) => (
                            <CTableRow key={index}>
                                <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                                <CTableDataCell>
                                    <img src={item?.bannerImage?.url} alt="Banner" width={100} />
                                </CTableDataCell>
                                <CTableDataCell className='table-text'>{item?.view}</CTableDataCell>
                                <CTableDataCell>
                                    <CFormSwitch
                                        id={`formSwitch-${item._id}`}
                                        checked={item?.active}
                                        onChange={() =>
                                            handleUpdateActive(item._id, item.active)
                                        }
                                    />
                                </CTableDataCell>
                                <CTableDataCell>
                                    <div className='action-parent'>
                                        {/* <div className='edit'>
                                            <i class="ri-pencil-fill"></i>
                                        </div> */}
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
                        <CPagination className="justify-content-center" aria-label="Page navigation example">
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

export default AllBanner;
