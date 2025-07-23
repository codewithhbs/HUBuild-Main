
import { Dropdown } from "react-bootstrap"
import { MdArrowBack, MdPhone, MdExpandMore } from "react-icons/md"


const ChatHeader = ({
  isMobileView,
  onBackToList,
  selectedChat,
  userData,
  connectedProviders,
  selectedProviderIds,
  groupMembers,
  onCallMember,
}) => {
  return (
    <div className="chat-header bg-white border-bottom p-3">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          {isMobileView && (
            <button className="btn btn-link p-0 me-3 text-dark" onClick={onBackToList} aria-label="Back to chat list">
              <MdArrowBack size={24} />
            </button>
          )}

          <div className="d-flex align-items-center">
            <div className="avatar me-3">
              {selectedChat && (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat?.groupName || "Group")}&background=random`}
                  alt={selectedChat?.groupName || "Group Chat"}
                  className="rounded-circle"
                  width="40"
                  height="40"
                />
              )}
            </div>
            <div className="user-details">
              <div className="user-name fw-semibold">{selectedChat?.groupName || "Group Chat"}</div>
              <div className="user-status text-muted small">
                {userData?.role === "user"
                  ? `${connectedProviders.size}/${selectedProviderIds.length} providers online`
                  : `Group Chat`}
              </div>
            </div>
          </div>
        </div>

        {/* Call Members Dropdown */}
        <div className="chat-actions">
          {groupMembers.length > 0 && (
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-primary"
                id="call-members-dropdown"
                size="sm"
                className="d-flex align-items-center"
              >
                <MdPhone className="me-1 me-md-2" />
                <span className="d-none d-md-inline">Call Member</span>
                <MdExpandMore className="ms-1" />
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Header>Group Members</Dropdown.Header>
                {groupMembers.map((member) => (
                  <Dropdown.Item
                    key={member.id}
                    onClick={() => onCallMember(member, selectedChat)}
                    className="d-flex align-items-center justify-content-between"
                  >
                    <div>
                      <div className="fw-semibold">{member.name}</div>
                      <small className="text-muted text-capitalize">{member.role}</small>
                    </div>
                    <MdPhone className="text-success" />
                  </Dropdown.Item>
                ))}
                {groupMembers.length === 0 && <Dropdown.Item disabled>No other members in this group</Dropdown.Item>}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
