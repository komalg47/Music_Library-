package com.music_library.admin_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.music_library.admin_service.entity.Album;

public interface AlbumRepository extends JpaRepository<Album, Long> {

}