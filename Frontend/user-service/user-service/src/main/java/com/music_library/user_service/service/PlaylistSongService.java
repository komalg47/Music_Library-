package com.music_library.user_service.service;

import java.util.List;
import com.music_library.user_service.entity.PlaylistSong;

public interface PlaylistSongService {

    PlaylistSong addSongToPlaylist(PlaylistSong playlistSong);

    List<PlaylistSong> getAllPlaylistSongs();

    void deletePlaylistSong(Long id);
}