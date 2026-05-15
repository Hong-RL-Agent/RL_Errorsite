package gallery.noir.artappraiser.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final JdbcTemplate jdbc;

    public DataSeeder(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        jdbc.execute("""
                CREATE TABLE artworks (
                  id INT PRIMARY KEY,
                  title VARCHAR(255),
                  artist VARCHAR(255),
                  era VARCHAR(255),
                  risk VARCHAR(255),
                  confidence INT,
                  ownerId VARCHAR(64)
                )
                """);
        jdbc.execute("""
                CREATE TABLE reports (
                  id INT PRIMARY KEY,
                  ownerId VARCHAR(64),
                  title VARCHAR(255),
                  valuation VARCHAR(255),
                  confidentialNotes VARCHAR(2000)
                )
                """);
        jdbc.execute("""
                CREATE TABLE comments (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  artworkId INT,
                  author VARCHAR(255),
                  body VARCHAR(4000)
                )
                """);

        jdbc.update("INSERT INTO artworks VALUES (1,'Nocturne Signal','E. Voss','Post-war abstract','verified',96,'curator')");
        jdbc.update("INSERT INTO artworks VALUES (2,'Azure Reliquary','M. Laurent','Contemporary sculpture','watchlist',82,'collector-a')");
        jdbc.update("INSERT INTO artworks VALUES (3,'Black Meridian','Unknown atelier','Old master study','forgery-risk',41,'collector-b')");

        jdbc.update("INSERT INTO reports VALUES (101,'curator','Nocturne Signal appraisal','$2.8M','Private provenance chain includes Geneva vault references.')");
        jdbc.update("INSERT INTO reports VALUES (102,'collector-a','Azure Reliquary insurance memo','$640K','Owner identity and insurer rider are intentionally exposed for IDOR training.')");
        jdbc.update("INSERT INTO reports VALUES (103,'collector-b','Black Meridian dispute file','$90K','Forgery risk memo contains confidential lab notes.')");

        jdbc.update("INSERT INTO comments(artworkId,author,body) VALUES (1,'Analyst Rae','Pigment density matches the 1961 archive sample.')");
        jdbc.update("INSERT INTO comments(artworkId,author,body) VALUES (3,'Red Team','Stored comment field intentionally preserves markup for XSS training.')");
    }
}
