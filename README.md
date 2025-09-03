# MySQL Express Connection Performance Demo

A Node.js Express application demonstrating the performance difference between normal MySQL connections and connection pooling.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Performance Testing](#performance-testing)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)

## 🔍 Overview

This project demonstrates the significant performance improvements achieved by using MySQL connection pooling versus creating new connections for each database request. The application provides three endpoints to compare different connection strategies.

## ✨ Features

- **Normal Connection**: Creates a new MySQL connection for each request
- **Connection Pool**: Uses MySQL connection pooling for better performance
- **Performance Comparison**: Built-in endpoints to test and compare performance
- **Error Handling**: Comprehensive error handling for database operations
- **Logging**: Request logging with Morgan middleware

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Docker** (for MySQL setup)
- **Apache Bench (ab)** (for performance testing)

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mysql-express-create-connect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8080`

## 🗄️ Database Setup

Follow the detailed setup guide in [install.docker.md](./install.docker.md) to:

1. Set up MySQL using Docker
2. Create the required database and user
3. Configure the connection settings

### Quick Setup Summary:

```bash
# Run MySQL container
docker run --name testmysql1.0.0 -p 3308:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql:latest --max_connections=1000

# Create database and user
docker exec -it testmysql1.0.0 bash
mysql -uroot -proot

# SQL commands
CREATE USER 'testuser'@'%' IDENTIFIED BY 'testpass';
CREATE DATABASE aliconcon;
GRANT ALL PRIVILEGES ON aliconcon.* TO 'testuser'@'%';
FLUSH PRIVILEGES;

# Create a sample user table
USE aliconcon;
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

# Insert sample data
INSERT INTO user (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Bob Johnson', 'bob@example.com');
```

## 🎯 Usage

Start the server and access the following endpoints to see the different connection methods in action:

```bash
npm run dev
```

## 📡 API Endpoints

### GET `/normal`
- **Description**: Fetches users using normal MySQL connections
- **Method**: Creates a new connection for each request
- **Performance**: Lower performance due to connection overhead
- **Response**: JSON array of users

### GET `/pool`
- **Description**: Fetches users using connection pooling (manual connection management)
- **Method**: Gets connection from pool, manually releases it
- **Performance**: High performance with proper connection management
- **Response**: JSON array of users

### GET `/pool2`
- **Description**: Fetches users using connection pooling (automatic management)
- **Method**: Uses pool.execute() for automatic connection handling
- **Performance**: High performance with simplified code
- **Response**: JSON array of users

## 📊 Performance Testing

Use Apache Bench to test the performance difference:

```bash
# Test normal connections
ab -c 20 -t 10 http://localhost:8080/normal

# Test connection pooling
ab -c 20 -t 10 http://localhost:8080/pool
ab -c 20 -t 10 http://localhost:8080/pool2
```

### Expected Results:
- **Normal connections**: ~344 requests/second
- **Connection pooling**: ~1,185 requests/second
- **Performance improvement**: ~244% increase with pooling

## 📁 Project Structure

```
mysql-express-create-connect/
├── src/
│   ├── app.js              # Express application setup and routes
│   └── dbs/
│       ├── normal.js       # Normal MySQL connection
│       └── pool2.js        # MySQL connection pool
├── server.js               # Server startup and configuration
├── package.json            # Project dependencies and scripts
├── install.docker.md       # Docker MySQL setup guide
└── README.md              # Project documentation
```

## ⚙️ Configuration

### Database Configuration

The application connects to MySQL with the following default settings:

```javascript
{
  host: 'localhost',
  user: 'testuser',
  port: '3308',
  password: 'testpass',
  database: 'aliconcon',
  connectionLimit: 10  // For pool connections only
}
```

### Environment Variables

You can customize the configuration by modifying the connection settings in:
- `src/dbs/normal.js` - For normal connections
- `src/dbs/pool2.js` - For pooled connections

## 🔧 Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm test` - Run tests (currently not implemented)

### Adding New Endpoints

1. Add your route in `src/app.js`
2. Create database connection logic
3. Implement error handling
4. Test the endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Performance Insights

This project demonstrates that:

- **Connection pooling** significantly improves performance
- **Resource management** is crucial for scalable applications
- **Proper error handling** ensures application stability
- **Connection limits** prevent database overload

## 🐛 Troubleshooting

### Common Issues:

1. **Connection refused**: Ensure MySQL container is running
2. **Authentication failed**: Check username/password in database files
3. **Port conflicts**: Verify port 3308 is available
4. **Database not found**: Ensure 'aliconcon' database exists

### Debug Steps:

1. Check Docker container status: `docker ps`
2. View container logs: `docker logs testmysql1.0.0`
3. Test database connection manually
4. Verify user table exists and has data

## 📄 License

This project is licensed under the ISC License.

---

**Note**: This is a demonstration project for educational purposes. For production use, consider additional security measures, environment variable configuration, and comprehensive testing.