package com.example.chat.controller;

import com.example.chat.model.ChatMessage;
import com.example.chat.model.ChatMessageEntity;
import com.example.chat.repository.ChatMessageRepository;
import com.example.chat.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RoomService roomService;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @MessageMapping("/chat/{roomId}/sendMessage")
    public void sendMessage(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        // Save to DB
        ChatMessageEntity entity = ChatMessageEntity.builder()
                .sender(chatMessage.getSender())
                .content(chatMessage.getContent())
                .roomId(roomId)
                .type(chatMessage.getType())
                .fileUrl(chatMessage.getFileUrl())
                // .timestamp set on pre-persist
                .build();

        ChatMessageEntity saved = chatMessageRepository.save(entity);

        // Add timestamp to message before sending
        chatMessage.setTimestamp(
                saved.getTimestamp() != null ? saved.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm"))
                        : LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));

        messagingTemplate.convertAndSend("/topic/" + roomId, chatMessage);
    }

    @MessageMapping("/chat/{roomId}/addUser")
    public void addUser(@DestinationVariable String roomId, @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {

        // Add user to room
        roomService.addUser(roomId, chatMessage.getSender());

        // Add username and roomId in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        headerAccessor.getSessionAttributes().put("roomId", roomId);

        // Set current user count
        chatMessage.setOnlineCount(roomService.getUserCount(roomId));

        messagingTemplate.convertAndSend("/topic/" + roomId, chatMessage);
    }

    @GetMapping("/api/chat/{roomId}")
    @ResponseBody
    public List<ChatMessage> getChatHistory(@PathVariable String roomId) {
        return chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId).stream()
                .map(entity -> ChatMessage.builder()
                        .sender(entity.getSender())
                        .content(entity.getContent())
                        .type(entity.getType())
                        .roomId(entity.getRoomId())
                        .fileUrl(entity.getFileUrl())
                        .timestamp(entity.getTimestamp() != null
                                ? entity.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm"))
                                : null)
                        .build())
                .collect(Collectors.toList());
    }
}
