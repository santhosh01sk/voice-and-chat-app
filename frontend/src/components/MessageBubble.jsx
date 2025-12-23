import React from 'react';
import classNames from 'classnames';

const MessageBubble = ({ message, isOwnMessage }) => {
    const { type, content, sender, fileUrl, timestamp } = message;

    const renderContent = () => {
        switch (type) {
            case 'IMAGE':
                return (
                    <div className="mt-2 mb-1">
                        <img src={fileUrl} alt="Shared" className="rounded-xl max-w-full max-h-[300px] object-cover cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => window.open(fileUrl, '_blank')} />
                        {content && <p className="mt-2 text-sm opacity-90">{content}</p>}
                    </div>
                );
            case 'VIDEO':
                return (
                    <div className="mt-2 mb-1 min-w-[250px]">
                        <video controls className="w-full rounded-xl max-h-[300px] bg-black/10">
                            <source src={fileUrl} />
                            Your browser does not support the video tag.
                        </video>
                        {content && <p className="mt-2 text-sm opacity-90">{content}</p>}
                    </div>
                );
            case 'AUDIO':
            case 'VOICE_MSG':
                return (
                    <div className={classNames("mt-2 mb-2 min-w-[250px]", {
                        "text-white": isOwnMessage,
                        "text-indigo-600": !isOwnMessage && type === 'VOICE_MSG'
                    })}>
                        <div className="flex items-center gap-3">
                            <div className={classNames("w-10 h-10 rounded-full flex items-center justify-center shrink-0", {
                                "bg-white/20": isOwnMessage,
                                "bg-indigo-100": !isOwnMessage
                            })}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
                            </div>
                            <audio controls className="w-full h-8 opacity-80 filter transition-all">
                                <source src={fileUrl} />
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                        {content && <p className="mt-1 text-xs opacity-90 italic">{content}</p>}
                    </div>
                );
            default:
                return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
        }
    };

    return (
        <div className={classNames("flex flex-col mb-4", {
            "items-end": isOwnMessage,
            "items-start": !isOwnMessage
        })}>
            {/* Sender Name */}
            {!isOwnMessage && (
                <span className="text-xs text-gray-400 ml-1 mb-1 font-medium">{sender}</span>
            )}

            <div className={classNames("relative p-4 rounded-2xl max-w-[70%] min-w-[100px] shadow-sm transition-all hover:shadow-md", {
                "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-none": isOwnMessage,
                "bg-white text-gray-700 border border-gray-100 rounded-bl-none": !isOwnMessage
            })}>

                {renderContent()}

                {/* Metadata */}
                <div className={classNames("text-[10px] text-right mt-1.5 font-medium flex justify-end items-center gap-1", {
                    "text-indigo-100": isOwnMessage,
                    "text-gray-400": !isOwnMessage
                })}>
                    <span>{timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
