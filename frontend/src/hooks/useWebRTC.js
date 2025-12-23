import { useEffect, useRef } from 'react';

const useWebRTC = (stompClient, roomId, username) => {
    const pc = useRef(null);
    const localStream = useRef(null);

    const createPeerConnection = () => {
        const config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };
        pc.current = new RTCPeerConnection(config);

        pc.current.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignaling('VOICE_CANDIDATE', JSON.stringify(event.candidate));
            }
        };

        pc.current.ontrack = (event) => {
            const remoteAudio = document.getElementById('remoteAudio');
            if (remoteAudio) {
                remoteAudio.srcObject = event.streams[0];
            }
        };

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                pc.current.addTrack(track, localStream.current);
            });
        }
    };

    const sendSignaling = (type, content) => {
        if (stompClient) {
            stompClient.publish({
                destination: `/app/chat/${roomId}/sendMessage`,
                body: JSON.stringify({
                    sender: username,
                    type: type,
                    content: content
                })
            });
        }
    };

    const startCall = async () => {
        try {
            localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            createPeerConnection();
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            sendSignaling('VOICE_OFFER', JSON.stringify(offer));
        } catch (err) {
            console.error("Failed to start call:", err);
        }
    };

    const endCall = () => {
        sendSignaling('VOICE_END', '{}');
        cleanup();
    };

    const cleanup = () => {
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        const remoteAudio = document.getElementById('remoteAudio');
        if (remoteAudio) {
            remoteAudio.srcObject = null;
        }
    };

    const handleSignaling = async (data) => {
        // Only process signaling messages for this user/room
        if (data.sender === username) return;

        if (data.type === 'VOICE_OFFER') {
            const payload = JSON.parse(data.content);
            if (!pc.current) {
                localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                createPeerConnection();
            }
            await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            sendSignaling('VOICE_ANSWER', JSON.stringify(answer));
        } else if (data.type === 'VOICE_ANSWER') {
            const payload = JSON.parse(data.content);
            if (pc.current) {
                await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
            }
        } else if (data.type === 'VOICE_CANDIDATE') {
            const payload = JSON.parse(data.content);
            if (pc.current) {
                await pc.current.addIceCandidate(new RTCIceCandidate(payload));
            }
        } else if (data.type === 'VOICE_END') {
            cleanup();
        }
    };

    useEffect(() => {
        window.startVoiceCall = startCall;
        window.endVoiceCall = endCall;
        window.handleSignaling = handleSignaling;

        return () => {
            delete window.startVoiceCall;
            delete window.endVoiceCall;
            delete window.handleSignaling;
            cleanup();
        };
    }, [stompClient, roomId, username]);

    return { startCall, endCall };
};

export default useWebRTC;
