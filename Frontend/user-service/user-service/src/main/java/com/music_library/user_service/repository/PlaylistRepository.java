package com.music_library.user_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.music_library.user_service.entity.Playlist;
import java.util.List;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    List<Playlist> findByUserUserId(Long userId);
}