package com.humancloud.wims.config;

import com.humancloud.wims.entity.*;
import com.humancloud.wims.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubcategoryRepository subcategoryRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // 1. Seed Users (only if not exist)
        try {

            if (userRepository.findByEmail("admin@humancloud.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@humancloud.com");
                admin.setName("Admin User");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
                System.out.println("Seeded admin user: admin@humancloud.com / admin123");
            }

            if (userRepository.findByEmail("manager@humancloud.com").isEmpty()) {
                User manager = new User();
                manager.setEmail("manager@humancloud.com");
                manager.setName("Warehouse Manager");
                manager.setPasswordHash(passwordEncoder.encode("manager123"));
                manager.setRole("WAREHOUSE_MANAGER");
                userRepository.save(manager);
                System.out.println("Seeded manager user: manager@humancloud.com / manager123");
            }

            if (userRepository.findByEmail("staff@humancloud.com").isEmpty()) {
                User staff = new User();
                staff.setEmail("staff@humancloud.com");
                staff.setName("Staff Manager");
                staff.setPasswordHash(passwordEncoder.encode("staff123"));
                staff.setRole("STAFF_MANAGER");
                userRepository.save(staff);
                System.out.println("Seeded staff manager user: staff@humancloud.com / staff123");
            }

        } catch (Exception e) {
            System.out.println("Error seeding users: " + e.getMessage());
        }

        // 2. Seed default Categories and Subcategories
        Category construction = categoryRepository.findByName("Construction Materials")
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Construction Materials");
                    cat.setDescription("Structural and raw materials for building");
                    return categoryRepository.save(cat);
                });

        Category chemicals = categoryRepository.findByName("Chemicals & Polymers")
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setName("Chemicals & Polymers");
                    cat.setDescription("Industrial chemicals and plastic polymers");
                    return categoryRepository.save(cat);
                });

        Subcategory steelSub = subcategoryRepository.findByNameAndCategoryId("Steel Products", construction.getId())
                .orElseGet(() -> {
                    Subcategory sub = new Subcategory();
                    sub.setName("Steel Products");
                    sub.setDescription("Steel beams, rods, and structural grids");
                    sub.setCategory(construction);
                    return subcategoryRepository.save(sub);
                });

        Subcategory copperSub = subcategoryRepository.findByNameAndCategoryId("Copper Products", construction.getId())
                .orElseGet(() -> {
                    Subcategory sub = new Subcategory();
                    sub.setName("Copper Products");
                    sub.setDescription("Electrical wiring and copper plumbing components");
                    sub.setCategory(construction);
                    return subcategoryRepository.save(sub);
                });

        Subcategory polymerSub = subcategoryRepository.findByNameAndCategoryId("Advanced Polymers", chemicals.getId())
                .orElseGet(() -> {
                    Subcategory sub = new Subcategory();
                    sub.setName("Advanced Polymers");
                    sub.setDescription("Polymer pellets, resins, and specialized plastics");
                    sub.setCategory(chemicals);
                    return subcategoryRepository.save(sub);
                });

        // 3. Seed default Warehouse
        Warehouse warehouse;
        if (warehouseRepository.findAll().isEmpty()) {
            warehouse = new Warehouse();
            warehouse.setName("Central Hub Alpha");
            warehouse.setLocation("Seattle, WA");
            warehouse.setCapacity(10000);
            warehouse = warehouseRepository.save(warehouse);
            System.out.println("Seeded default warehouse: Central Hub Alpha");
        } else {
            warehouse = warehouseRepository.findAll().get(0);
        }

        // 4. Seed Products and Inventory if none exist
        if (productRepository.findAll().isEmpty()) {
            createProductAndInventory("SKU-STEEL-001", "High-Grade Steel Girders", new BigDecimal("150.00"), new BigDecimal("250.5"), steelSub, warehouse, 100);
            createProductAndInventory("SKU-COPPER-002", "Industrial Copper Wire Spools", new BigDecimal("85.50"), new BigDecimal("45.0"), copperSub, warehouse, 250);
            createProductAndInventory("SKU-POLY-003", "Advanced Polymer Pellets", new BigDecimal("42.00"), new BigDecimal("12.5"), polymerSub, warehouse, 500);
            System.out.println("Seeded default products linked to subcategories");
        }
    }

    private void createProductAndInventory(String sku, String name, BigDecimal price, BigDecimal weight,
                                          Subcategory subcategory, Warehouse warehouse, int qty) {

        Product p = new Product();
        p.setSku(sku);
        p.setName(name);
        p.setPrice(price);
        p.setWeightKg(weight);
        p.setSubcategory(subcategory);
        p = productRepository.save(p);

        Inventory inv = new Inventory();
        inv.setProduct(p);
        inv.setWarehouse(warehouse);
        inv.setAvailableQuantity(qty);
        inv.setReservedQuantity(0);
        inv.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inv);
    }
}