package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.dto.response.ApiResponse;
import com.msnc.nursingcouncil.dto.response.NoticeResponse;
import com.msnc.nursingcouncil.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * GET /api/notices         — all active notices (news section)
 * GET /api/notices/ticker  — ticker-only notices (scrolling banner)
 */
@RestController
@RequestMapping("/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NoticeResponse>>> getAllNotices() {
        return ResponseEntity.ok(ApiResponse.ok(noticeService.getAllActiveNotices()));
    }

    @GetMapping("/ticker")
    public ResponseEntity<ApiResponse<List<NoticeResponse>>> getTickerNotices() {
        return ResponseEntity.ok(ApiResponse.ok(noticeService.getTickerNotices()));
    }
}
