# Docker MySQL Setup Guide

## 1. Search and Install MySQL

```bash
docker search mysql
```

## 2. Run MySQL Container

```bash
docker run --name testmysql1.0.0 -p 3308:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql:latest --max_connections=1000
```

## 3. Setup Database and User

### Connect as root user:
```bash
docker exec -it testmysql1.0.0 bash
mysql -uroot -proot
```

### Create user and database:
```sql
CREATE USER 'testuser'@'%' IDENTIFIED BY 'testpass';
CREATE DATABASE aliconcon;
GRANT ALL PRIVILEGES ON aliconcon.* TO 'testuser'@'%';
FLUSH PRIVILEGES;
```

## 4. Database Management Commands

### Connect as test user:
```bash
docker exec -it testmysql1.0.0 bash
mysql -utestuser -ptestpass
```

### Monitor connections:
```sql
show processlist;
```

### Kill connection:
```sql
kill Id;
```

### Check configuration:
```sql
show variables like "max_connections";
show status where `variable_name` = 'Threads_connected';
```

### Check timeout settings:
```sql
SHOW SESSION VARIABLES LIKE 'wait_timeout';
```

**Expected output:**
```
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| wait_timeout  | 28800 |
+---------------+-------+
```

## 5. Performance Testing

### Load testing command:
```bash
ab -c 20 -t 10 http://localhost:8080/normal
```

## 6. Performance Test Results

### Test 1 - Normal Connection (without pooling)

| Test Run | Concurrency Level | Time (seconds) | Complete Requests | Requests/sec |
|----------|-------------------|----------------|-------------------|--------------|
| 1        | 20               | 10.004         | 3,070            | ~307         |
| 2        | 20               | 10.007         | 3,634            | ~363         |
| 3        | 20               | 10.010         | 3,628            | ~362         |

**Average:** ~344 requests/second

### Test 2 - Connection Pool

| Test Run | Concurrency Level | Time (seconds) | Complete Requests | Requests/sec |
|----------|-------------------|----------------|-------------------|--------------|
| 1        | 20               | 10.005         | 11,807           | ~1,180       |
| 2        | 20               | 10.003         | 11,897           | ~1,189       |
| 3        | 20               | 10.000         | 11,853           | ~1,185       |

**Average:** ~1,185 requests/second

### Performance Summary

- **Connection Pool Performance:** ~3.4x better than normal connections
- **Improvement:** Connection pooling provides approximately 244% performance increase
- **Recommended:** Use connection pooling for production applications
