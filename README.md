# MySQL Express Connection Performance Demo

This project demonstrates the performance differences between normal MySQL connections and connection pooling in a Node.js Express application.

## Overview

The application provides three endpoints to compare different MySQL connection strategies:

- `/normal` - Creates a new connection for each request (closes connection after use)
- `/pool` - Uses connection pooling with manual connection management (explicit acquire/release)
- `/pool2` - Uses connection pooling with automatic connection management (pool handles lifecycle)

## Features

- **Express.js** web server with middleware stack
- **MySQL2** database driver with Promise support
- **Connection Pooling** performance comparison
- **Rate Limiting** middleware (configurable, default: 20 requests per minute)
- **Response Time** tracking middleware
- **Morgan** HTTP request logging
- **Comprehensive Error Handling** for database operations
- **Performance Testing** setup with Apache Bench

## Prerequisites

- Node.js (v14 or higher)
- Docker (for MySQL setup)
- Apache Bench (ab) for performance testing

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mysql-express-create-connect
```

2. Install dependencies:
```bash
npm install
```

3. Set up MySQL using Docker (see [Docker Setup Guide](install.docker.md)):
```bash
docker run --name testmysql1.0.0 -p 3308:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql:latest --max_connections=1000
```

4. Create database and user (detailed steps in [install.docker.md](install.docker.md)):
```sql
CREATE USER 'testuser'@'%' IDENTIFIED BY 'testpass';
CREATE DATABASE aliconcon;
GRANT ALL PRIVILEGES ON aliconcon.* TO 'testuser'@'%';
FLUSH PRIVILEGES;
```

5. Create a test table and add some data:
```sql
USE aliconcon;
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);
INSERT INTO user (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Wilson', 'bob@example.com');
```

## Usage

1. Start the server:
```bash
npm run dev
```
The server will start on port 8080.

2. Test the endpoints:
```bash
# Normal connection (new connection per request)
curl http://localhost:8080/normal

# Connection pool with manual management
curl http://localhost:8080/pool

# Connection pool with automatic management (recommended)
curl http://localhost:8080/pool2
```

## Performance Testing

Use Apache Bench to compare performance between connection strategies:

```bash
# Test normal connections
ab -c 20 -t 10 http://localhost:8080/normal

# Test connection pooling (recommended approach)
ab -c 20 -t 10 http://localhost:8080/pool2

# Test with specific number of requests
ab -n 100 -c 10 http://localhost:8080/normal
ab -n 100 -c 10 http://localhost:8080/pool2
```

### Performance Results

Based on load testing with 20 concurrent connections over 10 seconds:

| Connection Type | Avg Requests/Second | Performance Gain |
|----------------|---------------------|------------------|
| Normal (`/normal`) | ~344 | Baseline |
| Pool (`/pool2`) | ~1,185 | **3.4x faster** |

**Key Findings:**
- Connection pooling provides approximately **244% performance improvement**
- Pool connections handle ~3.4x more requests per second
- Significantly reduced connection overhead
- **Strongly recommended for production applications**

## Project Structure

```
├── server.js                 # Main server entry point
├── src/
│   ├── app.js                # Express application and route definitions
│   ├── dbs/
│   │   ├── normal.js         # Normal connection (creates new connection each time)
│   │   └── pool2.js          # Connection pool implementation
│   └── middlewares/
│       └── ratelimit.js      # Configurable rate limiting middleware
├── install.docker.md        # Comprehensive Docker MySQL setup guide
├── package.json             # Project dependencies and scripts
└── README.md               # This file
```

## Configuration

### Database Configuration
- **Host:** localhost
- **Port:** 3308 (mapped from Docker container)
- **User:** testuser
- **Password:** testpass
- **Database:** aliconcon
- **Connection Pool Limit:** 10 concurrent connections
- **Multiple Statements:** Enabled

### Rate Limiting
- **Window:** 1 minute (60,000ms)
- **Max Requests:** 20 per minute (configurable)
- **Error Response:** JSON with error details

### Server Configuration
- **Port:** 8080
- **Graceful Shutdown:** SIGINT handling

## Middleware Stack

The application uses the following middleware in order:

1. **Morgan** (`dev` format) - HTTP request logging
2. **Response Time** - Adds `X-Response-Time` header
3. **Rate Limiter** - Configurable request limiting (default: 20/minute)

## Connection Strategies Explained

### Normal Connection (`/normal`)
- Creates a new MySQL connection for each request
- Executes query and immediately closes connection
- Higher overhead due to connection establishment/teardown
- Suitable for low-traffic applications

### Connection Pool (`/pool`)
- Manually acquires connection from pool
- Explicitly releases connection back to pool
- Better resource management
- Requires careful connection lifecycle handling

### Connection Pool Auto (`/pool2`)
- Pool automatically manages connection lifecycle
- Simplest implementation with best performance
- **Recommended approach for production**

## Error Handling

All endpoints include comprehensive error handling:

- **Database Connection Errors:** Proper error catching and logging
- **Query Execution Errors:** Detailed error messages
- **HTTP Status Codes:** Appropriate 500 responses for server errors
- **Connection Cleanup:** Ensures connections are properly released
- **Rate Limiting:** Clear error messages when limits exceeded

## Monitoring and Debugging

### Built-in Monitoring
- Response time tracking via middleware
- Request logging with Morgan
- Rate limit monitoring
- Database error logging

### Database Monitoring Commands
```sql
-- Check active connections
SHOW PROCESSLIST;

-- Check connection limits
SHOW VARIABLES LIKE "max_connections";
SHOW STATUS WHERE `variable_name` = 'Threads_connected';

-- Check timeout settings
SHOW SESSION VARIABLES LIKE 'wait_timeout';
```

## Docker Setup

For detailed MySQL setup instructions using Docker, including performance tuning and connection monitoring, see [install.docker.md](install.docker.md).

## Testing and Validation

### Basic Functionality Test
```bash
# Test all endpoints
curl http://localhost:8080/normal
curl http://localhost:8080/pool
curl http://localhost:8080/pool2
```

### Performance Comparison
```bash
# Compare normal vs pooled connections
ab -n 100 -c 10 -v 2 http://localhost:8080/normal
ab -n 100 -c 10 -v 2 http://localhost:8080/pool2
```

### Rate Limit Testing
```bash
# Test rate limiting (should fail after 20 requests)
for i in {1..25}; do 
  echo "Request $i:"
  curl http://localhost:8080/normal
  echo ""
done
```

## Production Considerations

For production deployment, consider:

- **Environment Variables:** Move database credentials to environment variables
- **Security:** Implement proper authentication and authorization
- **SSL/TLS:** Enable secure database connections
- **Connection Pool Tuning:** Adjust pool size based on load requirements
- **Monitoring:** Add comprehensive application monitoring
- **Error Logging:** Implement structured logging with log levels
- **Health Checks:** Add health check endpoints
- **Load Balancing:** Consider multiple application instances

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

## License

ISC

---

**Note**: This is a demonstration project for educational purposes showing MySQL connection performance patterns. For production use, implement additional security measures, environment-based configuration, comprehensive testing, and monitoring.