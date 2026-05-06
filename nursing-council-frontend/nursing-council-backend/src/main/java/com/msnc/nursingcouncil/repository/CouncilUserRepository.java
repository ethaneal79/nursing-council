package com.msnc.nursingcouncil.repository;

import com.msnc.nursingcouncil.entity.CouncilUser;
import com.msnc.nursingcouncil.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CouncilUserRepository extends JpaRepository<CouncilUser, Long> {
    Optional<CouncilUser> findByUsername(String username);
    Optional<CouncilUser> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<CouncilUser> findAllByRole(UserRole role);
    List<CouncilUser> findAllByActiveTrue();
}
