package com.msnc.nursingcouncil.entity;

import com.msnc.nursingcouncil.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "application_status_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApplicationStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
<<<<<<< HEAD
    @Column(nullable = false)
=======
    @Column(nullable = false, columnDefinition = "application_status")
>>>>>>> 3febec9e26692bdbade2840104f812eca5f04e9d
    private ApplicationStatus status;

    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private OffsetDateTime changedAt;

    @Column(name = "changed_by", length = 100)
    private String changedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
