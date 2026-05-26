package com.humancloud.wims.controller;

import com.humancloud.wims.config.JwtUtil;
import com.humancloud.wims.dto.AuthRequest;
import com.humancloud.wims.dto.AuthResponse;
import com.humancloud.wims.dto.OtpVerificationRequest;
import com.humancloud.wims.entity.User;
import com.humancloud.wims.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

	@Autowired
	private AuthenticationManager authenticationManager;
	@Autowired
	private JwtUtil jwtTokenUtil;
	@Autowired
	private UserDetailsService userDetailsService;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@Autowired(required = false)
	private JavaMailSender mailSender;
	@Value("${spring.mail.from:no-reply@humancloud.com}")
	private String mailFrom;

	@PostMapping("/login")
	public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) throws Exception {
		User user = userRepository.findByEmail(authRequest.getEmail())
				.orElseThrow(() -> new RuntimeException("Incorrect email or password"));

		if (!user.isEmailVerified()) {
			throw new Exception("Email not verified. Check your inbox for the OTP.");
		}

		try {
			authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));
		} catch (Exception e) {
			throw new Exception("Incorrect email or password", e);
		}

		final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());
		final String jwt = jwtTokenUtil.generateToken(userDetails);

		return ResponseEntity.ok(new AuthResponse(jwt, user.getEmail(), user.getName(), user.getRole()));
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody AuthRequest authRequest) {
		// Validations
		if (authRequest.getName() == null || !authRequest.getName().matches("^[a-zA-Z\\s]+$")) {
			return ResponseEntity.badRequest().body("Error: Name must contain only alphabets (capital or small) and spaces.");
		}
		if (authRequest.getEmail() == null || !authRequest.getEmail().contains("@")) {
			return ResponseEntity.badRequest().body("Error: Invalid email address. It must contain '@'.");
		}
		if (authRequest.getPassword() == null || !authRequest.getPassword().matches("^(?=.*[A-Z])(?=.*[@#$%^&+=!;]).+$")) {
			return ResponseEntity.badRequest().body("Error: Password must contain at least one uppercase letter and one special character (e.g., @).");
		}

		User user = userRepository.findByEmail(authRequest.getEmail()).orElse(null);

		if (user != null && user.isEmailVerified()) {
			return ResponseEntity.badRequest().body("Error: Email is already in use!");
		}

		String otp = generateOtp();
		Instant expiresAt = Instant.now().plusSeconds(600);

		if (user == null) {
			user = new User();
			user.setEmail(authRequest.getEmail());
		}

		user.setName(authRequest.getName() != null ? authRequest.getName() : "New User");
		user.setPasswordHash(passwordEncoder.encode(authRequest.getPassword()));
		user.setRole(authRequest.getRole() != null ? authRequest.getRole().toUpperCase() : "STAFF_MANAGER");
		user.setOtpCode(otp);
		user.setOtpExpiresAt(expiresAt);
		user.setEmailVerified(false);
		userRepository.save(user);

		sendVerificationEmail(user.getEmail(), otp);
		return ResponseEntity.ok(Collections.singletonMap("message",
				"OTP sent to your email. Enter the code to verify and complete registration."));
	}

	@GetMapping("/verify-email")
	public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String email, @RequestParam String otp) {
		return handleOtpVerification(email, otp);
	}

	@PostMapping("/verify-otp")
	public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody OtpVerificationRequest otpRequest) {
		return handleOtpVerification(otpRequest.getEmail(), otpRequest.getOtp());
	}

	private ResponseEntity<Map<String, String>> handleOtpVerification(String email, String otp) {
		User user = userRepository.findByEmail(email).orElse(null);

		if (user == null) {
			return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Invalid email or OTP."));
		}

		if (user.isEmailVerified()) {
			return ResponseEntity.ok(Collections.singletonMap("message", "Email is already verified."));
		}

		if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
			return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Invalid OTP code."));
		}

		if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(Instant.now())) {
			return ResponseEntity.badRequest()
					.body(Collections.singletonMap("message", "OTP has expired. Please request a new code."));
		}

		user.setEmailVerified(true);
		user.setOtpCode(null);
		user.setOtpExpiresAt(null);
		userRepository.save(user);

		return ResponseEntity
				.ok(Collections.singletonMap("message", "Email verified successfully. You can now log in."));
	}

	private String generateOtp() {
		Random random = new Random();
		int code = 100000 + random.nextInt(900000);
		return String.valueOf(code);
	}

	private void sendVerificationEmail(String toEmail, String otp) {
		String verifyLink = "http://localhost:8080/api/v1/auth/verify-email?email="
				+ URLEncoder.encode(toEmail, StandardCharsets.UTF_8) + "&otp="
				+ URLEncoder.encode(otp, StandardCharsets.UTF_8);

		String body = "Your verification code is: " + otp + "\n\n"
				+ "Enter this code in the app to complete registration, or click the link below within 10 minutes:\n"
				+ verifyLink + "\n\n" + "If you did not request this, please ignore this email.";

		if (mailSender != null) {
			try {
				SimpleMailMessage message = new SimpleMailMessage();
				message.setFrom(mailFrom);
				message.setTo(toEmail);
				message.setSubject("WIMS Registration OTP Verification");
				message.setText(body);
				mailSender.send(message);
				return;
			} catch (Exception e) {
				System.err.println("Failed to send OTP email: " + e.getMessage());
			}
		}
		System.out.println("[OTP] email=" + toEmail + " code=" + otp + " link=" + verifyLink
				+ " (configure SMTP to send real e-mail)");
	}
}
