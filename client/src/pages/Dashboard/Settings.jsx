import React, { useState } from 'react';
import './Settings.css'; // Import custom CSS for styling
import ProfileUpdate from './ProfileUpdate';
import RechargeHistory from './RechargeHistory';
import ChatDeductionHistory from './ChatDeductionHistory';
import UserForgetPassword from './UserForgetPassword';

function Settings({ myProfile }) {
    const tabs = [
        { id: 1, title: 'Profile', content: 'Tab 1 content' },
        { id: 4, title: 'Forget Password', content: 'Share your profile with others' },
        { id: 2, title: 'Recharge History', content: 'Tab 2 content' },
        { id: 3, title: 'Chat Deductions History', content: 'Tab 3 content' },
        // { id: 5, title: 'Enquiry', content: 'Tab 3 content' }
    ];

    const [activeTab, setActiveTab] = useState(tabs[0].id);

    const handleTabClick = (id) => {
        setActiveTab(id);
    };

    return (
        <>
            <ul className="nav w-100 mt-4 nav-pills mb-4 justify-content-evenly gap-2" id="ex1" role="tablist">
                {tabs.map((tab) => (
                    <li className="nav-item" role="presentation" key={tab.id}>
                        <a
                            className={`nav-link border-outline-dark as_btn ${activeTab === tab.id ? 'active' : ''}`}
                            href="#!"
                            onClick={() => handleTabClick(tab.id)}
                            role="tab"
                            aria-controls={`ex3-tabs-${tab.id}`}
                            aria-selected={activeTab === tab.id}
                        >
                            {tab.title}
                        </a>
                    </li>
                ))}
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 1 && <ProfileUpdate />}
                {activeTab === 2 && <RechargeHistory />}
                {activeTab === 3 && <ChatDeductionHistory />}
                {activeTab === 4 && <UserForgetPassword />}
                {/* {activeTab === 5 && <></>} */}
            </div>
        </>
    )
}

export default Settings
