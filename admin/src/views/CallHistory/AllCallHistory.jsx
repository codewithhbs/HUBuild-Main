import React from 'react';
import {
  CTableDataCell,
  CTableRow,
  CSpinner,
  CPagination,
  CPaginationItem,
} from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AllCallHistory = () => {
  const [calls, setCalls] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const itemsPerPage = 10;

  const handleFetchCalls = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('https://testapi.dessobuild.com/api/v1/get-call-by-admin');
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
      await axios.delete(`https://testapi.dessobuild.com/api/v1/delete-call-by-admin/${id}`);
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

  // Reset to page 1 when filter/search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Filtered + paginated data
  const filteredCalls = calls.filter((call) => {
    const searchMatch = [call.callerId, call.providerId?.name, call.userId?.name]
      .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()));
    const statusMatch = statusFilter ? call.status?.toLowerCase() === statusFilter.toLowerCase() : true;
    return searchMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredCalls.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const heading = [
    'S.No',
    'Caller ID',
    'Consultant Name',
    'User Name',
    'From Number',
    'To Number',
    'Talk Time',
    'Cost of Call',
    'Status',
    'Created At',
    'Action',
  ];

  return (
    <>
      <div className="row mb-3 px-3">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Caller ID, Consultant, or User Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div> */}
      </div>

      {loading ? (
        <div className="spin-style text-center py-5">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="no-data text-center">
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
              <CTableDataCell>{item.providerId?.name || 'N/A'}</CTableDataCell>
              <CTableDataCell>{item.userId?.name || 'N/A'}</CTableDataCell>
              <CTableDataCell>{item.from_number}</CTableDataCell>
              <CTableDataCell>{item.to_number}</CTableDataCell>
              <CTableDataCell>{item.TalkTime || '0s'}</CTableDataCell>
              <CTableDataCell>₹ {item.cost_of_call || '0'}</CTableDataCell>
              <CTableDataCell>{item.status}</CTableDataCell>
              <CTableDataCell>{new Date(item.createdAt).toLocaleString()}</CTableDataCell>
              <CTableDataCell>
                <div className="action-parent">
                  <div className="delete" onClick={() => confirmDelete(item._id)}>
                    <i className="ri-delete-bin-fill text-danger" style={{ cursor: 'pointer' }}></i>
                  </div>
                </div>
              </CTableDataCell>
            </CTableRow>
          ))}
          pagination={
            <CPagination className="justify-content-center mt-4">
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
