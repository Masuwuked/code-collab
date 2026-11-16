import React, { useState, useEffect, useRef } from 'react';
import ACTIONS from '../Actions';

const ChatDrawer = ({ isOpen, onClose, socketRef, roomId, username }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleChatMessage = (payload) => {
      setMessages((prev) => [...prev, payload]);
    };

    socket.on(ACTIONS.CHAT_MESSAGE, handleChatMessage);

    return () => {
      socket.off(ACTIONS.CHAT_MESSAGE, handleChatMessage);
    };
  }, [socketRef]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !socketRef.current) return;

    const payload = {
      roomId,
      message: text,
      username,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socketRef.current.emit(ACTIONS.CHAT_MESSAGE, payload);
    setText('');
  };

  if (!isOpen) return null;

  return (
    <div className="chatDrawerOverlay">
      <div className="chatDrawer">
        <div className="chatHeader">
          <div className="chatTitle">
            <span>💬</span>
            <h3>Team Room Chat</h3>
          </div>
          <button className="closeDrawerBtn" onClick={onClose}>✕</button>
        </div>

        <div className="chatMessagesList">
          {messages.length === 0 ? (
            <div className="chatEmpty">
              No messages yet in this room. Say hello to your collaborators!
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.username === username;
              return (
                <div key={index} className={`chatBubbleWrap ${isMe ? 'isMe' : 'isPeer'}`}>
                  <div className="chatSenderInfo">
                    <span className="chatAuthor">{msg.username}</span>
                    <span className="chatTime">{msg.timestamp}</span>
                  </div>
                  <div className="chatBubble">{msg.message}</div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatInputForm" onSubmit={sendMessage}>
          <input
            type="text"
            className="chatTextInput"
            placeholder="Type a message to the room..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="chatSendBtn">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatDrawer;
