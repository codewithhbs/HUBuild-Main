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
            const { data } = await axios.get(`https://api.helpubuild.in/api/v1/get-single-user/${UserId}`);
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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = rechargeHistory.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(rechargeHistory.length / itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="my-5">
            <h2 className="text-center mb-4">Recharge History</h2>
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead style={{ backgroundColor: '#093369', color: 'white' }}>
                        <tr>
                            <th>#</th>
                            <th>Base Amount</th>
                            <th>Bonus</th>
                            <th>Total Credited</th>
                            <th>Coupon</th>
                            <th>Transaction ID</th>
                            <th>Status</th>
                            <th>Method</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((record, index) => (
                            <tr key={index}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>₹{record.baseAmount || 0}</td>
                                <td>₹{record.bonusAmount || 0} {record.couponDiscount ? `(${record.couponDiscount}%)` : ''}</td>
                                <td>₹{record.totalCredited || 0}</td>
                                <td>{record.couponCode || 'N/A'}</td>
                                <td>{record.transactionId}</td>
                                <td>
                                    <span className={`badge ${record.paymentStatus === 'paid' ? 'bg-success' : 'bg-danger'}`}>
                                        {record.paymentStatus === 'paid' ? 'Payment Done' : 'Failed Transaction'}
                                    </span>
                                </td>
                                <td>{record.paymentMethod || 'N/A'}</td>
                                <td>{new Date(record.time).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <nav className="d-flex justify-content-center">
                        <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={handlePreviousPage}>
                                    Previous
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                    <button onClick={() => paginate(index + 1)} className="page-link">
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={handleNextPage}>
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
