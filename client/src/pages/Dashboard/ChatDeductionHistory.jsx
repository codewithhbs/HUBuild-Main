import React, { useEffect, useState } from 'react';
import { GetData } from '../../utils/sessionStoreage';
import axios from 'axios';

function ChatDeductionHistory() {
    const [data, setChat] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Number of items per page

    const Data = GetData('user');
    const token = GetData('token');
    const UserData = JSON.parse(Data);

    const fetchChatDeduction = async () => {
        try {
            const UserId = UserData?._id;
            const { data } = await axios.get(`http://localhost:5000/api/v1/get-single-user/${UserId}`);
            const chatHistory = data.data?.chatTransition;
            setChat(chatHistory.reverse());
        } catch (error) {
            console.log("Internal server error", error);
        }
    };

    useEffect(() => {
        fetchChatDeduction();
    }, []);

    // Function to format the start and end chat time
    const formatChatTime = (time) => {
        const date = new Date(time);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    // Function to calculate the duration between start and end times
    const calculateDuration = (startChatTime, endChatTime) => {
        const startTime = new Date(startChatTime);
        const endTime = new Date(endChatTime);
        const durationInMilliseconds = endTime - startTime;

        const totalSeconds = Math.floor(durationInMilliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes} min ${seconds} sec`;
    };


    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(data.length / itemsPerPage);

    const pageNumbersToShow = 5; // Number of page numbers to display
    const startPage = Math.max(1, currentPage - Math.floor(pageNumbersToShow / 2));
    const endPage = Math.min(totalPages, startPage + pageNumbersToShow - 1);
    const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="my-5">
            <h2 className="text-center mb-4">Chat Deduction History</h2>

            <div className="table-responsive">
                {data && data.length > 0 ? (
                    <>
                        <table className="table table-bordered table-hover">
                            <thead style={{ backgroundColor: '#093369', color: 'white' }}>
                                <tr>
                                    <th>#</th>
                                    <th>Start Time</th>
                                    <th>Starting Amount</th>
                                    <th>Provider Price Per Minute</th>
                                    <th>Ending Amount</th>
                                    <th>Deduction</th>
                                    <th>End Time</th>
                                    <th>Duration (mins)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((chat, index) => (
                                    <tr key={chat._id}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>{formatChatTime(chat.startChatTime)}</td>
                                        <td>₹{chat.startingChatAmount ? chat.startingChatAmount.toFixed(2) : 'N/A'}</td>
                                        <td>₹{chat.providerPricePerMin}</td>
                                        <td>₹{chat.endingChatAmount ? chat.endingChatAmount.toFixed(2) : 'N/A'}</td>
                                        <td>₹{chat.deductionAmount ? chat.deductionAmount.toFixed(2) : '0.00'}</td>
                                        <td>{chat.endingChatTime ? formatChatTime(chat.endingChatTime) : 'N/A'}</td>
                                        <td>
                                            {chat.startChatTime && chat.endingChatTime
                                                ? calculateDuration(chat.startChatTime, chat.endingChatTime)
                                                : 'N/A'}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="pagination d-flex justify-content-center mt-3">
                            <button
                                className="btn btn-outline-primary mx-1"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                Previous
                            </button>
                            {visiblePages.map((page) => (
                                <button
                                    key={page}
                                    className={`btn btn-outline-primary mx-1 ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                className="btn btn-outline-primary mx-1"
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <p>No chat history available.</p>
                )}
            </div>
        </div>
    );
}

export default ChatDeductionHistory;
