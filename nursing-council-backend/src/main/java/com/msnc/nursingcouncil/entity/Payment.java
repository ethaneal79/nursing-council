package com.msnc.nursingcouncil.entity;

import com.msnc.nursingcouncil.enums.PaymentMethod;
import com.msnc.nursingcouncil.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
<<<<<<< HEAD
    @Column(name = "payment_method", nullable = false)
=======
    @Column(name = "payment_method", nullable = false, columnDefinition = "payment_method")
>>>>>>> 3febec9e26692bdbade2840104f812eca5f04e9d
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_ref", length = 200)
    private String transactionRef;

    @Enumerated(EnumType.STRING)
<<<<<<< HEAD
    @Column(nullable = false)
=======
    @Column(nullable = false, columnDefinition = "payment_status")
>>>>>>> 3febec9e26692bdbade2840104f812eca5f04e9d
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
