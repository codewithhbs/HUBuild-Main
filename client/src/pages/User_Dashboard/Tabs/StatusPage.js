import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from "sweetalert2"

import { GetData } from '../../../utils/sessionStoreage';
import toast from 'react-hot-toast';
import './statuts.css'
function StatusPage() {
    const Data = GetData('user');
    const UserData = JSON.parse(Data);
    const providerId = UserData?._id;
    const [statuses, setStatuses] = useState({
        chatStatus: "",
        callStatus: "",

    });

    const handleFetchProvider = async () => {
        try {
            const { data } = await axios.get(
                `http://localhost:5000/api/v1/get-single-provider/${providerId}`
            );
            const allData = data.data;
            setStatuses({
                chatStatus: allData.chatStatus || '',
                callStatus: allData.callStatus || '',

            });
        } catch (error) {
            console.log('Error fetching provider data', error);
            toast.error('Failed to fetch profile data.');
        }
    };

    useEffect(() => {
        handleFetchProvider();
    }, [])

    const handleToggle = async (statusType) => {
        const updatedStatus = !statuses[statusType];
        const previousStatuses = { ...statuses };
        setStatuses({ ...statuses, [statusType]: updatedStatus });

        try {
            const response = await axios.put(
                `http://localhost:5000/api/v1/update-available-status/${providerId}`,
                { [statusType]: updatedStatus }
            );
            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: `${response.data.message}`,
                })

            } else {
                // toast.error('Failed to update status');
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to update status',
                    icon: 'error', // use lowercase
                    confirmButtonText: 'Okay'
                });
                setStatuses(previousStatuses); // Revert to previous state on failure
            }
        } catch (error) {
            console.log('Internal server error', error);
            // toast.error('Error updating status');
            Swal.fire({
                    title: 'Error!',
                    text: 'Error updating status',
                    icon: 'error', // use lowercase
                    confirmButtonText: 'Okay'
                  });
            setStatuses(previousStatuses); // Revert to previous state on failure
        }
    };


    return (
        <div className="provider-section">
            <h1 className="provider-heading">Provider Availability Status</h1>

            <div className="provider-grid">
                <div className="provider-card">
                    <div className="provider-card-content">
                        <div className="provider-image-container">
                            <img
                                src="https://img.freepik.com/premium-vector/chat-symbol-talk-dialogue-messenger-online-support-concept_370567-1990.jpg"
                                alt="Chat icon"
                                className="provider-image"
                            />
                        </div>
                        <h3 className="provider-title">Chat</h3>
                        <label className="provider-toggle">
                            <input
                                type="checkbox"
                                checked={statuses.chatStatus}
                                onChange={() => handleToggle('chatStatus')}
                            />
                            <span className="provider-toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="provider-card">
                    <div className="provider-card-content">
                        <div className="provider-image-container">
                            <img
                                src="https://img.freepik.com/free-vector/telephone-call-icon-3d-vector-illustration-social-media-symbol-networking-sites-apps-cartoon-style-isolated-white-background-online-communication-digital-marketing-concept_778687-1734.jpg?w=360"
                                alt="Call icon"
                                className="provider-image"
                            />
                        </div>
                        <h3 className="provider-title">Call</h3>
                        <label className="provider-toggle call">
                            <input
                                type="checkbox"
                                checked={statuses.callStatus}
                                onChange={() => handleToggle('callStatus')}
                            />
                            <span className="provider-toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatusPage;
