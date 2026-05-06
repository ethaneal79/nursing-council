package com.msnc.nursingcouncil.entity;

import com.msnc.nursingcouncil.enums.ApplicationStatus;
import com.msnc.nursingcouncil.enums.ApplicationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", unique = true, nullable = false, length = 30)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private Applicant applicant;

    @Enumerated(EnumType.STRING)
    @Column(name = "application_type", nullable = false, columnDefinition = "application_type")
    private ApplicationType applicationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "application_status")
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private OffsetDateTime submittedAt;

    @UpdateTimestamp
    @Column(name = "last_updated_at")
    private OffsetDateTime lastUpdatedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    // ── Relations ──────────────────────────────────────────────────────────
    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CourseDetail courseDetail;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<RefresherCourseDetail> refresherCourseDetails = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Payment payment;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ApplicationStatusHistory> statusHistory = new ArrayList<>();
}
