package com.msnc.nursingcouncil.entity;

import com.msnc.nursingcouncil.enums.CourseType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_details")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(name = "course_name", nullable = false, columnDefinition = "course_type")
    private CourseType courseName;

    @Column(name = "year_of_passing", nullable = false)
    private Short yearOfPassing;

    @Column(name = "institution_name", nullable = false, length = 300)
    private String institutionName;

    @Column(name = "university_or_board", nullable = false, length = 300)
    private String universityOrBoard;

    @Column(name = "exam_roll_number", length = 100)
    private String examRollNumber;

    @Column(name = "previous_council_reg_no", length = 100)
    private String previousCouncilRegNo;
}
