package com.music_library.user_service.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.music_library.user_service.entity.Playlist;
import com.music_library.user_service.repository.PlaylistRepository;
import com.music_library.user_service.service.PlaylistService;

@Service
public class PlaylistServiceImpl implements PlaylistService {

    @Autowired
    private PlaylistRepository playlistRepository;

    @Override
    public Playlist createPlaylist(Playlist playlist) {
        return playlistRepository.save(playlist);
    }

    @Override
    public List<Playlist> getAllPlaylists() {
        return playlistRepository.findAll();
    }

    @Override
    public List<Playlist> getPlaylistsByUserId(Long userId) {
        return playlistRepository.findByUserUserId(userId);
    }

    @Override
    public void deletePlaylist(Long id) {
        playlistRepository.deleteById(id);
    }

    @Override
    public Playlist renamePlaylist(Long id, Playlist updated) {
        Playlist existing = playlistRepository.findById(id).orElse(null);
        if (existing == null) return null;
        existing.setPlaylistName(updated.getPlaylistName());
        return playlistRepository.save(existing);
    }
}