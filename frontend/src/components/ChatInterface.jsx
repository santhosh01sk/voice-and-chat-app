import React, { useState, useRef, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import useWebRTC from '../hooks/useWebRTC';

const ChatInterface = ({ username, initialRoomId, onLogout }) => {
    const [stompClient, setStompClient] = useState(null);
    const [messagesByRoom, setMessagesByRoom] = useState({});
    const [onlineCounts, setOnlineCounts] = useState({});
    const [currentRoomId, setCurrentRoomId] = useState(initialRoomId || 'general');
    const [messageInput, setMessageInput] = useState('');
    const [groups, setGroups] = useState([]);
    const [recentDMs, setRecentDMs] = useState([]);
    const [subscribedRooms, setSubscribedRooms] = useState(new Set());

    // Initialize WebRTC signaling
    useWebRTC(stompClient, currentRoomId, username);

    // Initial Fetch Groups and Users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const gRes = await axios.get('http://localhost:9090/api/groups');
                setGroups(gRes.data);

                // Fetch all users to populate DM list initially or wait for search
                const uRes = await axios.get('http://localhost:9090/api/users/all');
                setRecentDMs(uRes.data.filter(u => u.username !== username));
            } catch (error) {
                console.error("Data fetch failed:", error);
            }
        };
        fetchData();
    }, [username]);

    // Persistent STOMP Connection
    useEffect(() => {
        const socket = new SockJS('http://localhost:9090/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("Connected to STOMP");
                setStompClient(client);
                // Subscribe to current room on connect
                subscribeToRoom(client, currentRoomId);
            },
            onStompError: (err) => console.error("STOMP error", err),
        });

        client.activate();
        return () => client.deactivate();
    }, [username]);

    const subscribeToRoom = (client, roomId) => {
        if (!client || subscribedRooms.has(roomId)) return;

        client.subscribe('/topic/' + roomId, (payload) => {
            const data = JSON.parse(payload.body);

            if (window.handleSignaling &&
                ['VOICE_OFFER', 'VOICE_ANSWER', 'VOICE_CANDIDATE'].includes(data.type)) {
                window.handleSignaling(data);
                return;
            }

            if (data.onlineCount !== undefined) {
                setOnlineCounts(prev => ({ ...prev, [roomId]: data.onlineCount }));
            }

            setMessagesByRoom(prev => ({
                ...prev,
                [roomId]: [...(prev[roomId] || []), data]
            }));
        });

        client.publish({
            destination: "/app/chat/" + roomId + "/addUser",
            body: JSON.stringify({ sender: username, type: 'JOIN' })
        });

        setSubscribedRooms(prev => {
            const next = new Set(prev);
            next.add(roomId);
            return next;
        });

        // Fetch history
        axios.get(`http://localhost:9090/api/chat/${roomId}`).then(res => {
            setMessagesByRoom(prev => ({ ...prev, [roomId]: res.data }));
        });
    };

    const sendMessage = (type = 'CHAT', content = messageInput, fileUrl = null) => {
        if (stompClient && (content.trim() || type !== 'CHAT')) {
            stompClient.publish({
                destination: "/app/chat/" + currentRoomId + "/sendMessage",
                body: JSON.stringify({
                    sender: username,
                    content: content,
                    type: type,
                    fileUrl: fileUrl
                })
            });
            if (type === 'CHAT') setMessageInput('');
        }
    };

    const handleRoomChange = (newRoomId, isNewGroup = false, groupName = '') => {
        if (isNewGroup) {
            axios.post('http://localhost:9090/api/groups', { roomId: newRoomId, name: groupName })
                .then(res => setGroups(prev => [...prev, res.data]));
        }
        if (!subscribedRooms.has(newRoomId) && stompClient) {
            subscribeToRoom(stompClient, newRoomId);
        }
        setCurrentRoomId(newRoomId);
    };

    const handleSearchUser = (targetUsername) => {
        const names = [username, targetUsername].sort();
        const privateRoomId = `p2p-${names[0]}-${names[1]}`;
        handleRoomChange(privateRoomId);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white">
            <Sidebar
                username={username}
                roomId={currentRoomId}
                groups={groups}
                recentDMs={recentDMs}
                onLogout={onLogout}
                onRoomChange={handleRoomChange}
                onSearchUser={handleSearchUser}
            />
            <ChatWindow
                messages={messagesByRoom[currentRoomId] || []}
                currentUser={username}
                roomId={currentRoomId}
                onlineCount={onlineCounts[currentRoomId] || 0}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                onSendMessage={() => sendMessage()}
                onFileUpload={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                        const res = await axios.post('http://localhost:9090/api/files/upload', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        let url = res.data.fileDownloadUri.replace(":8080", ":9090");
                        sendMessage(file.type.split('/')[0].toUpperCase(), res.data.fileName, url);
                    } catch (err) { console.error(err); }
                }}
                onStartCall={() => window.startVoiceCall?.()}
            />
        </div>
    );
};

export default ChatInterface;
