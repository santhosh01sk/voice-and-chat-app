package com.example.chat.listener;

import com.example.chat.model.ChatMessage;
import com.example.chat.service.RoomService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Objects;
import java.util.logging.Logger;

@Component
public class WebSocketEventListener {

    private static final Logger logger = Logger.getLogger(WebSocketEventListener.class.getName());

    private final SimpMessageSendingOperations messagingTemplate;

    @Autowired
    private RoomService roomService;

    public WebSocketEventListener(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");

        if (username != null && roomId != null) {
            logger.info("User Disconnected: " + username + " from room: " + roomId);

            roomService.removeUser(roomId, username);

            var chatMessage = ChatMessage.builder()
                    .type(ChatMessage.MessageType.LEAVE)
                    .sender(username)
                    .roomId(roomId)
                    .onlineCount(roomService.getUserCount(roomId))
                    .build();

            messagingTemplate.convertAndSend("/topic/" + roomId, chatMessage);
        }
    }
}
