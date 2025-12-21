package com.example.chat.controller;

import com.example.chat.model.GroupEntity;
import com.example.chat.model.UserEntity;
import com.example.chat.repository.GroupRepository;
import com.example.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:5173")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public GroupEntity createGroup(@RequestBody GroupEntity group) {
        if (group.getMembers() == null) {
            group.setMembers(new HashSet<>());
        }
        return groupRepository.save(group);
    }

    @GetMapping("/{roomId}")
    public GroupEntity getGroup(@PathVariable String roomId) {
        return groupRepository.findByRoomId(roomId).orElse(null);
    }

    @PostMapping("/{roomId}/members")
    public GroupEntity addMember(@PathVariable String roomId, @RequestParam String username) {
        Optional<GroupEntity> groupOpt = groupRepository.findByRoomId(roomId);
        Optional<UserEntity> userOpt = userRepository.findByUsername(username);

        if (groupOpt.isPresent() && userOpt.isPresent()) {
            GroupEntity group = groupOpt.get();
            group.getMembers().add(userOpt.get());
            return groupRepository.save(group);
        }
        return null;
    }

    @PutMapping("/{roomId}/pic")
    public GroupEntity updateGroupPic(@PathVariable String roomId, @RequestParam String picUrl) {
        Optional<GroupEntity> groupOpt = groupRepository.findByRoomId(roomId);
        if (groupOpt.isPresent()) {
            GroupEntity group = groupOpt.get();
            group.setGroupPicUrl(picUrl);
            return groupRepository.save(group);
        }
        return null;
    }

    @GetMapping
    public List<GroupEntity> getAllGroups() {
        return groupRepository.findAll();
    }
}
