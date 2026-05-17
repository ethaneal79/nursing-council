package com.msnc.nursingcouncil.service;

import com.msnc.nursingcouncil.dto.response.NoticeResponse;
import java.util.List;

public interface NoticeService {
    List<NoticeResponse> getAllActiveNotices();
    List<NoticeResponse> getTickerNotices();
}
