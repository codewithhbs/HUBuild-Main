import React, { useState, useEffect, useRef } from 'react';
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
import './AllChatRoom.css';

function AllChatRoom() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedChat, setSelectedChat] = useState(null);
    const [showChatModal, setShowChatModal] = useState(false);
    const chatContainerRef = useRef(null);
    const itemsPerPage = 10;

    const handleFetchBanner = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('https://api.helpubuild.in/api/v1/get-all-chat-record');
            // console.log("all data", data.data)
            const filterData = data.data.filter((item) => item.isManualChat === false);
            setBanners(filterData.reverse() || []);
        } catch (error) {
            console.log('Error fetching chat records:');
            toast.error('Failed to load chat records. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchChat = async (chatRoomId) => {
        try {
            const { data } = await axios.get(`https://api.helpubuild.in/api/v1/get-chat-by-room/${chatRoomId}`);
            setSelectedChat(data.data[0]);
            setShowChatModal(true);
        } catch (error) {
            console.log('Error fetching chat:', error);
            toast.error('Failed to load chat messages');
        }
    };

    const handleDeleteBanner = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://api.helpubuild.in/api/v1/delete-chat-room/${id}`);
            handleFetchBanner();
            toast.success('Chat room deleted successfully!');
        } catch (error) {
            console.log('Error deleting chat room:', error);
            toast.error('Failed to delete the chat room. Please try again.');
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
                handleDeleteBanner(id);
            }
        });
    };

    useEffect(() => {
        handleFetchBanner();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [selectedChat]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = banners.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(banners.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const renderMessageContent = (message) => {
        if (message.file) {
            if (message.file.type.startsWith('image/')) {
                return (
                    <img
                        src={message.file.content}
                        alt={message.file.name}
                        className="chat-image"
                        style={{ maxWidth: '200px', borderRadius: '8px' }}
                    />
                );
            }
            return <a href={message.file.content} download={message.file.name}>{message.file.name}</a>;
        }
        return message.text;
    };

    const heading = ['S.No', 'Chat room', 'User Name', 'Provider Name', 'Action'];

    return (
        <>
            {loading ? (
                <div className="spin-style">
                    <CSpinner color="primary" variant="grow" />
                </div>
            ) : banners.length === 0 ? (
                <div className="no-data">
                    <p>No data available</p>
                </div>
            ) : (
                <>
                    <Table
                        heading="All Chat"
                        btnText=""
                        btnURL=""
                        tableHeading={heading}
                        tableContent={
                            currentData.map((item, index) => (
                                <CTableRow key={item._id}>
                                    <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                                    <CTableDataCell>
                                        <button
                                            className="btn btn-link text-primary"
                                            onClick={() => handleFetchChat(item?.room)}
                                        >
                                            {item?.room}
                                        </button>
                                    </CTableDataCell>
                                    <CTableDataCell>{item?.userId?.name}</CTableDataCell>
                                    <CTableDataCell>{item?.providerId?.name}</CTableDataCell>
                                    <CTableDataCell>
                                        <div className="action-parent">
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

                    {/* Chat Modal */}
                    {showChatModal && selectedChat && (
                        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                            {console.log("object", selectedChat?.messages)}
                            <div className="modal-dialog modal-dialog-centered modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header bg-primary text-white">
                                        <h5 className="modal-title">
                                            Chat between {selectedChat.userId?.name} and {selectedChat.providerId?.name}
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close btn-close-white"
                                            onClick={() => setShowChatModal(false)}
                                        ></button>
                                    </div>
                                    <div className="modal-body p-0">
                                        <div className="chat-container" ref={chatContainerRef}>
                                            {selectedChat.messages && selectedChat.messages.length > 0 ? (
                                                selectedChat.messages.map((message, index) => {
                                                    const isUser = message.sender === selectedChat.userId._id;
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`message ${isUser ? 'user' : 'provider'}`}
                                                        >
                                                            <div className="message-content">
                                                                <div className="message-sender">
                                                                    {isUser ? selectedChat.userId.name : selectedChat.providerId.name}
                                                                </div>
                                                                <div className="message-bubble">
                                                                    {renderMessageContent(message)}
                                                                </div>
                                                                <div className="message-time">
                                                                    {formatTimestamp(message.timestamp)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="no-messages">
                                                    <p>No conversation started yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
}

export default AllChatRoom;
