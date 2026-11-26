package com.ecofood.auth.repository;

import com.ecofood.auth.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByDocNumber(String docNumber);
    Optional<Usuario> findByUserUuid(String userUuid);
    boolean existsByDocNumber(String docNumber);
}
