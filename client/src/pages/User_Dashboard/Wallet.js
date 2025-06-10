import React, { useState, useEffect } from 'react';
import './Wallet.css'; // Create a new CSS file for custom styling

function Wallet({ data }) {
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Initialize data when component mounts or data changes
    useEffect(() => {
        if (data?.chatTransition) {
            const reversedData = [...data.chatTransition].reverse();
            setFilteredData(reversedData);
        }
    }, [data]);

    const calculateDuration = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return '0 min 0 sec';
        }

        const durationInSeconds = (endDate - startDate) / 1000;
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.floor(durationInSeconds % 60);

        return `${minutes} min ${seconds} sec`;
    };

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchTerm(query);
        setCurrentPage(1); // Reset to first page when searching
        
        if (data?.chatTransition) {
            const filtered = data.chatTransition.filter(transition =>
                transition.user?.name?.toLowerCase().includes(query)
            );
            setFilteredData(filtered);
        }
    };

    const handleSort = () => {
        const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newSortOrder);
        setCurrentPage(1); // Reset to first page when sorting
        
        const sortedData = [...filteredData].sort((a, b) => {
            const dateA = new Date(a.Date);
            const dateB = new Date(b.Date);
            
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                return 0;
            }
            
            return newSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        
        setFilteredData(sortedData);
    };

    const handlePageChange = (pageNumber) => {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Calculate pagination values
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // Pagination: Show 4 page numbers at a time (as in your original code)
    const pageNumbersToShow = 4;
    const startPage = Math.max(1, currentPage - Math.floor(pageNumbersToShow / 2));
    const endPage = Math.min(totalPages, startPage + pageNumbersToShow - 1);
    const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
        <div className="container wallet-list mt-4">
            <div style={{display:'flex'}} className="gap-2 justify-content-between mb-3">
                <input
                    type="text"
                    className="form-control wallet-search"
                    placeholder="Search by Name"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <button className="btn btn-info sortbtn" onClick={handleSort}>
                    <p className='shortText'>Sort by Date</p> {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
            </div>

            <div className="table-container">
                <div className="table-responsive">
                    <table className="table table-bordered table-striped custom-table">
                        <thead>
                            <tr>
                                <th>User Name</th>
                                <th>Deduction (₹)</th>
                                <th>Date</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((transition, index) => (
                                    <tr key={index}>
                                        <td>
                                            <span className="ml-2">{transition.user?.name || 'N/A'}</span>
                                        </td>
                                        <td>{transition.deductionAmount ? transition.deductionAmount.toFixed(2) : '0.00'}</td>
                                        <td>{transition.Date ? new Date(transition.Date).toLocaleString() : 'N/A'}</td>
                                        <td>{calculateDuration(transition.startChatTime, transition.endingChatTime)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">
                                        <div>
                                            <p className='mb-0'>
                                                {searchTerm ? 'No results found for your search.' : 'There is no previous chat history.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="page-btn"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Previous
                        </button>
                        {visiblePages.map(page => (
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
                )}
            </div>
        </div>
    );
}

export default Wallet;