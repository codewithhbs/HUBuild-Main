import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';
import { MdAttachment } from "react-icons/md";
import ScrollToBottom from 'react-scroll-to-bottom';

const ENDPOINT = 'https://api.dessobuild.com/';

const Chat = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [socketId, setSocketId] = useState('');
  const [messages, setMessages] = useState([]); // Array to store all chat messages
  const [file, setFile] = useState(null); // State for file attachments
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // console.log('Selected File:', file);
    }
  };

  const token = 'djf9233hcdmw2108djo291jdkdow29hf';
  const user = {
    _id: "fjoeij09rj290jef",
    name: 'Hitesh Yadav',
  }

  const astrologerId = 'kfj209jfidj903jsw0'

  const socket = useMemo(() => io(ENDPOINT, { autoConnect: false }), []); // Correct usage

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      // console.log('Connected!', socket.id);
      setSocketId(socket.id);

      const room = `${user._id}_${astrologerId}`;
      socket.emit('join_room', { userId: user._id, astrologerId: astrologerId });
    });

    socket.on('return_message', (data) => {
      // console.log('Message received:', data);

      if (data.senderId !== socketId) {
        setMessages((prev) => [...prev, data]);
      }
    });


    return () => {
      socket.off('connect');
      socket.off('return_message');
      socket.disconnect();
    };
  }, [socket, astrologerId]);


  const handleSubmit = (e) => {
    e.preventDefault();

    const room = `${user._id}_${astrologerId}`;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = { name: file.name, type: file.type, content: reader.result };
        socket.emit('file_upload', { room, fileData, senderId: socketId });

        setMessages((prev) => [
          ...prev,
          { text: message, file: fileData, sender: 'self' },
        ]);
        setFile(null);
      };
      reader.readAsDataURL(file);
    } else if (message.trim()) {
      const payload = { room, message, senderId: socketId };
      socket.emit('message', payload);

      // Add the message to the state as "self"
      setMessages((prev) => [...prev, { text: message, sender: 'self' }]);
      setMessage('');
    }
  };


  return (
    <>
      <div className='chat-main-section hitesh_styling'>
        <div className="chat-container">
          <div className="chat-header">
            <h2>Welcome to Chat {socketId}</h2>
          </div>
          <div className="chat-body">
            <ScrollToBottom className="chat-messages">
              {messages.map((msg, index) => (
                <li
                  key={index}
                  className={`chat-message ${msg.sender === 'self' ? 'self' : 'other'}`}
                >
                  {msg.text}
                  {msg.file && (
                    <div>
                      {msg.file.type.startsWith('image/') ? (
                        <img
                          src={msg.file.content}
                          alt={msg.file.name}
                          className="chat-attachment"
                        />
                      ) : (
                        <a href={msg.file.content} download={msg.file.name}>
                          Download {msg.file.name}
                        </a>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ScrollToBottom>
          </div>
          <form onSubmit={handleSubmit} className="chat-form">
            <input
              type="text"
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message..."
              name="message"
              value={message}
              className="chat-input"
            />
            {/* <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="chat-file-input"
          width={40}
        /> */}
            <div className="attachment_icon position-relative" onClick={() => setIsPopupOpen(true)}>
              <MdAttachment className="icon" />
              {/* Popup Modal */}
              {isPopupOpen && (
                <div className="popup">
                  <div className="popup-content">
                    <h3 style={{ whiteSpace: 'nowrap' }}>Select File</h3>
                    <button
                      className="popup-option"
                      onClick={() => document.getElementById('imageInput').click()}
                    >
                      Select Image
                    </button>
                    <button
                      className="popup-option"
                      onClick={() => document.getElementById('videoInput').click()}
                    >
                      Select Video
                    </button>
                    <button
                      className="popup-option"
                      onClick={() => document.getElementById('documentInput').click()}
                    >
                      Select Document
                    </button>
                    <button className="popup-close" onClick={() => setIsPopupOpen(false)}>
                      Close
                    </button>
                  </div>

                  {/* Hidden File Inputs */}
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <input
                    type="file"
                    id="videoInput"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <input
                    type="file"
                    id="documentInput"
                    accept=".pdf,.doc,.docx,.txt"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
            <button type="submit" className="chat-send-button">
              Send
            </button>
          </form>
        </div>
      </div>
    </>

  );
};

export default Chat;
