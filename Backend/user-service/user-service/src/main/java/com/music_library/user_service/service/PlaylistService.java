package com.music_library.user_service.service;

import java.util.List;
import com.music_library.user_service.entity.Playlist;

public interface PlaylistService {

    Playlist createPlaylist(Playlist playlist);

    List<Playlist> getAllPlaylists();

    List<Playlist> getPlaylistsByUserId(Long userId);

    void deletePlaylist(Long id);

    Playlist renamePlaylist(Long id, Playlist playlist);
}