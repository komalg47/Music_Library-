package com.music_library.admin_service.service;

import java.util.List;
import com.music_library.admin_service.entity.Song;

public interface SongService {

    Song addSong(Song song);

    List<Song> getAllSongs();

    Song getSongById(Long id);

    void deleteSong(Long id);

    Song updateSong(Long id, Song song);
}