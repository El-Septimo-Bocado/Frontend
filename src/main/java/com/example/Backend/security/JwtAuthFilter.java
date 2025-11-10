package com.example.Backend.security;

import com.example.Backend.modelos.Usuario;
import com.example.Backend.repository.UsuarioRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwt;
    private final UsuarioRepository repo;

    public JwtAuthFilter(JwtUtil jwt, UsuarioRepository repo) {
        this.jwt = jwt;
        this.repo = repo;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String h = req.getHeader("Authorization");
        if (h != null && h.toLowerCase(Locale.ROOT).startsWith("bearer ")) {
            String token = h.substring(7).trim();
            try {
                Long uid = jwt.userId(token);
                Optional<Usuario> uOpt = repo.findById(uid);
                if (uOpt.isPresent()) {
                    var u = uOpt.get();
                    var auth = new UsernamePasswordAuthenticationToken(
                            u,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + u.getRol().name()))
                    );
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (JwtException | IllegalArgumentException ignored) {
                // token inválido/expirado: sigue sin autenticación
            }
        }
        chain.doFilter(req, res);
    }
}