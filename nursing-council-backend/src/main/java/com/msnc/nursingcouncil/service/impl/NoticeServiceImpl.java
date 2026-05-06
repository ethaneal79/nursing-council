package com.msnc.nursingcouncil.service.impl;

import com.msnc.nursingcouncil.dto.response.NoticeResponse;
import com.msnc.nursingcouncil.entity.Notice;
import com.msnc.nursingcouncil.repository.NoticeRepository;
import com.msnc.nursingcouncil.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final NoticeRepository noticeRepo;

    @Override
    @Transactional(readOnly = true)
    public List<NoticeResponse> getAllActiveNotices() {
        return noticeRepo.findByIsActiveTrueOrderByPublishedAtDesc()
                .stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoticeResponse> getTickerNotices() {
        return noticeRepo.findByIsTickerTrueAndIsActiveTrueOrderByPublishedAtDesc()
                .stream().map(this::toDto).toList();
    }

    private NoticeResponse toDto(Notice n) {
        return NoticeResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .body(n.getBody())
                .isTicker(n.getIsTicker())
                .publishedAt(n.getPublishedAt())
                .build();
    }
}
