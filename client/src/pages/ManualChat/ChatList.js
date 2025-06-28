"use client"

import { MdSearch } from "react-icons/md"



const ChatList = ({
  searchTerm,
  onSearchChange,
  filteredChats,
  currentRoomId,
  connectedProviders,
  selectedProviderIds,
  userData,
  onChatSelection,
  getParticipantNames,
}) => {
  return (
    <div className="chat-list-container bg-white border-end h-100">
      <div className="chat-list-header p-3 border-bottom">
        <h4 className="mb-3">Group Chats</h4>
        <div className="search-container position-relative">
          <input
            type="search"
            className="form-control ps-5"
            placeholder="Search group chats..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <MdSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
        </div>
      </div>

      <div className="chat-list overflow-auto" style={{ height: "calc(100vh - 140px)" }}>
        {filteredChats.length > 0 ? (
          filteredChats.map((chat, index) => (
            <div
              key={chat._id || index}
              className={`chat-list-item p-3 border-bottom cursor-pointer ${
                currentRoomId === chat._id ? "bg-primary bg-opacity-10 border-primary" : ""
              }`}
              onClick={() => onChatSelection(chat._id, chat)}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-start">
                <div className="avatar me-3 position-relative">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat?.groupName || "Group")}&background=random`}
                    alt={chat?.groupName || "Group Chat"}
                    className="rounded-circle"
                    width="48"
                    height="48"
                  />
                  <span
                    className={`position-absolute bottom-0 end-0 rounded-circle border border-2 border-white ${
                      connectedProviders.size > 0 ? "bg-success" : "bg-secondary"
                    }`}
                    style={{ width: "12px", height: "12px" }}
                  ></span>
                </div>

                <div className="chat-info flex-grow-1 min-w-0">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div className="chat-name fw-semibold text-truncate">{chat?.groupName || "Group Chat"}</div>
                    {chat?.messages?.length > 0 && (
                      <div className="message-time text-muted small">
                        {new Date(chat?.messages[chat?.messages.length - 1]?.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>

                  <div className="participants text-muted small mb-1">{getParticipantNames(chat)}</div>

                  <div className="last-message text-muted small text-truncate">
                    {chat?.messages?.[chat?.messages.length - 1]?.text ||
                      (chat?.messages?.[chat?.messages.length - 1]?.file ? "📎 File Attached" : "No messages yet")}
                  </div>

                  {userData?.role === "user" && (
                    <div className="provider-count text-success small mt-1">
                      {connectedProviders.size}/{selectedProviderIds.length} online
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-chats text-center p-4">
            <div className="text-muted">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 opacity-50">
                <path
                  d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272V21L8.87279 20C9.94066 20.6336 10.9393 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mb-0">No group chats found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatList
