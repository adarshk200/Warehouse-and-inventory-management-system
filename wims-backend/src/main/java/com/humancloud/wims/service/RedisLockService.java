package com.humancloud.wims.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RedisLockService {
    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private final ConcurrentHashMap<String, Boolean> localLocks = new ConcurrentHashMap<>();

    // Tries to acquire a lock for a specific product. Returns true if acquired.
    public boolean acquireLock(String lockKey) {
        try {
            if (redisTemplate != null) {
                Boolean success = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(10));
                if (success != null && success) {
                    return true;
                }
            }
        } catch (Exception e) {
            System.err.println("Redis connection failed. Falling back to local lock: " + e.getMessage());
        }
        // Fallback to local locks
        return localLocks.putIfAbsent(lockKey, true) == null;
    }

    public void releaseLock(String lockKey) {
        try {
            if (redisTemplate != null) {
                redisTemplate.delete(lockKey);
            }
        } catch (Exception e) {
            System.err.println("Redis connection failed on release. Falling back to local release: " + e.getMessage());
        }
        localLocks.remove(lockKey);
    }
}
