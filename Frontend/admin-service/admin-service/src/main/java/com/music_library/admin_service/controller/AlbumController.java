package com.music_library.admin_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.music_library.admin_service.entity.Album;
import com.music_library.admin_service.service.AlbumService;

@RestController
@RequestMapping("/albums")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class AlbumController {

    @Autowired
    private AlbumService albumService;

    @PostMapping
    public Album addAlbum(@RequestBody Album album) {
        return albumService.addAlbum(album);
    }

    @GetMapping
    public List<Album> getAllAlbums() {
        return albumService.getAllAlbums();
    }
}