package com.humancloud.wims.controller;

import com.humancloud.wims.dto.OrderRequest;
import com.humancloud.wims.entity.Order;
import com.humancloud.wims.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {
	@Autowired
	private OrderService orderService;

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER', 'USER')")
	public List<Order> getAllOrders() {
		return orderService.getAllOrders();
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER', 'USER')")
	public Order getOrder(@PathVariable UUID id) {
		return orderService.getOrderById(id);
	}

	@PostMapping
	@PreAuthorize("isAuthenticated()")
	public Order placeOrder(@RequestBody OrderRequest request) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		System.out.println("🔐 PlaceOrder - User: " + auth.getName() + " | Principal: " + auth.getPrincipal() + " | Authorities: " + auth.getAuthorities());
		return orderService.createOrder(request);
	}

	@PutMapping("/{id}/status")
	@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
	public Order updateStatus(@PathVariable UUID id, @RequestBody String status) {
		return orderService.updateOrderStatus(id, status);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
	public void cancelOrder(@PathVariable UUID id) {
		orderService.deleteOrder(id);
	}
}
