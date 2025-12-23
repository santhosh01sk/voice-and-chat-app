import React, { useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import axios from 'axios';
import VoiceRecorder from './VoiceRecorder';

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

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
            {/* Simple dot pattern bg */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-gray-100 z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden">
                        {isGroup && groupData?.groupPicUrl ? (
                            <img src={groupData.groupPicUrl} alt="Group" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl font-bold text-indigo-600">#</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            {isGroup ? (groupData?.name || roomId) : roomId}
                            <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                {isGroup ? 'Group' : 'Direct'}
                            </span>
                        </h2>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {onlineCount} active participants
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {callStatus === 'idle' ? (
                        <button
                            onClick={onStartCall}
                            className="w-10 h-10 rounded-full hover:bg-indigo-50 flex items-center justify-center text-indigo-600 transition-colors"
                            title="Voice Call"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                            <span className="text-xs font-bold text-indigo-600 animate-pulse">
                                {callStatus === 'outgoing' ? 'Calling...' :
                                    callStatus === 'incoming' ? `Incoming: ${caller}` :
                                        'In Call'}
                            </span>
                            {callStatus === 'incoming' && (
                                <button onClick={onAcceptCall} className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </button>
                            )}
                            <button onClick={onEndCall} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    )}
                    {isGroup && (
                        <div className="relative group">
                            <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block transition-all z-20 overflow-hidden">
                                <button onClick={handleAddMember} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                    Add Member
                                </button>
                                <button onClick={handleChangePic} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Change Picture
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 z-10 custom-scrollbar space-y-4">
                {messages.map((msg, index) => {
                    if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
                        return (
                            <div key={index} className="flex justify-center my-4">
                                <span className="bg-white/60 backdrop-blur border border-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
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
            <div className="p-6 bg-white border-t border-gray-100 z-20">
                {isRecording ? (
                    <VoiceRecorder
                        onSend={(file) => {
                            onVoiceSend(file);
                            setIsRecording(false);
                        }}
                        onCancel={() => setIsRecording(false)}
                    />
                ) : (
                    <div className="bg-gray-50 p-2 pl-4 rounded-2xl flex items-center gap-4 border border-gray-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={onFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 rounded-xl bg-gray-200 hover:bg-indigo-100 hover:text-indigo-600 text-gray-500 flex items-center justify-center transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        </button>

                        <button
                            onClick={() => setIsRecording(true)}
                            className="w-10 h-10 rounded-xl bg-gray-200 hover:bg-indigo-100 hover:text-indigo-600 text-gray-500 flex items-center justify-center transition-all"
                            title="Record Voice"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </button>

                        <input
                            type="text"
                            placeholder="Write a message..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder:text-gray-400 font-medium"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            onClick={onSendMessage}
                            disabled={!messageInput.trim()}
                            className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95"
                        >
                            <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatWindow;
