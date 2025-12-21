import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({
    messages,
    currentUser,
    roomId,
    onlineCount,
    messageInput,
    setMessageInput,
    onSendMessage,
    onFileUpload
}) => {
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSendMessage();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
            {/* Simple dot pattern bg */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-gray-100 z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center">
                        <span className="text-xl font-bold text-indigo-600">#</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            {roomId}
                            <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Channel</span>
                        </h2>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {onlineCount} active participants
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </button>
                    <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                    </button>
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
                <div className="bg-gray-50 p-2 pl-4 rounded-2xl flex items-center gap-4 border border-gray-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm">
                    {/* File Upload */}
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
            </div>
        </div>
    );
};

export default ChatWindow;
