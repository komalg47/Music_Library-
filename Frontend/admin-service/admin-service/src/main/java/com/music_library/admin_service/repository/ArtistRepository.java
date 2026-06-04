package com.music_library.admin_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.music_library.admin_service.entity.Artist;

import java.util.Optional;

public interface ArtistRepository extends JpaRepository<Artist, Long> {
    Optional<Artist> findByArtistNameIgnoreCase(String artistName);
}