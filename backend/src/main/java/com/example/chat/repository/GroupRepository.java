package com.example.chat.repository;

import com.example.chat.model.GroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<GroupEntity, Long> {
    Optional<GroupEntity> findByRoomId(String roomId);
}
