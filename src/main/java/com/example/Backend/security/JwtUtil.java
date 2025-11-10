package com.example.Backend.security;

import com.example.Backend.modelos.Usuario;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long ttlMs;

    public JwtUtil() {
        String raw = System.getenv().getOrDefault("JWT_SECRET", "dev_secret_please_change_min_32_bytes");

        byte[] bytes;
        try {
            bytes = Decoders.BASE64.decode(raw);
        } catch (IllegalArgumentException e) {
            bytes = raw.getBytes(StandardCharsets.UTF_8);
        }

        this.key = Keys.hmacShaKeyFor(bytes);

        long hours = Long.parseLong(System.getenv().getOrDefault("JWT_TTL_HOURS", "24"));
        this.ttlMs = hours * 3600_000L;
    }

    public String generate(Usuario u) {
        Instant now = Instant.now();

        return Jwts.builder()
                .setSubject(String.valueOf(u.getId()))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusMillis(ttlMs)))
                .claim("email", u.getEmail())
                .claim("rol", u.getRol().name())
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            return null;
        }
    }

    public Long userId(String token) {
        Claims c = parse(token);
        return (c == null) ? null : Long.valueOf(c.getSubject());
    }
}