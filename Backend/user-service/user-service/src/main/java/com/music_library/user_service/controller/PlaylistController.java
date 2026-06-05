package com.music_library.user_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.music_library.user_service.entity.Playlist;
import com.music_library.user_service.service.PlaylistService;

@RestController
@RequestMapping("/playlists")
@CrossOrigin(origins = "*")
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;

    @PostMapping
    public Playlist createPlaylist(@RequestBody Playlist playlist) {
        return playlistService.createPlaylist(playlist);
    }

    @GetMapping
    public List<Playlist> getAllPlaylists() {
        return playlistService.getAllPlaylists();
    }

    @GetMapping("/user/{userId}")
    public List<Playlist> getPlaylistsByUser(@PathVariable Long userId) {
        return playlistService.getPlaylistsByUserId(userId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> renamePlaylist(@PathVariable Long id, @RequestBody Playlist playlist) {
        Playlist updated = playlistService.renamePlaylist(id, playlist);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public String deletePlaylist(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return "Playlist deleted successfully";
    }
}