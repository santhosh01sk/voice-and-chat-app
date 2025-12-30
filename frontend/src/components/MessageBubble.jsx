import './MessageBubble.css';

const MessageBubble = ({ message, isOwnMessage, onDelete }) => {
    const { id, type, content, sender, fileUrl, timestamp } = message;

    const renderContent = () => {
        switch (type) {
            case 'IMAGE':
                return (
                    <div className="media-content">
                        <img src={fileUrl} alt="Shared" className="shared-image" onClick={() => window.open(fileUrl, '_blank')} />
                    </div>
                );
            case 'VIDEO':
                return (
                    <div className="video-content">
                        <video controls className="shared-video">
                            <source src={fileUrl} />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );
            case 'AUDIO':
            case 'VOICE_MSG':
                return (
                    <div className={`audio-wrapper ${isOwnMessage ? 'own' : (type === 'VOICE_MSG' ? 'voice-others' : '')}`}>
                        <div className="audio-content">
                            <div className={`audio-icon-box ${isOwnMessage ? 'own' : 'others'}`}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
                            </div>
                            <audio controls className="audio-player">
                                <source src={fileUrl} />
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                        {content && <p className="voice-meta-text">{content}</p>}
                    </div>
                );
            case 'APPLICATION':
            case 'TEXT':
            case 'DOCUMENT':
                return (
                    <div className="document-content">
                        <div className="document-card">
                            <div className="document-icon">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="document-info">
                                <a href={fileUrl} download={content} target="_blank" rel="noopener noreferrer" className="document-link">
                                    Download Document
                                </a>
                            </div>
                        </div>
                    </div>
                );
            default:
                if (fileUrl) {
                    return (
                        <div className="document-content">
                            <div className="document-card">
                                <div className="document-icon">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </div>
                                <div className="document-info">
                                    <a href={fileUrl} download={content} target="_blank" rel="noopener noreferrer" className="document-link">
                                        Open Attachment
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                }
                return <p className="message-text">{content}</p>;
        }
    };

    return (
        <div className={`message-container ${isOwnMessage ? 'own' : 'others'}`}>
            {/* Sender Name */}
            {!isOwnMessage && (
                <span className="sender-name">{sender}</span>
            )}

            <div className={`message-bubble ${isOwnMessage ? 'own' : 'others'}`}>
                {isOwnMessage && id && (
                    <button className="message-delete-btn" onClick={onDelete} title="Delete message">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {renderContent()}

                {/* Metadata */}
                <div className={`message-metadata ${isOwnMessage ? 'own' : 'others'}`}>
                    <span>{timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
