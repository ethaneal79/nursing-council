package com.msnc.nursingcouncil.repository;

import com.msnc.nursingcouncil.entity.Application;
import com.msnc.nursingcouncil.enums.ApplicationStatus;
import com.msnc.nursingcouncil.enums.ApplicationType;
import com.msnc.nursingcouncil.enums.CourseType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Optional<Application> findByReferenceNumber(String referenceNumber);

    @Query("SELECT a FROM Application a JOIN a.applicant ap " +
           "WHERE a.referenceNumber = :ref AND ap.mobile = :mobile")
    Optional<Application> findByReferenceNumberAndMobile(String ref, String mobile);

    boolean existsByReferenceNumber(String referenceNumber);
    boolean existsByRegistrationNumber(String registrationNumber);

    // ── Status queries (for DA and dashboard) ─────────────────────────────
    List<Application> findAllByStatus(ApplicationStatus status);

    Page<Application> findAllByStatus(ApplicationStatus status, Pageable pageable);

    List<Application> findAllByStatusIn(List<ApplicationStatus> statuses);

    // ── Count queries (for dashboard stats) ───────────────────────────────
    long countByStatus(ApplicationStatus status);

    long countByApplicationType(ApplicationType applicationType);

    @Query("SELECT COUNT(a) FROM Application a JOIN a.courseDetail cd WHERE cd.courseName = :courseType")
    long countByCourseType(CourseType courseType);

 // ── Registrar: applications verified by DA ─────────────────────────────
    @Query("""
    	    SELECT a FROM Application a
    	    WHERE a.status IN (
    	        com.msnc.nursingcouncil.enums.ApplicationStatus.DOCUMENTS_VERIFIED,
    	        com.msnc.nursingcouncil.enums.ApplicationStatus.COUNCIL_REVIEW
    	    )
    	    ORDER BY a.submittedAt DESC
    	""")
    	List<Application> findAllPendingApproval();
}