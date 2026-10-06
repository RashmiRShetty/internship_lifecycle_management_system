package com.internship.apigateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/auth/token",
            "/auth/register",
            "/auth/send-otp",
            "/auth/verify-otp",
            "/auth/reset-password",
            "/auth/google-login",
            "/auth/validate",
            "/chats/files",
            "/users/skills",
            "/skills",
            "/eureka",
            "/health"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> {
                String path = request.getURI().getPath();

                // All /auth endpoints should be open except admin operations
                if (path.startsWith("/auth/") && !path.startsWith("/auth/admin/")) {
                    return false; // Not secured
                }

                // Other open endpoints
                return openApiEndpoints.stream()
                        .noneMatch(path::startsWith);
            };
}
