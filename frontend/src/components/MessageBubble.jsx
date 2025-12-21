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
                return (
                    <div className="mt-2 mb-2 min-w-[250px]">
                        <audio controls className="w-full h-10">
                            <source src={fileUrl} />
                            Your browser does not support the audio element.
                        </audio>
                        {content && <p className="mt-1 text-sm opacity-90">{content}</p>}
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
