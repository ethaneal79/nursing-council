package com.msnc.nursingcouncil.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data @Builder
public class NoticeResponse {
    private Long            id;
    private String          title;
    private String          body;
    private Boolean         isTicker;
    private OffsetDateTime  publishedAt;
}
