import React, { useState, useRef, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';

const ChatInterface = ({ username, roomId, onLogout }) => {
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [messageInput, setMessageInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Fetch History
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`http://localhost:9090/api/chat/${roomId}`);
                setMessages(response.data);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            }
        };
        fetchHistory();

        const socket = new SockJS('http://localhost:9090/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                setIsConnected(true);
                client.subscribe('/topic/' + roomId, onMessageReceived);

                client.publish({
                    destination: "/app/chat/" + roomId + "/addUser",
                    body: JSON.stringify({
                        sender: username,
                        type: 'JOIN'
                    })
                });
            },
            onStompError: (err) => {
                console.error("STOMP error", err);
            },
            onDisconnect: () => {
                setIsConnected(false);
            }
        });

        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [roomId, username]);

    const onMessageReceived = (payload) => {
        const payloadData = JSON.parse(payload.body);
        if (payloadData.onlineCount) {
            setOnlineCount(payloadData.onlineCount);
        }
        setMessages(prev => [...prev, payloadData]);
    };

    const sendMessage = () => {
        if (stompClient && messageInput.trim()) {
            const chatMessage = {
                sender: username,
                content: messageInput,
                type: 'CHAT'
            };
            stompClient.publish({
                destination: "/app/chat/" + roomId + "/sendMessage",
                body: JSON.stringify(chatMessage)
            });
            setMessageInput('');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:9090/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Ensure URL uses correct port if needed, though backend returns absolute from request
            // If backend returns 8080 by default but we run on 9090, we might need replacement.
            // Backend `FileUploadController` constructs URI from context.
            // Let's assume it returns the correct accessible URL.
            // Just in case, the legacy code had a replace.
            let fileUrl = response.data.fileDownloadUri;
            if (fileUrl.includes(":8080")) {
                fileUrl = fileUrl.replace(":8080", ":9090");
            }

            const fileType = file.type.startsWith('image/') ? 'IMAGE' :
                file.type.startsWith('video/') ? 'VIDEO' :
                    file.type.startsWith('audio/') ? 'AUDIO' : 'CHAT';

            if (stompClient) {
                const chatMessage = {
                    sender: username,
                    content: response.data.fileName, // Or caption
                    type: fileType,
                    fileUrl: fileUrl
                };
                stompClient.publish({
                    destination: "/app/chat/" + roomId + "/sendMessage",
                    body: JSON.stringify(chatMessage)
                });
            }
        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white">
            <Sidebar username={username} roomId={roomId} onLogout={onLogout} />
            <ChatWindow
                messages={messages}
                currentUser={username}
                roomId={roomId}
                onlineCount={onlineCount}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                onSendMessage={sendMessage}
                onFileUpload={handleFileUpload}
            />
        </div>
    );
};

export default ChatInterface;
