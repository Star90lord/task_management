# Deployment Guide

Complete guide for deploying the Task Management API to production environments.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Local Production Testing](#local-production-testing)
4. [Heroku Deployment](#heroku-deployment)
5. [AWS Deployment](#aws-deployment)
6. [Virtual Private Server (VPS)](#virtual-private-server-vps)
7. [Docker Deployment](#docker-deployment)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No hardcoded secrets in code
- [ ] Updated .env.example
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Database backups created
- [ ] Rate limiting implemented
- [ ] API documentation updated
- [ ] Error logging configured
- [ ] Database indexes created

## Environment Configuration

### Production .env Variables

```env
# Application
NODE_ENV=production
PORT=8000

# Security
JWT_SECRET=generate-a-long-random-string-at-least-32-characters
JWT_EXPIRY=30d

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/taskdb_prod?retryWrites=true&w=majority

# PostgreSQL
PG_HOST=db.example.com
PG_PORT=5432
PG_USER=prod_user
PG_PASSWORD=strong_secure_password
PG_DATABASE=taskdb_prod

# CORS
CLIENT_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

## Local Production Testing

Before deploying to production, test locally:

```bash
# Set production environment
NODE_ENV=production

# Install production dependencies only
npm install --production

# Start the server
npm start

# Test with curl
curl -X GET http://localhost:5000/health
```

## Heroku Deployment

### 1. Create Heroku App
```bash
heroku login
heroku create task-management-api
```

### 2. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set PG_HOST=your-postgres-host
# ... set other variables
```

### 3. Deploy
```bash
git push heroku main
```

### 4. Check Logs
```bash
heroku logs --tail
```

### 5. Scale Dynos (if needed)
```bash
heroku ps:scale web=2
```

## AWS Deployment

### Using Elastic Beanstalk

#### 1. Install EB CLI
```bash
pip install awsebcli --upgrade --user
```

#### 2. Initialize EB Application
```bash
eb init -p node.js-18 task-api --region us-east-1
```

#### 3. Create Environment
```bash
eb create task-api-prod
```

#### 4. Set Environment Variables
```bash
eb setenv NODE_ENV=production JWT_SECRET=xxx MONGO_URI=xxx
```

#### 5. Deploy
```bash
eb deploy
```

#### 6. Monitor
```bash
eb logs
eb health
```

### Using EC2 with PM2

#### 1. Launch EC2 Instance
- AMI: Ubuntu Server 22.04 LTS
- Instance type: t3.small (or larger)
- Security groups: Allow ports 80, 443, 22

#### 2. Connect and Setup
```bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL Client
sudo apt install -y postgresql-client
```

#### 3. Clone Repository
```bash
git clone your-repo-url
cd task_management/backend
npm install --production
```

#### 4. Configure PM2
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: "task-api",
    script: "./server.js",
    instances: 2,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    },
    error_file: "./logs/error.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log"
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Configure Nginx as Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/default
```

```nginx
upstream task_api {
  server localhost:5000;
  server localhost:5001;
}

server {
  listen 80;
  server_name yourdomain.com;

  location / {
    proxy_pass http://task_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Test and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL Certificate (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Docker Deployment

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
```

### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGO_URI: ${MONGO_URI}
      PG_HOST: postgres
      PG_USER: ${PG_USER}
      PG_PASSWORD: ${PG_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - mongodb
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: taskdb
      POSTGRES_USER: ${PG_USER}
      POSTGRES_PASSWORD: ${PG_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - app-network

volumes:
  postgres_data:
  mongodb_data:

networks:
  app-network:
    driver: bridge
```

### 3. Build and Deploy
```bash
docker-compose up -d
docker-compose logs -f
```

## Monitoring & Logging

### Application Monitoring

#### Using New Relic
```bash
npm install newrelic
```

Add to top of server.js:
```javascript
require('newrelic');
```

#### Using PM2+ Monitoring
```bash
pm2 link <secret_key> <public_key>
```

### Log Management

#### Using Winston
```bash
npm install winston
```

Create logger configuration and integrate with app.

#### Using ELK Stack
- Elasticsearch: Log storage
- Logstash: Log processing
- Kibana: Log visualization

## Backup & Recovery

### Database Backups

#### PostgreSQL
```bash
# Automated daily backup
0 2 * * * pg_dump taskdb_prod > /backups/taskdb_$(date +\%Y\%m\%d).sql

# Restore
psql taskdb_prod < /backups/taskdb_20240414.sql
```

#### MongoDB
```bash
# Automated daily backup
0 2 * * * mongodump --out=/backups/mongo_$(date +\%Y\%m\%d)

# Restore
mongorestore /backups/mongo_20240414/
```

### Disaster Recovery Plan

1. **Backup Schedule**: Daily automated backups
2. **Backup Location**: Off-site storage (AWS S3, Azure Blob)
3. **Recovery Testing**: Monthly recovery drills
4. **Documentation**: Keep runbooks updated
5. **Monitoring**: Set up alerts for backup failures

## Performance Optimization

### Database Query Optimization
- Create indexes on frequently queried fields
- Use explain() to analyze queries
- Regular maintenance and vacuuming

### Application Caching
- Implement Redis for session caching
- Cache frequently accessed data
- Use ETags for HTTP caching

### CDN for Static Assets
- CloudFront or Cloudflare
- Compress responses
- Minify JavaScript and CSS

## Security Hardening

- [ ] Update all dependencies
- [ ] Enable rate limiting
- [ ] Implement input validation
- [ ] Use HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set security headers
- [ ] Enable HSTS
- [ ] Regular security audits
- [ ] Implement WAF (Web Application Firewall)
- [ ] Database encryption at rest

## Rollback Procedure

```bash
# Keep previous versions
v1.0.0 (current)
v0.9.0 (previous)
v0.8.0 (backup)

# Quick rollback
pm2 restart task-api
git revert HEAD
npm install
pm2 restart task-api
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check for memory leaks
   - Restart application
   - Scale horizontally

2. **Database Connection Errors**
   - Verify credentials
   - Check network connectivity
   - Review database logs

3. **Slow Response Times**
   - Analyze queries
   - Add database indexes
   - Implement caching

For more help, check logs and monitoring dashboards.
