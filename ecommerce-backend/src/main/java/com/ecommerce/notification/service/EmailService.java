package com.ecommerce.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final Map<String, String> TEMPLATE_MAP = Map.of(
        "ORDER_CREATED",      "email-order-created",
        "PAYMENT_CONFIRMED",  "email-payment-confirmed",
        "ORDER_SHIPPED",      "email-order-shipped",
        "WELCOME",            "email-welcome",
        "PASSWORD_RESET",     "email-password-reset"
    );

    public void send(String to, String type, Map<String, Object> payload) {
        String templateName = TEMPLATE_MAP.get(type);
        if (templateName == null) return;

        Context ctx = new Context();
        ctx.setVariables(payload);

        // Simple HTML mock or Thymeleaf engine processing
        String html = "<html><body>" + type + " for user. Payload: " + payload.toString() + "</body></html>";
        try {
            html = templateEngine.process(templateName, ctx);
        } catch (Exception ex) {
            // fallback if thymeleaf templates are missing initially
        }

        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(getSubject(type));
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException ex) {
            throw new RuntimeException("Error al enviar email: " + ex.getMessage(), ex);
        }
    }

    private String getSubject(String type) {
        return switch (type) {
            case "ORDER_CREATED"     -> "Tu pedido fue recibido";
            case "PAYMENT_CONFIRMED" -> "Pago confirmado";
            case "ORDER_SHIPPED"     -> "Tu pedido está en camino";
            case "WELCOME"           -> "Bienvenido a nuestra tienda";
            case "PASSWORD_RESET"    -> "Recupera tu contraseña";
            default                  -> "Notificación";
        };
    }
}