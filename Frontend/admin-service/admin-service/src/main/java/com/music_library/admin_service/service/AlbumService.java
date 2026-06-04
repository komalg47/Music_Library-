package com.music_library.admin_service.service;

import java.util.List;
import com.music_library.admin_service.entity.Album;

public interface AlbumService {

    Album addAlbum(Album album);

    List<Album> getAllAlbums();
}