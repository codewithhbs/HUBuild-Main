import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GetData } from '../../../utils/sessionStoreage';

// Note: In a real implementation, you would import bootstrap CSS or
// ensure it's included in your project's main CSS file

const CallDeductionProvider = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const Data = GetData('user');
    const UserData = JSON.parse(Data);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userId = UserData._id;
            const { data } = await axios.get(`https://www.testapi.helpubuild.in/api/v1/get-call-by-provider/${userId}`)
            setData(data.data.reverse());
            setLoading(false);
        } catch (error) {
            console.log("Internal server error", error)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    // Format date to readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Format duration in seconds to minutes:seconds
    const formatDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return '00:00';
        const durationInSeconds = endTime - startTime;
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Get status badge class based on call status
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Answered':
                return 'badge bg-success';
            case 'ANSWER':
                return 'badge bg-success';
            case 'Missed':
                return 'badge bg-warning';
            case 'Cancelled':
                return 'badge bg-danger';
            case 'No Answer':
                return 'badge bg-secondary';
            case 'NOANSWER':
                return 'badge bg-danger';
            default:
                return 'badge bg-danger';
        }
    };

    // Display pagination
    const renderPagination = () => {
        return (
            <nav aria-label="Call history pagination">
                <ul className="pagination justify-content-center">
                    {/* Previous button */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={prevPage} aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>

                    {/* First page */}
                    {currentPage > 2 && (
                        <li className="page-item">
                            <button className="page-link" onClick={() => paginate(1)}>1</button>
                        </li>
                    )}

                    {/* Ellipsis if needed */}
                    {currentPage > 3 && (
                        <li className="page-item disabled">
                            <span className="page-link">...</span>
                        </li>
                    )}

                    {/* Current page and neighbors */}
                    {Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, i) => {
                            const pageNum = Math.max(1, currentPage - 1) + i;
                            if (pageNum > totalPages) return null;
                            if (pageNum === 1 && currentPage > 2) return null;
                            if (pageNum === totalPages && currentPage < totalPages - 1) return null;
                            return (
                                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => paginate(pageNum)}>{pageNum}</button>
                                </li>
                            );
                        }
                    ).filter(Boolean)}

                    {/* Ellipsis if needed */}
                    {currentPage < totalPages - 2 && (
                        <li className="page-item disabled">
                            <span className="page-link">...</span>
                        </li>
                    )}

                    {/* Last page */}
                    {currentPage < totalPages - 1 && totalPages > 1 && (
                        <li className="page-item">
                            <button className="page-link" onClick={() => paginate(totalPages)}>{totalPages}</button>
                        </li>
                    )}

                    {/* Next button */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={nextPage} aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };


    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col">
                    <h2 className="fw-bold">Call Deduction History</h2>
                    <p className="text-muted">Track your calls and wallet deductions</p>
                </div>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="row">
                        <div className="col">
                            <div className="card">
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ whiteSpace: 'nowrap' }}>Call Details</th>
                                                    <th style={{ whiteSpace: 'nowrap' }}>Date & Time</th>
                                                    <th style={{ whiteSpace: 'nowrap' }}>Duration</th>
                                                    <th style={{ whiteSpace: 'nowrap' }}>Cost</th>
                                                    <th style={{ whiteSpace: 'nowrap' }}>User Response Satus</th>
                                                    <th style={{ whiteSpace: 'nowrap' }}>Your Response Satus</th>
                                                    {/* <th style={{whiteSpace:'nowrap'}}>Status</th> */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.length > 0 ? (
                                                    currentItems.map((call) => (
                                                        <tr key={call._id}>
                                                            <td>
                                                                <div>
                                                                    <div className="fw-bold">
                                                                        <i className="bi bi-telephone me-2"></i>
                                                                        <span>{call.userId?.name} ➔ {call.providerId?.name}</span>
                                                                    </div>
                                                                    {/* <div className="small text-muted">
                                                                        <i className="bi bi-person me-1"></i>
                                                                        <span>{call.userId?.name || 'Unknown User'}</span>
                                                                    </div> */}
                                                                    <div className="small text-muted">ID: {call.callerId}</div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    <i className="bi bi-calendar-date me-2"></i>
                                                                    <span>{formatDate(call.createdAt)}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    <i className="bi bi-clock me-2"></i>
                                                                    <span className="fw-semibold">
                                                                        {call?.TalkTime !== undefined && (() => {
                                                                            const strTime = call.TalkTime.toString();
                                                                            const parts = strTime.split('.').map(part => parseInt(part, 10) || 0);

                                                                            let [hr, min, sec] = [0, 0, 0];
                                                                            if (parts.length === 3) {
                                                                                [hr, min, sec] = parts;
                                                                            } else if (parts.length === 2) {
                                                                                [min, sec] = parts;
                                                                            } else if (parts.length === 1) {
                                                                                sec = parts[0];
                                                                            }

                                                                            const hrStr = hr ? `${hr} hr ` : '';
                                                                            const minStr = min ? `${min} min ` : '';
                                                                            const secStr = `${sec} sec`;

                                                                            return `${hrStr}${minStr}${secStr}`;
                                                                        })()}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div>
                                                                    ₹
                                                                    <span className="fw-semibold">
                                                                        {call.cost_of_call || call.money_deducetation_amount || 0}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={getStatusBadgeClass(call.from_number_status || call.status)}>
                                                                    {call.from_number_status || call.status}
                                                                </span>
                                                                {call.cancel_reason && (
                                                                    <div className="small text-muted mt-1">{call.cancel_reason}</div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span className={getStatusBadgeClass(call.to_number_status || call.status)}>
                                                                    {call.to_number_status || call.status}
                                                                </span>

                                                                {call.cancel_reason && (
                                                                    <div className="small text-muted mt-1">{call.cancel_reason}</div>
                                                                )}
                                                            </td>
                                                            {/* <td>
                                                                <span className={getStatusBadgeClass(call.status)}>
                                                                    {call.status}
                                                                </span>
                                                                {call.cancel_reason && (
                                                                    <div className="small text-muted mt-1">{call.cancel_reason}</div>
                                                                )}
                                                            </td> */}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-4">
                                                            <p className="text-muted mb-0">No call history found</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    {data.length > itemsPerPage && (
                        <div className="row mt-4">
                            <div className="col">
                                {renderPagination()}
                            </div>
                        </div>
                    )}

                    {/* Stats cards */}
                    <div className="row mt-4">
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h6 className="card-title text-muted">Total Calls</h6>
                                    <h3 className="card-text fw-bold">{data.length}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h6 className="card-title text-muted">Total Cost</h6>
                                    <h3 className="card-text fw-bold">
                                        {data.reduce((sum, call) => sum + (call.cost_of_call || call.money_deducetation_amount || 0), 0)}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h6 className="card-title text-muted">Current Wallet</h6>
                                    <h3 className="card-text fw-bold">{data[0]?.UserWallet || 0}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h6 className="card-title text-muted">Last Called</h6>
                                    <h3 className="card-text fw-bold">
                                        {data.length > 0 ? formatDate(data[0]?.createdAt).split(',')[0] : 'N/A'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default CallDeductionProvider
