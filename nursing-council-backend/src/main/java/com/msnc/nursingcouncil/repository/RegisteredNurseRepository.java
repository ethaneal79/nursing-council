package com.msnc.nursingcouncil.repository;

import com.msnc.nursingcouncil.entity.RegisteredNurse;

import com.msnc.nursingcouncil.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RegisteredNurseRepository extends JpaRepository<RegisteredNurse, Long> {

    Optional<RegisteredNurse> findByRegistrationNumber(String registrationNumber);

    @Query("SELECT n FROM RegisteredNurse n JOIN n.applicant a " +
           "WHERE n.registrationNumber = :regNo AND LOWER(a.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
    Optional<RegisteredNurse> findByRegNoAndName(String regNo, String name);
    Optional<RegisteredNurse> findByApplicant(Applicant applicant);
}
