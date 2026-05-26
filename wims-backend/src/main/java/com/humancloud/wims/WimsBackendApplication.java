package com.humancloud.wims;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class WimsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(WimsBackendApplication.class, args);
	}

}
