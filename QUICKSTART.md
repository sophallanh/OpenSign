# Quick Start Guide - Deploy in 5 Minutes

This guide gets OpenSign running quickly on your server.

## Prerequisites

- Docker and Docker Compose installed
- SendGrid API key
- DigitalOcean Spaces (or AWS S3) credentials

## Step 1: Clone Repository

```bash
git clone https://github.com/sophallanh/OpenSign.git
cd OpenSign
```

## Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Generate a secure JWT secret
openssl rand -base64 32
```

Edit `.env` with your credentials:

```bash
# Required: JWT Configuration
JWT_SECRET=<paste-the-generated-secret-here>

# Required: SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Required: DigitalOcean Spaces Configuration
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your_spaces_access_key
DO_SPACES_SECRET=your_spaces_secret_key
DO_SPACES_BUCKET=your-bucket-name
```

## Step 3: Deploy with Single Command

### Option A: Use Deployment Script (Recommended)
```bash
./deploy.sh
```

### Option B: Direct Docker Compose
```bash
docker-compose up -d --build
```

## Step 4: Verify Deployment

Check if all services are running:
```bash
docker ps
```

You should see 3 containers:
- opensign-frontend
- opensign-backend
- opensign-mongodb

## Step 5: Access the Application

- **Frontend**: http://your-server-ip (or http://localhost if local)
- **Backend API**: http://your-server-ip:5000
- **Health Check**: http://your-server-ip:5000/health

## First Steps

1. Open the frontend URL in your browser
2. Click "Register" to create your first account
3. Choose role: "user", "referrer", or "admin"
4. Start using the platform!

## Useful Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker logs opensign-backend -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update and redeploy
git pull
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### Backend won't start
```bash
# Check backend logs
docker logs opensign-backend

# Common issues:
# - MongoDB not ready: Wait 30 seconds and check again
# - Environment variables: Verify .env file is correct
```

### Frontend won't load
```bash
# Check frontend logs
docker logs opensign-frontend

# Check if backend is running
curl http://localhost:5000/health
```

### Email notifications not working
- Verify SendGrid API key is correct
- Check sender email is verified in SendGrid
- View SendGrid activity: https://app.sendgrid.com/email_activity

### File uploads failing
- Verify DigitalOcean Spaces credentials
- Check bucket exists and is accessible
- Ensure endpoint URL is correct (e.g., nyc3.digitaloceanspaces.com)

## Production Setup

For production deployment with SSL/HTTPS:

1. Point your domain to your server IP
2. See [DEPLOYMENT.md](DEPLOYMENT.md) for SSL setup with Nginx
3. Update CORS_ORIGIN in docker-compose.yml to your domain

## Need Help?

- API Documentation: [API.md](API.md)
- Full Deployment Guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Testing Guide: [TESTING.md](TESTING.md)
- Implementation Details: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

## Security Notes

⚠️ **Before going to production:**

1. Change the default JWT_SECRET to a strong random string
2. Never commit `.env` file (already in .gitignore)
3. Use strong passwords for admin accounts
4. Set up firewall rules (allow only 80, 443, 22)
5. Enable MongoDB authentication in production
6. Use HTTPS/SSL for production deployment

## What's Next?

After deployment, you can:
- Upload documents and request signatures
- Create and manage business loan leads
- Track referral commissions
- Manage users and permissions

See [README.md](README.md) for complete feature documentation.
