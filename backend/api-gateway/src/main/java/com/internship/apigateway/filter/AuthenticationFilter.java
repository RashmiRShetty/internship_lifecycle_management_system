package com.internship.apigateway.filter;

import com.internship.apigateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter implements GlobalFilter {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod() != null ? exchange.getRequest().getMethod().name() : "";
        System.out.println("Gateway received request for path: " + path);
        System.out.println("Method: " + method);
        System.out.println("Headers: " + exchange.getRequest().getHeaders());

        if ("OPTIONS".equalsIgnoreCase(method)) {
            return chain.filter(exchange);
        }

        if (path.startsWith("/chats/files")) {
            return chain.filter(exchange);
        }

        // Check if path is not secured using RouteValidator
        if (!validator.isSecured.test(exchange.getRequest())) {
            System.out.println("Path is open, bypassing filter: " + path);
            return chain.filter(exchange);
        }

        // 🔐 secure other APIs
        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        try {
            jwtUtil.validateToken(token);
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String role = jwtUtil.extractRole(token);

        boolean isAdmin = "ADMIN".equals(role) || "SUPER_ADMIN".equals(role);
        boolean isFacultyOrAdmin = "FACULTY".equals(role) || isAdmin;
        boolean isSuperAdmin = "SUPER_ADMIN".equals(role);

        if (path.startsWith("/auth/admin/") && !isSuperAdmin) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // Allow pending admin approval endpoints only for super admin
        if ((path.startsWith("/auth/admin/pending-admins") || 
             path.startsWith("/auth/admin/approve-admin") || 
             path.startsWith("/auth/admin/reject-admin") ||
             path.startsWith("/auth/admin/clear-all-admins")) && !isSuperAdmin) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        if (path.equals("/users/profile/faculty/role") && "PUT".equalsIgnoreCase(method) && !isSuperAdmin) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        if ((path.startsWith("/users/profile/all/")
            || path.equals("/users/profile/stats")
            || path.startsWith("/users/profile/faculty/department")
            || path.startsWith("/users/profile/check-admin")
            || path.startsWith("/applications/all")) && !isAdmin) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        if (path.startsWith("/internships") && !"GET".equalsIgnoreCase(method) && !isFacultyOrAdmin) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        boolean applicationAdminAction =
            path.matches("^/applications/\\d+/(status|project-title)$")
                || path.matches("^/applications/reports/\\d+/(review|request-revision)$");
        if (applicationAdminAction && "PUT".equalsIgnoreCase(method) && !isFacultyOrAdmin) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }
}
