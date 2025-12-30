import React, { useState, useRef, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import useWebRTC from '../hooks/useWebRTC';
import './ChatInterface.css';

const ChatInterface = ({ username, initialRoomId, onLogout, theme, onThemeChange, themes }) => {
    const [stompClient, setStompClient] = useState(null);
    const [messagesByRoom, setMessagesByRoom] = useState({});
    const [onlineCounts, setOnlineCounts] = useState({});
    const [currentRoomId, setCurrentRoomId] = useState(initialRoomId || 'general');
    const [messageInput, setMessageInput] = useState('');
    const [groups, setGroups] = useState([]);
    const [recentDMs, setRecentDMs] = useState([]);
    const [subscribedRooms, setSubscribedRooms] = useState(new Set());
    const [isUploading, setIsUploading] = useState(false);

    // Call state: 'idle', 'incoming', 'outgoing', 'connected'
    const [callStatus, setCallStatus] = useState('idle');
    const callStatusRef = useRef('idle');
    const [caller, setCaller] = useState(null);

    // Update ref whenever state changes
    useEffect(() => {
        callStatusRef.current = callStatus;
    }, [callStatus]);

    useWebRTC(stompClient, currentRoomId, username);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const gRes = await axios.get('http://localhost:9090/api/groups');
                setGroups(gRes.data);

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
            // Handle signaling and call status

            if (['VOICE_OFFER', 'VOICE_ANSWER', 'VOICE_CANDIDATE', 'VOICE_END'].includes(data.type)) {
                if (data.sender !== username && window.handleSignaling) {
                    if (data.type === 'VOICE_OFFER' && callStatusRef.current === 'idle') {
                        setCallStatus('incoming');
                        setCaller(data.sender);
                    } else if (data.type === 'VOICE_ANSWER') {
                        setCallStatus('connected');
                    } else if (data.type === 'VOICE_END') {
                        setCallStatus('idle');
                    }
                    window.handleSignaling(data);
                }
                return;
            }

            if (data.type === 'DELETE') {
                setMessagesByRoom(prev => {
                    const roomMsgs = prev[roomId] || [];
                    return {
                        ...prev,
                        [roomId]: roomMsgs.filter(m => m.id !== data.id)
                    };
                });
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

    const deleteMessage = (messageId) => {
        if (stompClient && messageId) {
            stompClient.publish({
                destination: "/app/chat/" + currentRoomId + "/deleteMessage",
                body: JSON.stringify({
                    id: messageId,
                    sender: username,
                    type: 'DELETE'
                })
            });
        }
    };

    const handleFileUpload = async (file, type) => {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('http://localhost:9090/api/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            let url = res.data.fileDownloadUri.replace(":8080", ":9090");

            // Determine type more reliably
            let msgType = type;
            if (!msgType) {
                const mime = file.type;
                if (mime.startsWith('image/')) msgType = 'IMAGE';
                else if (mime.startsWith('video/')) msgType = 'VIDEO';
                else if (mime.startsWith('audio/')) msgType = 'AUDIO';
                else msgType = 'DOCUMENT';
            }

            sendMessage(msgType, res.data.fileName, url);
        } catch (err) {
            console.error("Upload failed:", err);
            alert("File upload failed. Please try again.");
        } finally {
            setIsUploading(false);
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

    const startCall = () => {
        setCallStatus('outgoing');
        window.startVoiceCall?.();
    };

    const endCall = () => {
        setCallStatus('idle');
        window.endVoiceCall?.();
    };

    const acceptCall = () => {
        setCallStatus('connected');
        // Signaling handler handles the rest on receiving offer
    };

    return (
        <div className="chat-interface-container">
            <Sidebar
                username={username}
                roomId={currentRoomId}
                groups={groups}
                recentDMs={recentDMs}
                onLogout={onLogout}
                onRoomChange={handleRoomChange}
                onSearchUser={handleSearchUser}
                theme={theme}
                onThemeChange={onThemeChange}
                themes={themes}
            />
            <ChatWindow
                messages={messagesByRoom[currentRoomId] || []}
                currentUser={username}
                roomId={currentRoomId}
                onlineCount={onlineCounts[currentRoomId] || 0}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                onSendMessage={() => sendMessage()}
                onFileUpload={(e) => handleFileUpload(e.target.files[0])}
                onVoiceSend={(file) => handleFileUpload(file, 'VOICE_MSG')}
                onDeleteMessage={deleteMessage}
                onStartCall={startCall}
                onEndCall={endCall}
                onAcceptCall={acceptCall}
                callStatus={callStatus}
                caller={caller}
                isUploading={isUploading}
            />
            <audio id="remoteAudio" autoPlay />
        </div>
    );
};

export default ChatInterface;
