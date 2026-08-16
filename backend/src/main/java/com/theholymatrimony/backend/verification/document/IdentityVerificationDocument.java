package com.theholymatrimony.backend.verification.document;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.verification.entity.MemberVerification;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "identity_verification_documents",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_identity_document_verification",
                        columnNames = "verification_id"
                ),
                @UniqueConstraint(
                        name = "uk_identity_document_stored_file",
                        columnNames = "stored_file_name"
                )
        },
        indexes = {
                @Index(
                        name = "idx_identity_document_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_identity_document_type",
                        columnList = "document_type"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdentityVerificationDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "verification_id",
            nullable = false
    )
    private MemberVerification verification;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "document_type",
            nullable = false,
            length = 30
    )
    private IdentityDocumentType documentType;

    @Column(
            name = "original_file_name",
            nullable = false,
            length = 255
    )
    private String originalFileName;

    @Column(
            name = "stored_file_name",
            nullable = false,
            unique = true,
            length = 255
    )
    private String storedFileName;

    @Column(
            name = "content_type",
            nullable = false,
            length = 100
    )
    private String contentType;

    @Column(
            name = "file_size",
            nullable = false
    )
    private Long fileSize;

    @Builder.Default
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt =
            LocalDateTime.now();

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }
}
