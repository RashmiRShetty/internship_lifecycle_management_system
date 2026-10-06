package com.internship.authservice.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final long OTP_VALID_DURATION = 15 * 60 * 1000; // 15 minutes
    private final Map<String, OtpData> otpMap = new ConcurrentHashMap<>();

    public String generateOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null) {
            throw new IllegalArgumentException("Email is required to generate OTP");
        }
        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpMap.put(normalizedEmail, new OtpData(otp, System.currentTimeMillis()));
        return otp;
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String trimmed = email.trim().toLowerCase();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeOtp(String otp) {
        return otp == null ? null : otp.trim();
    }

    public boolean checkOtpValidity(String email, String otp) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedOtp = normalizeOtp(otp);
        if (normalizedEmail == null || normalizedOtp == null) {
            return false;
        }

        OtpData otpData = otpMap.get(normalizedEmail);
        if (otpData == null) {
            return false;
        }

        if (System.currentTimeMillis() - otpData.timestamp > OTP_VALID_DURATION) {
            otpMap.remove(normalizedEmail);
            return false;
        }
        
        boolean isValid = otpData.otp.equals(normalizedOtp);
        if (isValid) {
            otpData.verified = true;
            otpData.timestamp = System.currentTimeMillis(); // Reset timer upon successful verification to give full registration window
        }
        return isValid;
    }

    public boolean validateOtp(String email, String otp) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedOtp = normalizeOtp(otp);
        if (normalizedEmail == null || normalizedOtp == null) {
            return false;
        }

        OtpData otpData = otpMap.get(normalizedEmail);
        if (otpData == null) {
            return false;
        }

        if (System.currentTimeMillis() - otpData.timestamp > OTP_VALID_DURATION) {
            otpMap.remove(normalizedEmail);
            return false;
        }

        boolean isValid = otpData.otp.equals(normalizedOtp) || otpData.verified;
        if (isValid) {
            otpMap.remove(normalizedEmail);
        }
        return isValid;
    }

    private static class OtpData {
        String otp;
        long timestamp;
        boolean verified = false;

        OtpData(String otp, long timestamp) {
            this.otp = otp;
            this.timestamp = timestamp;
        }
    }
}
