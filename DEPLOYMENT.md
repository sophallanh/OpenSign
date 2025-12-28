# Deployment Guide for OpenSign

This guide covers deploying OpenSign to production environments.

## Prerequisites

- Domain name with DNS access
- Server with Docker and Docker Compose installed
- SendGrid account with verified sender email
- DigitalOcean Spaces bucket (or AWS S3 compatible storage)
- SSL certificate (recommended: Let's Encrypt)

## Environment Setup

### 1. SendGrid Configuration

1. Sign up for SendGrid at https://sendgrid.com
2. Verify your sender email or domain
3. Create an API key with "Mail Send" permissions
4. Note down your API key and verified sender email

### 2. DigitalOcean Spaces Configuration

1. Log in to DigitalOcean
2. Create a new Space (similar to S3 bucket)
3. Note the endpoint (e.g., `nyc3.digitaloceanspaces.com`)
4. Generate Spaces access keys under API settings
5. Create a bucket for OpenSign documents

### 3. Environment Variables

Create a `.env` file in the project root with the following:

```bash
# JWT Configuration
JWT_SECRET=generate_a_strong_random_string_here_at_least_32_characters

# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# DigitalOcean Spaces Configuration
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your_spaces_access_key_here
DO_SPACES_SECRET=your_spaces_secret_key_here
DO_SPACES_BUCKET=opensign-documents
```

Generate a strong JWT secret:
```bash
openssl rand -base64 32
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### On Your Server

1. Install Docker and Docker Compose:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

2. Clone the repository:
```bash
git clone https://github.com/yourusername/opensign.git
cd opensign
```

3. Create and configure `.env` file (see Environment Setup above)

4. Build and start the application:
```bash
docker-compose up -d --build
```

5. Check logs:
```bash
docker-compose logs -f
```

6. Access the application:
   - Frontend: http://your-server-ip
   - Backend: http://your-server-ip:5000

#### Setting up SSL with Nginx Reverse Proxy

1. Install Nginx and Certbot:
```bash
sudo apt install nginx certbot python3-certbot-nginx
```

2. Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/opensign
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/opensign /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. Obtain SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Manual Deployment

#### Backend Deployment

1. Install Node.js 18+ and MongoDB:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

2. Deploy backend:
```bash
cd backend
npm install --production
cp .env.example .env
# Edit .env with your configuration
```

3. Use PM2 to manage the process:
```bash
sudo npm install -g pm2
pm2 start server.js --name opensign-backend
pm2 startup
pm2 save
```

#### Frontend Deployment

1. Build the frontend:
```bash
cd frontend
npm install
npm run build
```

2. Copy build files to web server:
```bash
sudo cp -r dist/* /var/www/opensign/
```

3. Configure Nginx to serve the frontend (see SSL setup above)

### Option 3: Platform-as-a-Service (PaaS)

#### Heroku Deployment

1. Install Heroku CLI:
```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

2. Create Heroku apps:
```bash
heroku create opensign-backend
heroku create opensign-frontend
```

3. Add MongoDB addon:
```bash
heroku addons:create mongolab:sandbox -a opensign-backend
```

4. Set environment variables:
```bash
heroku config:set JWT_SECRET=your_secret -a opensign-backend
heroku config:set SENDGRID_API_KEY=your_key -a opensign-backend
# Set other variables...
```

5. Deploy:
```bash
# Backend
cd backend
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a opensign-backend
git push heroku master

# Frontend
cd ../frontend
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a opensign-frontend
git push heroku master
```

#### DigitalOcean App Platform

1. Connect your GitHub repository
2. Select the repository and branch
3. Configure build settings:
   - Backend: Node.js, build command: `npm install`, run command: `npm start`
   - Frontend: Node.js, build command: `npm run build`, run command: `nginx`
4. Set environment variables in the dashboard
5. Deploy

## Database Backup

### MongoDB Backup Script

Create a backup script:
```bash
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mongodump --uri="mongodb://localhost:27017/opensign" --out=$BACKUP_DIR/backup_$TIMESTAMP

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

Schedule with cron:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

## Monitoring

### Application Monitoring

1. **PM2 Monitoring** (if using PM2):
```bash
pm2 monit
```

2. **Docker Monitoring**:
```bash
docker stats
docker-compose logs -f
```

3. **Set up alerts** using services like:
   - UptimeRobot for uptime monitoring
   - Sentry for error tracking
   - Datadog or New Relic for APM

### Log Management

Configure log rotation:
```bash
sudo nano /etc/logrotate.d/opensign
```

Add:
```
/var/log/opensign/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

## Security Checklist

- [ ] Use strong, unique JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW)
- [ ] Keep dependencies updated
- [ ] Regular security audits with `npm audit`
- [ ] Set up fail2ban for SSH protection
- [ ] Use environment variables for all secrets
- [ ] Configure CORS properly
- [ ] Enable MongoDB authentication
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity

## Performance Optimization

### Backend
- Use MongoDB indexes for frequently queried fields
- Enable Gzip compression
- Implement caching with Redis (optional)
- Use CDN for static assets

### Frontend
- Enable Nginx gzip compression
- Implement code splitting
- Optimize images
- Use CDN for serving assets

### Database
```javascript
// Add indexes in MongoDB
db.users.createIndex({ email: 1 }, { unique: true })
db.documents.createIndex({ owner: 1, createdAt: -1 })
db.leads.createIndex({ referrer: 1, status: 1 })
db.commissions.createIndex({ referrer: 1, status: 1 })
```

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple Backend Instances**: Scale backend with Docker Swarm or Kubernetes
3. **Database Replication**: Set up MongoDB replica set
4. **Session Management**: Use Redis for shared sessions

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize MongoDB with proper indexing
- Use connection pooling

## Troubleshooting

### Backend Issues
```bash
# Check logs
docker-compose logs backend
pm2 logs opensign-backend

# Check connectivity
curl http://localhost:5000/health

# Verify environment variables
docker exec opensign-backend env
```

### Frontend Issues
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test frontend build
cd frontend && npm run build
```

### Database Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Connect to MongoDB
mongosh

# Check database
use opensign
db.users.count()
```

## Rollback Plan

If deployment fails:

1. Stop the new version:
```bash
docker-compose down
```

2. Restore previous version:
```bash
git checkout previous-tag
docker-compose up -d
```

3. Restore database backup if needed:
```bash
mongorestore --uri="mongodb://localhost:27017/opensign" /path/to/backup
```

## Support

For deployment issues, consult:
- GitHub Issues
- Documentation at docs/
- Community forums
