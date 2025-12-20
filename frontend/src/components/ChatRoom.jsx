import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import classNames from 'classnames';

const ChatRoom = () => {
    const [stompClient, setStompClient] = useState(null);
    const [userData, setUserData] = useState({
        username: '',
        connected: false,
        message: ''
    });
    const [publicChats, setPublicChats] = useState([]);
    const [file, setFile] = useState(null);

    const connect = () => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: onConnected,
            onStompError: onError
        });

        client.activate();
        setStompClient(client);
    };

    const onConnected = () => {
        setUserData({ ...userData, connected: true });
        stompClient.subscribe('/topic/public', onMessageReceived);

        stompClient.publish({
            destination: "/app/chat.addUser",
            body: JSON.stringify({
                sender: userData.username,
                type: 'JOIN'
            })
        });
    };

    const onError = (err) => {
        console.log(err);
    };

    const onMessageReceived = (payload) => {
        const payloadData = JSON.parse(payload.body);
        setPublicChats(prev => [...prev, payloadData]);
    };

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, message: value });
    };

    const sendValue = () => {
        if (stompClient) {
            const chatMessage = {
                sender: userData.username,
                content: userData.message,
                type: 'CHAT'
            };
            stompClient.publish({
                destination: "/app/chat.sendMessage",
                body: JSON.stringify(chatMessage)
            });
            setUserData({ ...userData, message: '' });
        }
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const uploadFile = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8080/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const fileUrl = response.data.fileDownloadUri;
            const fileType = file.type.startsWith('image/') ? 'IMAGE' :
                file.type.startsWith('video/') ? 'VIDEO' :
                    file.type.startsWith('audio/') ? 'AUDIO' : 'CHAT';

            if (stompClient) {
                const chatMessage = {
                    sender: userData.username,
                    content: response.data.fileName,
                    type: fileType,
                    fileUrl: fileUrl
                };
                stompClient.publish({
                    destination: "/app/chat.sendMessage",
                    body: JSON.stringify(chatMessage)
                });
            }
            setFile(null);
        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    };

    const registerUser = () => {
        connect();
    };

    return (
        <div className="container mx-auto p-4">
            {userData.connected ? (
                <div className="chat-box max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="chat-header bg-blue-500 text-white p-4">
                        <h2 className="text-xl font-bold">Group Chat</h2>
                        <span className="text-sm">Logged in as: {userData.username}</span>
                    </div>
                    <div className="chat-content h-96 overflow-y-auto p-4 bg-gray-100 flex flex-col gap-2">
                        {publicChats.map((chat, index) => (
                            <div key={index} className={classNames("message p-2 rounded-lg max-w-xs", {
                                "self-end bg-blue-500 text-white": chat.sender === userData.username,
                                "self-start bg-white text-gray-800 border border-gray-200": chat.sender !== userData.username,
                                "self-center bg-gray-200 text-gray-600 text-center text-xs w-full": chat.type === 'JOIN' || chat.type === 'LEAVE'
                            })}>
                                {chat.type === 'JOIN' && <p>{chat.sender} joined!</p>}
                                {chat.type === 'LEAVE' && <p>{chat.sender} left!</p>}
                                {(chat.type === 'CHAT' || chat.type === 'IMAGE' || chat.type === 'VIDEO' || chat.type === 'AUDIO') && (
                                    <div>
                                        {chat.sender !== userData.username && <div className="text-xs font-bold mb-1 opacity-70">{chat.sender}</div>}

                                        {chat.type === 'CHAT' && <p>{chat.content}</p>}

                                        {chat.type === 'IMAGE' && (
                                            <img src={chat.fileUrl} alt={chat.content} className="max-w-full rounded" />
                                        )}

                                        {chat.type === 'VIDEO' && (
                                            <video controls className="max-w-full rounded">
                                                <source src={chat.fileUrl} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        )}

                                        {chat.type === 'AUDIO' && (
                                            <audio controls>
                                                <source src={chat.fileUrl} />
                                                Your browser does not support the audio element.
                                            </audio>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input p-4 bg-white border-t border-gray-200">
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                className="flex-1 border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                                placeholder="Enter your message"
                                value={userData.message}
                                onChange={handleMessage}
                                onKeyDown={(e) => e.key === 'Enter' && sendValue()}
                            />
                            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" onClick={sendValue}>Send</button>
                        </div>
                        <div className="flex gap-2 items-center">
                            <input type="file" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            <button onClick={uploadFile} disabled={!file} className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50 transition">Upload & Share</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="register max-w-md mx-auto mt-20 p-6 bg-white shadow-lg rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Enter Chat Room</h2>
                    <input
                        className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:border-blue-500"
                        id="user-name"
                        placeholder="Enter your name"
                        name="userName"
                        value={userData.username}
                        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && registerUser()}
                    />
                    <button className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 transition" type="button" onClick={registerUser}>
                        Connect
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatRoom;
