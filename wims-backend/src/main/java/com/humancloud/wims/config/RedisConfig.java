package com.humancloud.wims.config;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration

public class RedisConfig {
    // Spring Boot automatically configures a RedisCacheManager
    // because spring-boot-starter-data-redis is on the classpath.
}
