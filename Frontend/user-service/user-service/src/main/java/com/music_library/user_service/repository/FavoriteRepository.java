package com.music_library.user_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.music_library.user_service.entity.Favorite;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserIdAndSongId(Long userId, Long songId);

    List<Favorite> findByUserId(Long userId);
}