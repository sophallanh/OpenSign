# OpenSign - Business Loan Referral E-Signature Platform

This repository integrates [OpenSign](https://github.com/OpenSignLabs/OpenSign) - a free, open-source DocuSign alternative for creating two-way digitally signable agreements.

## What This Fulfills

**Patrick's Requirements:**
- ✅ Two-way DocuSign-like signature functionality
- ✅ PDF upload with fillable fields (name, phone, email, date, signatures)
- ✅ Send signature request links to clients
- ✅ Touchscreen/cursor signature support  
- ✅ Business loan referral application forms
- ✅ Fully executed contracts when both parties sign
- ✅ Email notifications for signature requests
- ✅ Audit trails and timestamps

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Your domain pointed to your server (sign.bizloansadvisor.com)
- SendGrid account with API key
- DigitalOcean Spaces for document storage

### One-Command Deployment

```bash
# On your server (157.245.231.212)
cd /root
git clone https://github.com/sophallanh/OpenSign.git
cd OpenSign
docker-compose up -d
```

The application will be available at:
- **Frontend**: https://sign.bizloansadvisor.com
- **API**: https://sign.bizloansadvisor.com/api/app

## Configuration

All configuration is already set in the `.env` file:

- **Domain**: sign.bizloansadvisor.com
- **Email**: sophal@bizloansadvisor.com (via SendGrid)
- **Storage**: DigitalOcean Spaces (opensign-files, SFO3 region)
- **Database**: MongoDB (via Docker container)

## How to Use for Patrick's Business

### 1. Create Loan Referral Agreement

1. Log into https://sign.bizloansadvisor.com
2. Click "New Document"
3. Upload your PDF loan referral agreement
4. Add signature fields:
   - Your signature field
   - Patrick's (or client's) signature field
   - Date fields
   - Name fields
   - Email fields
   - Phone number fields

### 2. Send for Signature

1. Add Patrick's email address
2. Click "Send for Signature"
3. Patrick receives an email with a "Review & Sign" link
4. He clicks the link, reviews the document, and signs using:
   - Cursor (desktop)
   - Touchscreen (tablet/phone)
   - Type his name

### 3. Get Signed Copy

- Once Patrick signs, both parties automatically receive the fully executed PDF
- Document includes:
  - Both signatures
  - Timestamps
  - IP addresses
  - Complete audit trail
  - Legally binding certificate

## Document Types Supported

- Business loan referral agreements
- Commission agreements
- ISO (Independent Sales Organization) contracts
- Any PDF with fillable form fields

## Key Features

### E-Signature Features
- Multi-party signing (2+ signers)
- Sequential or parallel signing workflows
- Signature via cursor, touchscreen, or typing
- Mobile-friendly signing experience
- SMS and email notifications

### Document Management
- PDF upload and storage
- Drag-and-drop form field builder
- Document templates for reuse
- Bulk sending capabilities
- Document status tracking

### Security & Compliance
- Audit trail with timestamps and IP addresses
- Encrypted document storage (DigitalOcean Spaces)
- Email verification for signers
- Tamper-proof signed documents
- Certificate of completion

### Integration
- SendGrid for reliable email delivery
- DigitalOcean Spaces for secure storage
- Mobile-responsive design
- Works on any device

## Architecture

```
OpenSign Platform
├── Frontend (React)
│   └── Port 3001 (proxied via Caddy to port 80/443)
├── Backend (Node.js/Express + Parse Server)
│   └── Port 8080
├── MongoDB
│   └── Port 27017
└── Caddy (Reverse Proxy + SSL)
    └── Ports 80, 443
```

## Container Services

- **mongo-container**: MongoDB database
- **OpenSignServer-container**: Backend API server
- **OpenSign-container**: Frontend React application
- **caddy-container**: Reverse proxy and SSL termination

## Managing the Application

### View Logs
```bash
docker logs OpenSign-container -f          # Frontend logs
docker logs OpenSignServer-container -f    # Backend logs  
docker logs mongo-container -f             # Database logs
```

### Restart Services
```bash
docker-compose restart
```

### Stop Services
```bash
docker-compose down
```

### Update Application
```bash
git pull
docker-compose down
docker-compose pull
docker-compose up -d
```

## Troubleshooting

### Emails Not Sending
- Check SendGrid API key in `.env`
- Verify sender email (sophal@bizloansadvisor.com) is verified in SendGrid
- Check SendGrid activity: https://app.sendgrid.com/email_activity

### Documents Not Uploading
- Verify DigitalOcean Spaces credentials in `.env`
- Check bucket exists: opensign-files
- Verify endpoint: sfo3.digitaloceanspaces.com

### Cannot Access Website
- Verify domain DNS points to 157.245.231.212
- Check Caddy container is running: `docker ps | grep caddy`
- Check SSL certificate: `docker logs caddy-container`

### Database Connection Issues
- Check MongoDB container: `docker ps | grep mongo`
- Verify MongoDB URI in `.env`
- Restart containers: `docker-compose restart`

## Support & Documentation

- **OpenSign GitHub**: https://github.com/OpenSignLabs/OpenSign
- **Installation Guide**: See INSTALLATION.md
- **Usage Guide**: See USAGE.md
- **Contributing**: See CONTRIBUTING.md

## Security Notes

⚠️ **Important**:
- Never commit the `.env` file with real credentials (already in .gitignore)
- Change MASTER_KEY in production to a strong random string
- Enable MongoDB authentication for production
- Use strong passwords for admin accounts
- Keep OpenSign updated regularly

## License

OpenSign is released under the AGPL-3.0 License. See LICENSE file for details.

## Credits

This deployment is based on [OpenSign](https://github.com/OpenSignLabs/OpenSign) by OpenSignLabs - an open-source DocuSign alternative.

**Configured for:**
- Business: BizLoansAdvisor
- Domain: sign.bizloansadvisor.com
- Use Case: Business loan referral agreements with two-way digital signatures
