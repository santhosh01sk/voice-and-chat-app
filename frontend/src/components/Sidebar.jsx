import React, { useState } from 'react';
import axios from 'axios';

import './Sidebar.css';

const Sidebar = ({ username, roomId, groups, recentDMs, onLogout, onRoomChange, onSearchUser, theme, onThemeChange, themes }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showThemeOptions, setShowThemeOptions] = useState(false);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 0) {
            setIsSearching(true);
            try {
                const response = await axios.get(`http://localhost:9090/api/users/search?query=${query}`);
                setSearchResults(response.data.filter(u => u.username !== username));
            } catch (error) {
                console.error("Search failed:", error);
            }
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }
    };

    const handleCreateGroup = () => {
        const gName = prompt("Enter group name:");
        if (gName) {
            const gId = gName.toLowerCase().replace(/\s+/g, '-');
            onRoomChange(gId, true, gName);
        }
    };

    return (
        <div className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="user-profile">
                    <div className="user-avatar">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <h3 className="username">{username}</h3>
                        <span className="user-status">
                            <span className="status-dot"></span>
                            Online
                        </span>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => setShowThemeOptions(!showThemeOptions)} title="Theme" className={`action-button ${showThemeOptions ? 'active' : ''}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                    </button>
                    <button onClick={handleCreateGroup} title="Create Group" className="action-button">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                    <button onClick={onLogout} title="Logout" className="action-button logout">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
                    </button>
                </div>
            </div>

            {showThemeOptions && (
                <div className="theme-options-overlay">
                    {Object.keys(themes).map(t => (
                        <div
                            key={t}
                            className={`theme-dot ${theme === t ? 'active' : ''}`}
                            style={{ backgroundColor: themes[t].primary }}
                            onClick={() => onThemeChange(t)}
                            title={t.charAt(0).toUpperCase() + t.slice(1)}
                        />
                    ))}
                </div>
            )}

            {/* Search */}
            <div className="search-container">
                <div className="search-wrapper">
                    <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>
                    <input type="text" placeholder="Search users..." className="search-input" value={searchQuery} onChange={handleSearch} />
                </div>
            </div>

            <div className="sidebar-content custom-scrollbar">
                {isSearching ? (
                    <div>
                        <h4 className="section-title">Results</h4>
                        {searchResults.map(u => (
                            <div key={u.id} onClick={() => onSearchUser(u.username)} className="list-item">
                                <div className="item-icon p2p">{u.username.charAt(0).toUpperCase()}</div>
                                <span className="item-name p2p">{u.username}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            <div>
                                <h4 className="section-title">Groups</h4>
                                <div className="list-container">
                                    {/* Default General Group */}
                                    <div
                                        onClick={() => onRoomChange('general')}
                                        className={`list-item ${roomId === 'general' ? 'active' : ''}`}
                                    >
                                        <div className="item-icon general">
                                            <span className="icon-text general">G</span>
                                        </div>
                                        <div className="item-info">
                                            <span className="item-name">General</span>
                                            <span className="item-subtitle">Public Channel</span>
                                        </div>
                                    </div>

                                    {groups.map(g => (
                                        <div key={g.id} onClick={() => onRoomChange(g.roomId)} className={`list-item ${roomId === g.roomId ? 'active' : ''}`}>
                                            <div className="item-icon">
                                                {g.groupPicUrl ? <img src={g.groupPicUrl} className="w-full h-full object-cover" /> : <span className="icon-text">#</span>}
                                            </div>
                                            <span className="item-name">{g.name || g.roomId}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="section-title">Direct Messages</h4>
                                <div className="list-container">
                                    {recentDMs.map(u => {
                                        const names = [username, u.username].sort();
                                        const pRoomId = `p2p-${names[0]}-${names[1]}`;
                                        return (
                                            <div key={u.username} onClick={() => onSearchUser(u.username)} className={`list-item ${roomId === pRoomId ? 'active' : ''}`}>
                                                <div className="item-icon p2p">{u.username.charAt(0).toUpperCase()}</div>
                                                <span className="item-name p2p">{u.username}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
