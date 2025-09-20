import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Withdraw({ data }) {
  const providerId = data._id;
  const [withdraw, setWithdraw] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleFetchWithdraw = async () => {
    try {
      const { data } = await axios.get(`https://testapi.dessobuild.com/api/v1/get-withdrawals-by-providerid/${providerId}`);
      const alldata = data.data;
      const reverse = [...alldata].reverse(); // Reverses the order of the data
      setWithdraw(reverse);
    } catch (error) {
      console.log('Internal server error', error);
    }
  };

  useEffect(() => {
    handleFetchWithdraw();
  }, []);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= Math.ceil(withdraw.length / itemsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  const totalItems = withdraw.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = withdraw.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination: Show 5 page numbers at a time
  const pageNumbersToShow = 5;
  const startPage = Math.max(1, currentPage - Math.floor(pageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + pageNumbersToShow - 1);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="wallet-list mt-4">
      <div className="table-container">
        <div className="table-responsive"> {/* Added this div for responsiveness */}
          <table className="table table-bordered table-striped custom-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Commission Percent</th>
                <th>Commission Amount</th>
                <th>Final Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.amount ? item.amount.toFixed(2) : '0.00'}</td>
                    <td>{item.commissionPercent ? item.commissionPercent : '0'}%</td>
                    <td>₹{item.commission ? item.commission : '0'}</td>
                    <td>₹{item.finalAmount ? item.finalAmount : '0'}</td>
                    <td>{item.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">There are no previous transactions.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          {visiblePages.map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>

  );
}

export default Withdraw;
