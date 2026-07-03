package com.ecommerce.audit.service;

import com.ecommerce.audit.entity.AuditLog;
import com.ecommerce.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final HttpServletRequest httpRequest;

    @Async
    public void log(Long userId, String action, String entity,
                    Long entityId, Object oldValue, Object newValue) {
        try {
            AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .oldValue(oldValue != null
                    ? objectMapper.valueToTree(oldValue) : null)
                .newValue(newValue != null
                    ? objectMapper.valueToTree(newValue) : null)
                .ipAddress(getClientIp())
                .build();

            auditLogRepository.save(log);
        } catch (Exception ex) {
            // El log de auditoría nunca debe romper el flujo principal
        }
    }

    private String getClientIp() {
        if (httpRequest == null) return "127.0.0.1";
        String forwarded = httpRequest.getHeader("X-Forwarded-For");
        return (forwarded != null && !forwarded.isEmpty())
            ? forwarded.split(",")[0].trim()
            : httpRequest.getRemoteAddr();
    }

    public List<AuditLog> listAll() {
        return auditLogRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}