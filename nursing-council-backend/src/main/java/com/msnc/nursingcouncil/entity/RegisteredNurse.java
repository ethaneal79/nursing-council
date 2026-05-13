package com.msnc.nursingcouncil.entity;

import com.msnc.nursingcouncil.enums.CourseType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "registered_nurses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisteredNurse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", unique = true, nullable = false, length = 50)
    private String registrationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private Applicant applicant;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
<<<<<<< HEAD
    @Column(name = "course_name", nullable = false)
=======
    @Column(name = "course_name", nullable = false, columnDefinition = "course_type")
>>>>>>> 3febec9e26692bdbade2840104f812eca5f04e9d
    private CourseType courseName;

    @Column(name = "institution_name", nullable = false, length = 300)
    private String institutionName;

    @Column(name = "registered_on", nullable = false)
    private LocalDate registeredOn;

    @Column(name = "valid_until", nullable = false)
    private LocalDate validUntil;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "certificate_url", length = 500)
    private String certificateUrl;
}
