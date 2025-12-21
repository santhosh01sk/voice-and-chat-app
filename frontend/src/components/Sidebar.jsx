import React from 'react';

const Sidebar = ({ username, roomId, onLogout }) => {
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
                <button
                    onClick={onLogout}
                    title="Logout"
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                </button>
            </div>

            {/* Search */}
           <div className="px-6 mb-4">
                <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-transparent focus-within:border-indigo-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                    <svg viewBox="0 0 24 24" width="20" height="20" className="text-gray-400" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>
                    <input type="text" placeholder="Search" className="bg-transparent border-none focus:outline-none w-full text-sm text-gray-700 placeholder:text-gray-400 font-medium" />
                </div>
            </div> 

            {/* Title */}
            <div className="px-6 pb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Rooms</h4>
            </div>

            {/* Chat List */}
            <div className="overflow-y-auto flex-1 custom-scrollbar px-3 pb-4 space-y-1">
                {/* Active Room */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50 cursor-pointer transition-all hover:bg-indigo-50 group">
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {roomId.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-gray-900 font-bold truncate">{roomId}</span>
                            <span className="text-[10px] text-indigo-500 font-semibold bg-indigo-100 px-1.5 py-0.5 rounded">NOW</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate group-hover:text-indigo-600 transition-colors">
                            Click to view messages...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
