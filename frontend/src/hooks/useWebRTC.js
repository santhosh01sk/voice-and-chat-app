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

    const handleSignaling = async (data) => {
        const payload = JSON.parse(data.content);

        if (data.type === 'VOICE_OFFER') {
            if (!pc.current) {
                localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                createPeerConnection();
            }
            await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            sendSignaling('VOICE_ANSWER', JSON.stringify(answer));
        } else if (data.type === 'VOICE_ANSWER') {
            await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
        } else if (data.type === 'VOICE_CANDIDATE') {
            if (pc.current) {
                await pc.current.addIceCandidate(new RTCIceCandidate(payload));
            }
        }
    };

    useEffect(() => {
        window.startVoiceCall = startCall;
        window.handleSignaling = handleSignaling;

        return () => {
            delete window.startVoiceCall;
            delete window.handleSignaling;
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => track.stop());
            }
            if (pc.current) {
                pc.current.close();
            }
        };
    }, [stompClient, roomId, username]);

    return { startCall };
};

export default useWebRTC;
