package com.msnc.nursingcouncil.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "refresher_course_details")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RefresherCourseDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(name = "course_title", length = 300)
    private String courseTitle;

    @Column(name = "year_attended")
    private Short yearAttended;

    @Column(name = "organising_body", length = 300)
    private String organisingBody;

    @Column(length = 100)
    private String duration;
}
