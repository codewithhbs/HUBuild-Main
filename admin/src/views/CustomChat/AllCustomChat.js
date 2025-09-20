import React, { useState, useEffect, useRef } from 'react';
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
    CPagination,
    CPaginationItem,
    CNavLink,
} from '@coreui/react';
import Table from '../../components/Table/Table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './AllChatRoom.css';

const AllCustomChat = () => {
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
            const { data } = await axios.get('https://testapi.dessobuild.com/api/v1/get-all-chat-record');
            const filterData = data.data.filter((item) => item.isManualChat === true);
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
            const { data } = await axios.get(`https://testapi.dessobuild.com/api/v1/get-group-chat-by-id/${chatRoomId}`);
            setSelectedChat(data.data[0]);
            setShowChatModal(true);
        } catch (error) {
            console.log('Error fetching chat:', error);
            toast.error('Failed to load chat messages');
        }
    };

    const handleUpdateIsChatEnded = async (id, isChatEnded) => {
        const updatedField = !isChatEnded;
        try {
            const { data } = await axios.put(
                `https://testapi.dessobuild.com/api/v1/update_manual_chat_ended/${id}`,
                { isGroupChatEnded: updatedField }
            );
            handleFetchBanner();
            toast.success(`Project is ${updatedField ? 'Closed' : "Reopend"}`);
        } catch (error) {
            console.log("Internal server error", error);
        }
    };

    const handleDeleteBanner = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://testapi.dessobuild.com/api/v1/delete-chat-room/${id}`);
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
            if (message.file.type && message.file.type.startsWith('image/')) {
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

    // Helper function to get sender name
    const getSenderName = (senderId, selectedChat) => {
        if (senderId === selectedChat.userId._id) {
            return selectedChat.userId.name;
        }
        
        // Find the provider who sent this message
        const provider = selectedChat.providerIds.find(provider => provider._id === senderId);
        return provider ? provider.name : 'Unknown';
    };

    // Helper function to determine if sender is user
    const isMessageFromUser = (senderId, selectedChat) => {
        return senderId === selectedChat.userId._id;
    };

    const heading = ['S.No', 'Group Name', 'Chat Room', 'User Name', 'Providers Name', 'isChatEnded', 'Action'];

    return (
        <>
            {loading ? (
                <div className="spin-style">
                    <CSpinner color="primary" variant="grow" />
                </div>
            ) : (
                <>
                    <Table
                        heading="All Chat"
                        btnText="Create Chat Room"
                        btnURL="/project/add_project"
                        tableHeading={heading}
                        tableContent={
                            currentData.map((item, index) => (
                                <CTableRow key={item._id}>
                                    <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                                    <CTableDataCell>{item?.groupName || 'N/A'}</CTableDataCell>
                                    <CTableDataCell>
                                        <button
                                            className="btn btn-link text-primary"
                                            onClick={() => handleFetchChat(item?._id)}
                                        >
                                            {item?._id}
                                        </button>
                                    </CTableDataCell>
                                    <CTableDataCell>{item?.userId?.name}</CTableDataCell>
                                    <CTableDataCell>
                                        {item?.providerIds && item?.providerIds.map((provider) => provider.name).join(', ')}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <button
                                            className={`btn btn-sm ${item.isGroupChatEnded ? 'btn-danger' : 'btn-success'}`}
                                            onClick={() => handleUpdateIsChatEnded(item._id, item.isGroupChatEnded)}
                                        >
                                            {item.isGroupChatEnded ? 'Reopen Chat' : 'End Chat'}
                                        </button>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <div className="action-parent">
                                            <CNavLink href={`#/project/edit_project/${item._id}`} className='edit'>
                                                <i className="ri-pencil-fill"></i>
                                            </CNavLink>
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

                    {/* Chat Modal - Updated for Group Chat */}
                    {showChatModal && selectedChat && (
                        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header bg-primary text-white">
                                        <h5 className="modal-title">
                                            Group Chat: {selectedChat.groupName} 
                                            <small className="d-block">
                                                User: {selectedChat.userId?.name} | 
                                                Providers: {selectedChat.providerIds?.map(p => p.name).join(', ')}
                                            </small>
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
                                                    const isUser = isMessageFromUser(message.sender, selectedChat);
                                                    const senderName = getSenderName(message.sender, selectedChat);
                                                    
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`message ${isUser ? 'user' : 'provider'}`}
                                                        >
                                                            <div className="message-content">
                                                                <div className="message-sender">
                                                                    {senderName}
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
};

export default AllCustomChat;