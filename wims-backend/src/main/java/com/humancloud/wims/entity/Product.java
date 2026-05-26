package com.humancloud.wims.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@SQLDelete(sql = "UPDATE products SET is_deleted = true WHERE id=?")
@SQLRestriction("is_deleted=false")
@Entity
@Table(name = "products")
public class Product extends AuditableBaseEntity implements Serializable  {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@JdbcTypeCode(SqlTypes.VARCHAR)
	private UUID id;
	private String sku;
	private String name;
	private BigDecimal price;
	private BigDecimal weightKg;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "subcategory_id")
	private Subcategory subcategory;

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getSku() {
		return sku;
	}

	public void setSku(String sku) {
		this.sku = sku;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public BigDecimal getWeightKg() {
		return weightKg;
	}

	public void setWeightKg(BigDecimal weightKg) {
		this.weightKg = weightKg;
	}

	public Subcategory getSubcategory() {
		return subcategory;
	}

	public void setSubcategory(Subcategory subcategory) {
		this.subcategory = subcategory;
	}
}


