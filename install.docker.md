# Docker MySQL Setup Guide

Complete guide for setting up MySQL with Docker for the MySQL Express Connection Performance Demo.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Database Configuration](#database-configuration)
- [Sample Data Setup](#sample-data-setup)
- [Connection Testing](#connection-testing)
- [Performance Testing](#performance-testing)
- [Monitoring and Debugging](#monitoring-and-debugging)
- [Troubleshooting](#troubleshooting)
- [Cleanup](#cleanup)

## 🔧 Prerequisites

Before starting, ensure you have:

- **Docker** installed and running
- **Docker Compose** (optional, for advanced setups)
- **Apache Bench (ab)** for performance testing
- **curl** for endpoint testing
- Basic knowledge of MySQL and Docker commands

## 🚀 Quick Start

For immediate setup, run these commands:

```bash
# 1. Pull and run MySQL container
docker run --name testmysql1.0.0 -p 3308:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql:latest --max_connections=1000

# 2. Wait for MySQL to start (check logs)
docker logs testmysql1.0.0

# 3. Create database and user
docker exec -it testmysql1.0.0 mysql -uroot -proot -e "
CREATE USER 'testuser'@'%' IDENTIFIED BY 'testpass';
CREATE DATABASE aliconcon;
GRANT ALL PRIVILEGES ON aliconcon.* TO 'testuser'@'%';
FLUSH PRIVILEGES;"

# 4. Create sample table and data
docker exec -it testmysql1.0.0 mysql -utestuser -ptestpass aliconcon -e "
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO user (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Wilson', 'bob@example.com'),
    ('Alice Johnson', 'alice@example.com'),
    ('Charlie Brown', 'charlie@example.com');"

# 5. Verify setup
docker exec -it testmysql1.0.0 mysql -utestuser -ptestpass aliconcon -e "SELECT COUNT(*) as user_count FROM user;"
```

## 📖 Detailed Setup

### 1. Search and Pull MySQL Image

```bash
# Search for available MySQL images
docker search mysql

# Pull the latest MySQL image
docker pull mysql:latest
```

### 2. Run MySQL Container

```bash
# Run MySQL container with optimized settings
docker run --name testmysql1.0.0 \
  -p 3308:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=aliconcon \
  -e MYSQL_USER=testuser \
  -e MYSQL_PASSWORD=testpass \
  -d mysql:latest \
  --max_connections=1000 \
  --innodb_buffer_pool_size=256M \
  --query_cache_size=64M
```

**Container Configuration:**
- **Name:** `testmysql1.0.0`
- **Port Mapping:** `3308:3306` (host:container)
- **Root Password:** `root`
- **Max Connections:** 1000
- **Buffer Pool:** 256MB for better performance

### 3. Verify Container Status

```bash
# Check if container is running
docker ps

# View container logs
docker logs testmysql1.0.0

# Check container resource usage
docker stats testmysql1.0.0
```

## 🗄️ Database Configuration

### Connect as Root User

```bash
# Interactive connection
docker exec -it testmysql1.0.0 bash
mysql -uroot -proot

# Direct command execution
docker exec -it testmysql1.0.0 mysql -uroot -proot
```

### Create Database and User

```sql
-- Create the test user
CREATE USER 'testuser'@'%' IDENTIFIED BY 'testpass';

-- Create the application database
CREATE DATABASE aliconcon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges
GRANT ALL PRIVILEGES ON aliconcon.* TO 'testuser'@'%';
GRANT PROCESS ON *.* TO 'testuser'@'%';
FLUSH PRIVILEGES;

-- Verify user creation
SELECT User, Host FROM mysql.user WHERE User = 'testuser';

-- Verify database creation
SHOW DATABASES;
```

### Connect as Test User

```bash
# Interactive connection
docker exec -it testmysql1.0.0 bash
mysql -utestuser -ptestpass

# Direct connection to specific database
docker exec -it testmysql1.0.0 mysql -utestuser -ptestpass aliconcon
```

## 📊 Sample Data Setup

### Create User Table

```sql
USE aliconcon;

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);
```

### Insert Sample Data

```sql
-- Insert initial test data
INSERT INTO user (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Wilson', 'bob@example.com'),
    ('Alice Johnson', 'alice@example.com'),
    ('Charlie Brown', 'charlie@example.com'),
    ('Diana Prince', 'diana@example.com'),
    ('Edward Norton', 'edward@example.com'),
    ('Fiona Green', 'fiona@example.com'),
    ('George Miller', 'george@example.com'),
    ('Helen Davis', 'helen@example.com');

-- Verify data insertion
SELECT COUNT(*) as total_users FROM user;
SELECT * FROM user LIMIT 5;
```

### Generate More Test Data (Optional)

```sql
-- Create a procedure to generate more test data
DELIMITER $$
CREATE PROCEDURE GenerateTestUsers(IN num_users INT)
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= num_users DO
        INSERT INTO user (name, email) VALUES 
            (CONCAT('User', i), CONCAT('user', i, '@test.com'));
        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;

-- Generate 100 additional users
CALL GenerateTestUsers(100);

-- Verify total count
SELECT COUNT(*) as total_users FROM user;
```

## 🔗 Connection Testing

### Test Database Connectivity

```bash
# Test connection from host
docker exec testmysql1.0.0 mysql -utestuser -ptestpass aliconcon -e "SELECT 'Connection successful' as status;"

# Test with application endpoints (ensure Node.js app is running)
curl http://localhost:8080/normal
curl http://localhost:8080/pool
curl http://localhost:8080/pool2
```

### Verify Application Configuration

```bash
# Check if the application can connect to all endpoints
echo "Testing /normal endpoint:"
curl -s http://localhost:8080/normal | jq '.[0:2]'

echo "Testing /pool endpoint:"
curl -s http://localhost:8080/pool | jq '.[0:2]'

echo "Testing /pool2 endpoint:"
curl -s http://localhost:8080/pool2 | jq '.[0:2]'
```

## 📈 Performance Testing

### Apache Bench Testing Commands

```bash
# Test normal connections (creates new connection each time)
ab -c 20 -t 10 http://localhost:8080/normal

# Test connection pooling (recommended approach)
ab -c 20 -t 10 http://localhost:8080/pool2

# Test with specific number of requests
ab -n 100 -c 10 -v 2 http://localhost:8080/normal
ab -n 100 -c 10 -v 2 http://localhost:8080/pool2

# Test rate limiting (should show failures after 20 requests)
ab -n 40 -c 10 -v 2 http://localhost:8080/normal
```

### Performance Test Parameters Explained

```bash
# ab -c 20 -t 10 http://localhost:8080/normal
# -c 20: 20 concurrent connections
# -t 10: Run test for 10 seconds
# Measures: Total requests, requests/second, response time

# ab -n 100 -c 10 http://localhost:8080/normal  
# -n 100: Send exactly 100 requests total
# -c 10: 10 concurrent connections
# Each connection sends 10 requests (100÷10=10)
```

### Expected Performance Results

#### Test 1 - Normal Connection (`/normal`)

| Test Run | Concurrency | Duration | Complete Requests | Requests/sec | Avg Response Time |
|----------|-------------|----------|-------------------|--------------|-------------------|
| 1        | 20          | 10.004s  | 3,070             | ~307         | 65ms              |
| 2        | 20          | 10.007s  | 3,634             | ~363         | 55ms              |
| 3        | 20          | 10.010s  | 3,628             | ~362         | 55ms              |

**Average:** ~344 requests/second

#### Test 2 - Connection Pool (`/pool2`)

| Test Run | Concurrency | Duration | Complete Requests | Requests/sec | Avg Response Time |
|----------|-------------|----------|-------------------|--------------|-------------------|
| 1        | 20          | 10.005s  | 11,807            | ~1,180       | 17ms              |
| 2        | 20          | 10.003s  | 11,897            | ~1,189       | 17ms              |
| 3        | 20          | 10.000s  | 11,853            | ~1,185       | 17ms              |

**Average:** ~1,185 requests/second

#### Performance Summary

- **Connection Pool Performance:** ~3.4x better than normal connections
- **Performance Improvement:** 244% increase with connection pooling
- **Response Time Improvement:** ~70% faster response times
- **Recommendation:** Always use connection pooling for production applications

### Rate Limiting Test Results

```bash
# Expected output when hitting rate limits:
{"error":"Too many requests","message":"Too many requests. Maximum 20 requests per minutes."}

# Apache Bench results:
Concurrency Level: 10
Time taken for tests: 0.191 seconds
Complete requests: 40
Failed requests: 20  # Due to rate limiting
```

## 🔍 Monitoring and Debugging

### Database Connection Monitoring

```sql
-- Show current connections
SHOW PROCESSLIST;

-- Check connection statistics
SHOW STATUS WHERE Variable_name IN (
    'Threads_connected',
    'Threads_running',
    'Max_used_connections',
    'Connections'
);

-- Check configuration variables
SHOW VARIABLES WHERE Variable_name IN (
    'max_connections',
    'wait_timeout',
    'interactive_timeout',
    'connect_timeout'
);
```

### Performance Monitoring

```sql
-- Check timeout settings
SHOW SESSION VARIABLES LIKE 'wait_timeout';
-- Expected output:
-- +---------------+-------+
-- | Variable_name | Value |
-- +---------------+-------+
-- | wait_timeout  | 28800 |
-- +---------------+-------+

-- Monitor query performance
SHOW STATUS LIKE 'Slow_queries';
SHOW STATUS LIKE 'Questions';

-- Check buffer pool usage
SHOW STATUS LIKE 'Innodb_buffer_pool%';
```

### Connection Management Commands

```sql
-- Kill specific connection (replace ID with actual process ID)
KILL <process_id>;

-- Kill all connections from specific user
SELECT CONCAT('KILL ', id, ';') FROM INFORMATION_SCHEMA.PROCESSLIST 
WHERE USER = 'testuser' AND COMMAND != 'Sleep';

-- Check for locked tables
SHOW OPEN TABLES WHERE In_use > 0;
```

### Docker Container Monitoring

```bash
# Monitor container resources
docker stats testmysql1.0.0

# View detailed container information
docker inspect testmysql1.0.0

# Monitor container logs in real-time
docker logs -f testmysql1.0.0

# Check container health
docker exec testmysql1.0.0 mysqladmin -uroot -proot ping
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Container Won't Start

```bash
# Check if port 3308 is already in use
netstat -tulpn | grep 3308
lsof -i :3308

# Stop conflicting services or use different port
docker run --name testmysql1.0.0 -p 3309:3306 ...
```

#### 2. Connection Refused

```bash
# Verify container is running
docker ps | grep testmysql

# Check container logs for errors
docker logs testmysql1.0.0

# Restart container if needed
docker restart testmysql1.0.0
```

#### 3. Authentication Failed

```bash
# Reset user password
docker exec -it testmysql1.0.0 mysql -uroot -proot -e "
ALTER USER 'testuser'@'%' IDENTIFIED BY 'testpass';
FLUSH PRIVILEGES;"

# Verify user exists
docker exec -it testmysql1.0.0 mysql -uroot -proot -e "
SELECT User, Host FROM mysql.user WHERE User = 'testuser';"
```

#### 4. Database Not Found

```bash
# Recreate database
docker exec -it testmysql1.0.0 mysql -uroot -proot -e "
CREATE DATABASE IF NOT EXISTS aliconcon;
SHOW DATABASES;"
```

#### 5. Performance Issues

```sql
-- Check for long-running queries
SELECT * FROM INFORMATION_SCHEMA.PROCESSLIST 
WHERE COMMAND != 'Sleep' AND TIME > 5;

-- Optimize table if needed
OPTIMIZE TABLE user;

-- Update table statistics
ANALYZE TABLE user;
```

### Debug Application Connection

```bash
# Test Node.js application connectivity
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'localhost',
  user: 'testuser',
  port: '3308',
  password: 'testpass',
  database: 'aliconcon'
}).then(conn => {
  console.log('Connection successful');
  conn.end();
}).catch(err => {
  console.error('Connection failed:', err.message);
});
"
```

## 🧹 Cleanup

### Stop and Remove Container

```bash
# Stop the container
docker stop testmysql1.0.0

# Remove the container
docker rm testmysql1.0.0

# Remove the MySQL image (optional)
docker rmi mysql:latest

# Clean up unused Docker resources
docker system prune -f
```

### Backup Data Before Cleanup (Optional)

```bash
# Create database backup
docker exec testmysql1.0.0 mysqldump -utestuser -ptestpass aliconcon > backup.sql

# Restore from backup (after recreating container)
docker exec -i testmysql1.0.0 mysql -utestuser -ptestpass aliconcon < backup.sql
```

## 📚 Additional Resources

- [MySQL Docker Hub](https://hub.docker.com/_/mysql)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Apache Bench Documentation](https://httpd.apache.org/docs/2.4/programs/ab.html)
- [Node.js MySQL2 Documentation](https://github.com/sidorares/node-mysql2)

---

**Note:** This setup is optimized for development and testing. For production use, implement proper security measures, persistent volumes, backup strategies, and monitoring solutions.
