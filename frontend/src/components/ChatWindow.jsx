import React, { useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import axios from 'axios';
import VoiceRecorder from './VoiceRecorder';

import './ChatWindow.css';

const ChatWindow = ({
    messages,
    currentUser,
    roomId,
    onlineCount,
    messageInput,
    setMessageInput,
    onSendMessage,
    onFileUpload,
    onVoiceSend,
    onStartCall,
    onEndCall,
    onAcceptCall,
    callStatus,
    caller
}) => {
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isGroup, setIsGroup] = useState(false);
    const [groupData, setGroupData] = useState(null);
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const response = await axios.get(`http://localhost:9090/api/groups/${roomId}`);
                if (response.data) {
                    setIsGroup(true);
                    setGroupData(response.data);
                } else {
                    setIsGroup(false);
                }
            } catch {
                setIsGroup(false);
            }
        };
        fetchGroup();
    }, [roomId]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSendMessage();
        }
    };

    const handleAddMember = async () => {
        const username = prompt("Enter username to add:");
        if (username) {
            try {
                await axios.post(`http://localhost:9090/api/groups/${roomId}/members?username=${username}`);
                alert("Member added!");
            } catch (error) {
                alert("Failed to add member.");
            }
        }
    };

    const handleChangePic = async () => {
        const picUrl = prompt("Enter new picture URL:");
        if (picUrl) {
            try {
                const response = await axios.put(`http://localhost:9090/api/groups/${roomId}/pic?picUrl=${encodeURIComponent(picUrl)}`);
                setGroupData(response.data);
            } catch (error) {
                alert("Failed to update picture.");
            }
        }
    };

    const getDisplayName = () => {
        if (isGroup) return groupData?.name || roomId;
        if (roomId.startsWith('p2p-')) {
            const participants = roomId.replace('p2p-', '').split('-');
            return participants.find(p => p !== currentUser) || roomId;
        }
        return roomId.charAt(0).toUpperCase() + roomId.slice(1);
    };

    return (
        <div className="chat-window">
            {/* Simple dot pattern bg */}
            <div className="chat-bg-pattern"></div>

            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="chat-avatar">
                        {isGroup && groupData?.groupPicUrl ? (
                            <img src={groupData.groupPicUrl} alt="Group" className="chat-avatar-img" />
                        ) : (
                            <span className="chat-avatar-text">
                                {getDisplayName().charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="chat-title-group">
                        <h2 className="chat-title">
                            {getDisplayName()}
                            {isGroup && (
                                <span className="badge-group">
                                    Group
                                </span>
                            )}
                        </h2>
                        <span className="chat-status">
                            <span className="online-dot animate-pulse"></span>
                            {isGroup ? `${onlineCount} members online` : ''}
                        </span>
                    </div>
                </div>

                <div className="chat-actions">
                    {callStatus === 'idle' ? (
                        <button
                            onClick={onStartCall}
                            className="action-btn"
                            title="Voice Call"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </button>
                    ) : (
                        <div className="call-info-badge">
                            <span className="call-status-text animate-pulse">
                                {callStatus === 'outgoing' ? 'Calling...' :
                                    callStatus === 'incoming' ? `Incoming: ${caller}` :
                                        'In Call'}
                            </span>
                            {callStatus === 'incoming' && (
                                <button onClick={onAcceptCall} className="call-action-btn call-accept">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </button>
                            )}
                            <button onClick={onEndCall} className="call-action-btn call-end">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    )}
                    {isGroup && (
                        <div className="more-actions-container">
                            <button className="action-btn">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                            </button>
                            <div className="dropdown-menu">
                                <button onClick={handleAddMember} className="dropdown-item">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                    Add Member
                                </button>
                                <button onClick={handleChangePic} className="dropdown-item">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Change Picture
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="messages-area custom-scrollbar">
                {messages.map((msg, index) => {
                    if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
                        return (
                            <div key={index} className="system-message">
                                <span className="system-message-badge">
                                    {msg.sender} {msg.type === 'JOIN' ? 'entered the room' : 'left the room'}
                                </span>
                            </div>
                        );
                    }
                    return (
                        <MessageBubble
                            key={index}
                            message={msg}
                            isOwnMessage={msg.sender === currentUser}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-area">
                {isRecording ? (
                    <VoiceRecorder
                        onSend={(file) => {
                            onVoiceSend(file);
                            setIsRecording(false);
                        }}
                        onCancel={() => setIsRecording(false)}
                    />
                ) : (
                    <div className="input-container">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={onFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="attach-btn"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        </button>

                        <button
                            onClick={() => setIsRecording(true)}
                            className="voice-btn"
                            title="Record Voice"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </button>

                        <input
                            type="text"
                            placeholder="Write a message..."
                            className="chat-input"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            onClick={onSendMessage}
                            disabled={!messageInput.trim()}
                            className="send-btn"
                        >
                            <svg className="send-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;
