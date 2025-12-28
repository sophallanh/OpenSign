# Testing Guide for OpenSign

## Backend Testing

### Prerequisites for Backend
- MongoDB running on localhost:27017
- Valid environment variables in `backend/.env`

### Running Backend Tests

1. Start MongoDB (if not using Docker):
```bash
mongod
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Run the development server:
```bash
npm run dev
```

The backend should now be running on http://localhost:5000

### Testing Backend Endpoints

You can test the API endpoints using curl or Postman:

#### Health Check
```bash
curl http://localhost:5000/health
```

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Get Current User (requires token)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Frontend Testing

### Running Frontend Development Server

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend should now be running on http://localhost:3000

### Testing Frontend Features

1. **Registration Flow**:
   - Navigate to http://localhost:3000/register
   - Fill in the registration form
   - Submit and verify redirect to dashboard

2. **Login Flow**:
   - Navigate to http://localhost:3000/login
   - Enter credentials
   - Submit and verify authentication

3. **Dashboard**:
   - View statistics cards
   - Check recent documents and leads lists

4. **Documents Page**:
   - Navigate to /documents
   - View documents table
   - Test upload functionality (when backend is ready)

5. **Leads Page**:
   - Navigate to /leads
   - View leads table
   - Test create lead functionality

6. **Commissions Page**:
   - Navigate to /commissions
   - View commissions with totals
   - Check status badges

## Docker Testing

### Running with Docker Compose

1. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

2. Build and start all services:
```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

4. Stop services:
```bash
docker-compose down
```

### Testing Individual Docker Services

#### Test Backend Docker Image
```bash
cd backend
docker build -t opensign-backend .
docker run -p 5000:5000 --env-file .env opensign-backend
```

#### Test Frontend Docker Image
```bash
cd frontend
docker build -t opensign-frontend .
docker run -p 80:80 opensign-frontend
```

## Integration Testing Checklist

- [ ] User can register a new account
- [ ] User can login with credentials
- [ ] User can view dashboard with statistics
- [ ] User can upload a document (requires DigitalOcean Spaces setup)
- [ ] User can create a lead
- [ ] User can view lead details
- [ ] User can view commissions
- [ ] Email notifications work (requires SendGrid setup)
- [ ] User can logout
- [ ] Protected routes redirect to login when not authenticated

## Known Limitations

1. **SendGrid Integration**: Requires a valid SendGrid API key for email notifications
2. **DigitalOcean Spaces**: Requires valid credentials for file uploads
3. **Document Signing**: Full signing workflow with signature canvas not yet implemented
4. **Real-time Updates**: No WebSocket support for real-time notifications yet

## Security Testing

### Authentication Tests
- [ ] Invalid credentials are rejected
- [ ] JWT tokens expire correctly
- [ ] Protected routes require authentication
- [ ] Password is hashed in database
- [ ] Rate limiting prevents brute force attacks

### Authorization Tests
- [ ] Users can only access their own data
- [ ] Referrers have appropriate permissions
- [ ] Admin-only routes are protected
- [ ] File uploads are validated

## Performance Testing

### Backend Performance
- Test API response times under load
- Monitor MongoDB query performance
- Check file upload handling for large files

### Frontend Performance
- Test page load times
- Check bundle size (should be < 300KB gzipped)
- Verify lazy loading of components

## Troubleshooting

### Backend Issues
- **MongoDB connection error**: Ensure MongoDB is running
- **SendGrid error**: Check API key is valid
- **Spaces error**: Verify DigitalOcean credentials

### Frontend Issues
- **API connection error**: Ensure backend is running on port 5000
- **Build errors**: Clear node_modules and reinstall
- **Style issues**: Rebuild Tailwind CSS

### Docker Issues
- **Port conflicts**: Check if ports 80, 5000, 27017 are available
- **Build failures**: Check Docker logs with `docker-compose logs`
- **Network issues**: Verify docker network is created
