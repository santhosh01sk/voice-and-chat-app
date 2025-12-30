import './MessageBubble.css';

const MessageBubble = ({ message, isOwnMessage }) => {
    const { type, content, sender, fileUrl, timestamp } = message;

    const renderContent = () => {
        switch (type) {
            case 'IMAGE':
                return (
                    <div className="media-content">
                        <img src={fileUrl} alt="Shared" className="shared-image" onClick={() => window.open(fileUrl, '_blank')} />
                        {content && <p className="media-caption">{content}</p>}
                    </div>
                );
            case 'VIDEO':
                return (
                    <div className="media-content min-w-[250px]">
                        <video controls className="shared-video">
                            <source src={fileUrl} />
                            Your browser does not support the video tag.
                        </video>
                        {content && <p className="media-caption">{content}</p>}
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
            default:
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
