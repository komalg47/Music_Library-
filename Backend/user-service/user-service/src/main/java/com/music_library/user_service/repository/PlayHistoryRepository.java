package com.music_library.user_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.music_library.user_service.entity.PlayHistory;

public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {

}