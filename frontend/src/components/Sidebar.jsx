import React, { useState } from 'react';
import axios from 'axios';

const Sidebar = ({ username, roomId, groups, recentDMs, onLogout, onRoomChange, onSearchUser }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

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
        <div className="w-[28%] min-w-[280px] bg-white border-r border-gray-100 flex flex-col h-full shadow-lg z-20">
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm w-24 truncate">{username}</h3>
                        <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Online
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCreateGroup} title="Create Group" className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                    <button onClick={onLogout} title="Logout" className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="px-6 mb-4">
                <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-transparent focus-within:border-indigo-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                    <svg viewBox="0 0 24 24" width="20" height="20" className="text-gray-400" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>
                    <input type="text" placeholder="Search users..." className="bg-transparent border-none focus:outline-none w-full text-sm text-gray-700 placeholder:text-gray-400 font-medium" value={searchQuery} onChange={handleSearch} />
                </div>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar px-3 pb-4 space-y-6">
                {isSearching ? (
                    <div>
                        <h4 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Results</h4>
                        {searchResults.map(u => (
                            <div key={u.id} onClick={() => onSearchUser(u.username)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 cursor-pointer transition-all">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">{u.username.charAt(0).toUpperCase()}</div>
                                <span className="text-gray-700 font-medium">{u.username}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div>
                            <h4 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Groups</h4>
                            <div className="space-y-1">
                                {/* Default General Group */}
                                <div
                                    onClick={() => onRoomChange('general')}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${roomId === 'general' ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                        <span className="text-indigo-600 font-bold font-serif italic text-lg opacity-80">G</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-900 font-bold truncate">General</span>
                                        <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Public Channel</span>
                                    </div>
                                </div>

                                {groups.map(g => (
                                    <div key={g.id} onClick={() => onRoomChange(g.roomId)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${roomId === g.roomId ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50'}`}>
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {g.groupPicUrl ? <img src={g.groupPicUrl} className="w-full h-full object-cover" /> : <span className="text-indigo-600 font-bold">#</span>}
                                        </div>
                                        <span className="text-gray-900 font-bold truncate">{g.name || g.roomId}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Direct Messages</h4>
                            <div className="space-y-1">
                                {recentDMs.map(u => {
                                    const names = [username, u.username].sort();
                                    const pRoomId = `p2p-${names[0]}-${names[1]}`;
                                    return (
                                        <div key={u.username} onClick={() => onSearchUser(u.username)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${roomId === pRoomId ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50'}`}>
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{u.username.charAt(0).toUpperCase()}</div>
                                            <span className="text-gray-700 font-medium truncate">{u.username}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
