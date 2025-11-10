package com.example.Backend.security;

import com.example.Backend.modelos.Usuario;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;

@Component
public class JwtUtil {
    private final SecretKey key;
    private final long ttlMs;

    public JwtUtil() {
        // Lee de entorno; si no está, usa un default (solo para dev)
        String raw = System.getenv().getOrDefault("JWT_SECRET", "dev_secret_please_change_min_32_bytes");

        byte[] bytes;
        try {
            // Si realmente viene en Base64, decodifica
            bytes = Decoders.BASE64.decode(raw);
        } catch (Exception e) {
            // Si NO es Base64, úsalo tal cual en UTF-8
            bytes = raw.getBytes(StandardCharsets.UTF_8);
        }

        // HMAC-SHA-256 necesita >= 32 bytes de clave
        if (bytes.length < 32) {
            bytes = Arrays.copyOf(bytes, 32);
        }

        this.key = Keys.hmacShaKeyFor(bytes);

        long hours = Long.parseLong(System.getenv().getOrDefault("JWT_TTL_HOURS", "24"));
        this.ttlMs = hours * 3600_000L;
    }

    public String generate(Usuario u) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + ttlMs);

        return Jwts.builder()
                .setSubject(String.valueOf(u.getId()))
                .setIssuedAt(now)
                .setExpiration(exp)
                .claim("email", u.getEmail())
                .claim("rol", u.getRol().name())
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Long userId(String token) {
        return Long.valueOf(parseClaims(token).getSubject());
    }
}