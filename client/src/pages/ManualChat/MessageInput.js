
import { MdAttachment, MdSend } from "react-icons/md"


const MessageInput = ({ message, onMessageChange, onSubmit, onFileChange, isChatEnded }) => {
  return (
    <div className="message-input-container bg-white border-top p-3">
      <form onSubmit={onSubmit} className="d-flex align-items-center gap-2">
        <input
          type="file"
          id="fileUpload"
          onChange={onFileChange}
          style={{ display: "none" }}
          disabled={isChatEnded}
          accept="image/*"
        />

        <label
          htmlFor="fileUpload"
          className={`btn btn-outline-secondary d-flex align-items-center justify-content-center ${
            isChatEnded ? "disabled" : ""
          }`}
          style={{ width: "40px", height: "40px" }}
        >
          <MdAttachment size={20} />
        </label>

        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={message}
          disabled={isChatEnded}
          onChange={(e) => onMessageChange(e.target.value)}
        />

        <button
          type="submit"
          className={`btn btn-primary d-flex align-items-center justify-content-center ${
            isChatEnded ? "disabled" : ""
          }`}
          disabled={isChatEnded || !message.trim()}
          style={{ width: "40px", height: "40px" }}
        >
          <MdSend size={20} />
        </button>
      </form>
    </div>
  )
}

export default MessageInput
