import React, { useState, useEffect } from 'react';
import {
  CTableDataCell,
  CTableRow,
  CSpinner,
  CPagination,
  CPaginationItem,
  CNavLink
} from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AllRechargeCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('https://testapi.dessobuild.com/api/v1/all_recharge_coupon');
      setCoupons(data.data.reverse() || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`https://testapi.dessobuild.com/api/v1/delete_recharge_coupon/${id}`);
      fetchCoupons();
      toast.success('Coupon deleted successfully!');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon. Please try again.');
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
        deleteCoupon(id);
      }
    });
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = coupons.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(coupons.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const heading = ['S.No', 'Coupon Code', 'Discount (%)', 'Action'];

  return (
    <>
      <Table
        heading="All Admin Coupons"
        btnText="Add Coupon"
        btnURL="/recharge_coupon/add_recharge_coupon"
        tableHeading={heading}
        tableContent={
          loading ? (
            <CTableRow>
              <CTableDataCell colSpan={4} className="text-center py-5">
                <CSpinner size="sm" className="me-2" /> Loading coupons...
              </CTableDataCell>
            </CTableRow>
          ) : (
            currentData.map((item, index) => (
              <CTableRow key={item._id}>
                <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                <CTableDataCell>{item.couponCode}</CTableDataCell>
                <CTableDataCell>{item.discount}</CTableDataCell>
                <CTableDataCell>
                  <div className="action-parent">
                    <CNavLink href={`#/recharge_coupon/edit_recharge_coupon/${item._id}`} className="edit">
                      <i className="ri-pencil-fill"></i>
                    </CNavLink>
                    <div className="delete" onClick={() => confirmDelete(item._id)}>
                      <i className="ri-delete-bin-fill"></i>
                    </div>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))
          )
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

export default AllRechargeCoupon;
