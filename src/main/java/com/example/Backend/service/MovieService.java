package com.example.Backend.service;

import java.util.List;

import com.example.Backend.modelos.Movie;
import com.example.Backend.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class MovieService {
    private final MovieRepository repo;

    @Autowired
    public MovieService(MovieRepository repo) {
        this.repo = repo;
        initSample();
    }

    private void initSample() {

        save(new Movie(
                "Kill Bill: Vol. 2",
                "https://res.cloudinary.com/.../killbill-cd.png",
                "https://res.cloudinary.com/.../killbill-poster.jpg",
                "https://res.cloudinary.com/.../killbill-bg.jpg",
                "Quentin Tarantino",
                "Acción, Thriller",
                "2h 16m",
                5.0,
                true,
                "https://www.youtube.com/embed/7kSuas6mRpk" // trailer
        ));

        save(new Movie(
                "Volver al futuro II",
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688543/back-2_vdmldw.png",// carátula (CD)
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688550/back-future-2-poster_hctqo8.jpg", // póster vertical
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688534/back2_tq1rrp.jpg",// fondo
                "Robert Zemeckis",
                "Aventura, Sci-Fi",
                "1h 48m",
                5.0,
                true,
                "https://www.youtube.com/embed/7kSuas6mRpk" // trailer
        ));

        save(new Movie(
                "Star Wars: Episodio III",
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688549/star-3_ttx54m.png",  // carátula (CD)
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688551/star-wars-3-poster_k4dull.jpg", // póster vertical
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688542/star3_o9qvst.jpg",// fondo
                "George Lucas",
                "Sci-Fi, Acción",
                "2h 20m",
                4.5,
                true,
                "https://www.youtube.com/embed/7kSuas6mRpk" // trailer
        ));

        save(new Movie(
                "The Social Network",
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688549/social_oxhiyi.png",  // carátula (CD)
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688551/social-network-poster_tonoia.jpg", // póster vertical
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688542/social_i7ojzt.jpg", // fondo
                "David Fincher",
                "Drama, Biografía",
                "2h 0m",
                5.0,
                true,
                "https://www.youtube.com/embed/7kSuas6mRpk" // trailer
        ));

        save(new Movie(
                "Saw V",
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688544/sawv_igoct1.png", // carátula (CD)
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688550/saw-v-poster_fmcu18.jpg", // póster vertical
                "https://res.cloudinary.com/dxpgzf01b/image/upload/v1759688542/sawv_is7ti0.jpg", // fondo
                "David Hackl",
                "Terror, Thriller",
                "1h 32m",
                3.0,
                true,
                "https://www.youtube.com/embed/7kSuas6mRpk" // trailer
        ));
    }

    public Movie save(Movie m) {
        return repo.save(m);
    }

    public Movie findById(String id) {
        return repo.findById(id);
    }

    public List<Movie> findAll() {
        return repo.findAll();
    }

    public Movie update(Movie m) {
        return repo.update(m);
    }

    public void deleteById(String id) {
        repo.deleteById(id);
    }
}