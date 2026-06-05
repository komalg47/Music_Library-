package com.music_library.user_service.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.music_library.user_service.entity.PlaylistSong;
import com.music_library.user_service.repository.PlaylistSongRepository;
import com.music_library.user_service.service.PlaylistSongService;

@Service
public class PlaylistSongServiceImpl
        implements PlaylistSongService {

    @Autowired
    private PlaylistSongRepository repository;

    @Override
    public PlaylistSong addSongToPlaylist(
            PlaylistSong playlistSong) {

        return repository.save(playlistSong);
    }

    @Override
    public List<PlaylistSong> getAllPlaylistSongs() {

        return repository.findAll();
    }

    @Override
    public void deletePlaylistSong(Long id) {

        repository.deleteById(id);
    }
}