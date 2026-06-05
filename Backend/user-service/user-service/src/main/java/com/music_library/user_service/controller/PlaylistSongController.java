package com.music_library.user_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.music_library.user_service.entity.PlaylistSong;
import com.music_library.user_service.service.PlaylistSongService;

@RestController
@RequestMapping("/playlist-songs")
@CrossOrigin(origins = "*")
public class PlaylistSongController {

    @Autowired
    private PlaylistSongService service;

    @PostMapping
    public PlaylistSong addSongToPlaylist(
            @RequestBody PlaylistSong playlistSong) {

        return service.addSongToPlaylist(
                playlistSong);
    }

    @GetMapping
    public List<PlaylistSong> getAllPlaylistSongs() {

        return service.getAllPlaylistSongs();
    }

    @DeleteMapping("/{id}")
    public String deletePlaylistSong(
            @PathVariable Long id) {

        service.deletePlaylistSong(id);

        return "Song removed from playlist";
    }
}