package com.msnc.nursingcouncil.repository;

import com.msnc.nursingcouncil.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
    Optional<Applicant> findByEmailAndMobile(String email, String mobile);
}
