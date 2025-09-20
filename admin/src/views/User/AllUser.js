import React from 'react';
import {
  CTableDataCell,
  CTableRow,
  CSpinner,
  CPagination,
  CPaginationItem,
  CFormSwitch,
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

function AllUser() {
  const token = sessionStorage.getItem('token');
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedTransition, setSelectedTransition] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [verifiedFilter, setVerifiedFilter] = React.useState('');
  const itemsPerPage = 10;

  const handleFetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('https://testapi.dessobuild.com/api/v1/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(data.data.reverse() || []);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error(
        error?.response?.data?.errors?.[0] ||
          error?.response?.data?.message ||
          'Failed to fetch users. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateActive = async (id, currentStatus) => {
    setLoading(true);
    try {
      const res = await axios.put(`https://testapi.dessobuild.com/api/v1/user-ban/${id}`, {
        isBanned: !currentStatus,
      });
      handleFetchUsers();
      toast.success(res?.data?.message);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(
        error?.response?.data?.errors?.[0] ||
          error?.response?.data?.message ||
          'Failed to update the status. Please try again.'
      );
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
        handleDeleteUser(id);
      }
    });
  };

  const handleDeleteUser = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`https://testapi.dessobuild.com/api/v1/user-delete/${id}`);
      handleFetchUsers();
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete the user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openChatTransitionModal = (transitions) => {
    setSelectedTransition(transitions);
    setModalVisible(true);
  };

  React.useEffect(() => {
    handleFetchUsers();
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, verifiedFilter]);

  // Filtered and paginated users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = [user.name, user.email, user.PhoneNumber]
      .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesVerified =
      verifiedFilter === ''
        ? true
        : verifiedFilter === 'verified'
        ? user.isVerified === true
        : user.isVerified === false;
    return matchesSearch && matchesVerified;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const heading = [
    'S.No',
    'Profile Image',
    'Name',
    'Email',
    'Phone Number',
    'Wallet',
    'Recharge History',
    'IsVerified',
    'Block',
    'Action',
  ];

  return (
    <>
      <div className="row px-3 mb-3">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
          >
            <option value="">All Users</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spin-style text-center py-5">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="no-data text-center">
          <p>No users found</p>
        </div>
      ) : (
        <Table
          heading="All Users"
          tableHeading={heading}
          tableContent={currentData.map((item, index) => (
            <CTableRow key={item._id}>
              <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
              <CTableDataCell>
                <img
                  src={item?.ProfileImage?.imageUrl || 'https://via.placeholder.com/100'}
                  width={100}
                  height={100}
                  alt="Profile"
                />
              </CTableDataCell>
              <CTableDataCell>{item.name || 'N/A'}</CTableDataCell>
              <CTableDataCell>{item.email || 'N/A'}</CTableDataCell>
              <CTableDataCell>{item.PhoneNumber || 'N/A'}</CTableDataCell>
              <CTableDataCell>Rs. {item.walletAmount?.toFixed(1) || 0}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="info"
                  size="sm"
                  style={{ color: 'white' }}
                  onClick={() => openChatTransitionModal(item.rechargeHistory || [])}
                >
                  View
                </CButton>
              </CTableDataCell>
              <CTableDataCell>{item.isVerified ? 'Yes' : 'No'}</CTableDataCell>
              <CTableDataCell>
                <CFormSwitch
                  checked={item.isBanned}
                  onChange={() => handleUpdateActive(item._id, item.isBanned)}
                />
              </CTableDataCell>
              <CTableDataCell>
                <div className="action-parent">
                  <div className="delete" onClick={() => confirmDelete(item._id)}>
                    <i className="ri-delete-bin-fill text-danger"></i>
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

      {/* Recharge History Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Recharge History</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {selectedTransition.length > 0 ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Base Amount</th>
                  <th>Bonus</th>
                  <th>Total Credited</th>
                  <th>Coupon Code</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {selectedTransition.slice().reverse().map((transition, index) => (
                  <tr key={index}>
                    <td>{transition.transactionId}</td>
                    <td>₹{transition.baseAmount || 0}</td>
                    <td>
                      ₹{transition.bonusAmount || 0}
                      {transition.couponDiscount ? ` (${transition.couponDiscount}%)` : ''}
                    </td>
                    <td>₹{transition.totalCredited || 0}</td>
                    <td>{transition.couponCode || 'N/A'}</td>
                    <td>{transition.paymentMethod || 'N/A'}</td>
                    <td>
                      <span className={`badge ${transition.paymentStatus === 'paid' ? 'bg-success' : 'bg-danger'}`}>
                        {transition.paymentStatus === 'paid' ? 'Paid' : 'Failed'}
                      </span>
                    </td>
                    <td>{new Date(transition.time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No Recharge History available.</p>
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

export default AllUser;
