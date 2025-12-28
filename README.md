# OpenSign

A business loan referral and e-signature platform inspired by DocuSign. Supports two-way digital agreements, commission tracking, lead management, and integrates with DigitalOcean Spaces and SendGrid. Built with Node.js, React, MongoDB, and Docker.

> **🚀 Quick Start**: Want to deploy immediately? See [QUICKSTART.md](QUICKSTART.md) for a 5-minute deployment guide.

## Features

- **E-Signature Platform**: Upload documents and request signatures from multiple parties
- **Two-Way Digital Agreements**: Support for multiple signers with bidirectional signing workflows
- **Commission Tracking**: Track and manage referral commissions with automated calculations
- **Lead Management**: Comprehensive CRM for managing business loan leads
- **DigitalOcean Spaces Integration**: Secure document storage in the cloud
- **SendGrid Integration**: Automated email notifications for signatures and commissions
- **User Roles**: Support for users, referrers, and administrators
- **Real-time Dashboard**: Track documents, leads, and earnings in one place

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **SendGrid** for email notifications
- **AWS SDK** for DigitalOcean Spaces integration
- **bcryptjs** for password hashing
- **Helmet** and **express-rate-limit** for security

### Frontend
- **React 18** with React Router
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Axios** for API requests
- **React Toastify** for notifications

### Infrastructure
- **Docker** and **Docker Compose** for containerization
- **MongoDB** database
- **Nginx** for serving the frontend

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized setup)
- MongoDB (if running without Docker)
- SendGrid API key
- DigitalOcean Spaces account (or AWS S3 compatible storage)

### Environment Variables

1. Copy the environment example files:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

2. Edit `.env` and `backend/.env` with your actual configuration:
   - `JWT_SECRET`: A secure random string for JWT signing
   - `SENDGRID_API_KEY`: Your SendGrid API key
   - `SENDGRID_FROM_EMAIL`: Verified sender email in SendGrid
   - `DO_SPACES_ENDPOINT`: DigitalOcean Spaces endpoint (e.g., nyc3.digitaloceanspaces.com)
   - `DO_SPACES_KEY`: DigitalOcean Spaces access key
   - `DO_SPACES_SECRET`: DigitalOcean Spaces secret key
   - `DO_SPACES_BUCKET`: Your Spaces bucket name

### Running with Docker (Recommended)

1. Start all services:
```bash
docker-compose up -d
```

2. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

3. Stop services:
```bash
docker-compose down
```

### Running Locally (Development)

#### Backend

```bash
cd backend
npm install
npm run dev
```

The backend API will run on http://localhost:5000

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:3000

#### MongoDB

Make sure MongoDB is running locally on port 27017, or update the `MONGODB_URI` in `backend/.env`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Documents Endpoints

- `POST /api/documents` - Upload a new document
- `GET /api/documents` - Get all user's documents
- `GET /api/documents/:id` - Get single document
- `POST /api/documents/:id/sign` - Sign a document
- `POST /api/documents/:id/send` - Send signature requests
- `DELETE /api/documents/:id` - Delete a document

### Leads Endpoints

- `POST /api/leads` - Create a new lead
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update a lead
- `POST /api/leads/:id/notes` - Add a note to a lead
- `DELETE /api/leads/:id` - Delete a lead (admin only)

### Commissions Endpoints

- `POST /api/commissions` - Create a commission (admin only)
- `GET /api/commissions` - Get all commissions
- `GET /api/commissions/:id` - Get single commission
- `PUT /api/commissions/:id` - Update commission status (admin only)
- `DELETE /api/commissions/:id` - Delete a commission (admin only)

### Users Endpoints

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/referrers/list` - Get all referrers

## User Roles

- **User**: Can create documents, manage their own leads, and view their commissions
- **Referrer**: Can refer leads and track commissions earned
- **Admin**: Full access to all features including user management and commission approval

## Project Structure

```
opensign/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # Express routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── server.js        # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React context
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   └── package.json
├── docker-compose.yml   # Docker Compose configuration
├── .env.example         # Environment variables template
└── README.md
```

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator
- Secure file uploads with type validation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
