import React, { useEffect, useState } from 'react';
import { GetData } from '../../utils/sessionStoreage';
import axios from 'axios';
import toast from 'react-hot-toast';

function RechargeHistory() {
    const Data = GetData('user');
    const token = GetData('token');
    const UserData = JSON.parse(Data);
    const [rechargeHistory, setRechargeHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const handleFetchUser = async () => {
        try {
            const UserId = UserData?._id;
            const { data } = await axios.get(`https://testapi.helpubuild.in/api/v1/get-single-user/${UserId}`);
            const history = data.data?.rechargeHistory;
            setRechargeHistory(history.reverse() || []);
        } catch (error) {
            console.log('Internal server error in fetching User');
            // toast.error('Unable to fetch recharge history. Please try again later.');
        }
    };

    useEffect(() => {
        handleFetchUser();
    }, []);

    // Calculate the paginated data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = rechargeHistory.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(rechargeHistory.length / itemsPerPage);

    // Navigate to previous or next page
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="my-5">
            <h2 className="text-center mb-4">Recharge History</h2>
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead style={{backgroundColor: '#093369',color: 'white'}} className="">
                        <tr>
                            <th>#</th>
                            <th>Amount</th>
                            <th>Transaction ID</th>
                            <th>Payment Status</th>
                            <th>Payment Method</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((record, index) => (
                            <tr key={record._id}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>₹{record.amount}</td>
                                <td>{record.transactionId}</td>
                                <td>
                                    <span
                                        className={`badge ${record.PaymentStatus === 'paid'
                                            ? 'bg-success'
                                            : 'bg-danger'
                                            }`}
                                    >
                                        {record.PaymentStatus === 'paid'
                                            ? 'Payment Done'
                                            : 'Failed Transaction'}
                                    </span>
                                </td>
                                <td>{record.paymentMethod}</td>
                                <td>{new Date(record.time).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <nav className="d-flex justify-content-center">
                        <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={handlePreviousPage}
                                >
                                    Previous
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <li
                                    key={index}
                                    className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                >
                                    <button
                                        onClick={() => paginate(index + 1)}
                                        className="page-link"
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={handleNextPage}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </div>
    );
}

export default RechargeHistory;
