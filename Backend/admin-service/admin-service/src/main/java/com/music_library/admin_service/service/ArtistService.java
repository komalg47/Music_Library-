package com.music_library.admin_service.service;

import java.util.List;
import com.music_library.admin_service.entity.Artist;

public interface ArtistService {

    Artist addArtist(Artist artist);

    List<Artist> getAllArtists();

    void deleteArtist(Long id);

    Artist updateArtist(Long id, Artist artist);

    Artist findOrCreateArtist(String artistName);
}