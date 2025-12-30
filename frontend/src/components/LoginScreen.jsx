import React, { useState } from 'react';

import './LoginScreen.css';

const LoginScreen = ({ onJoin }) => {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim() && roomId.trim()) {
            onJoin(username, roomId);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card animate-fade-in-up">
                <div className="login-header">
                    <div className="login-logo-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="login-logo-svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                        </svg>
                    </div>
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Join your workspace</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            placeholder="e.g. Alex"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="room">Room ID</label>
                        <input
                            id="room"
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="form-input"
                            placeholder="e.g. Updates"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="login-button"
                    >
                        Start Chatting
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
