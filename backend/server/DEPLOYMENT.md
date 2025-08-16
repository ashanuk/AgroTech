# AgroTech Forum API Deployment Guide

This guide explains how to deploy the AgroTech Forum API to a cloud platform like Render.

## Files and Setup

We've prepared several files to make deployment easy:

1. `src/production.js` - Production-ready entry point with proper CORS handling
2. `src/config/database-prod.js` - Enhanced database connection for production
3. `src/middleware/auth-prod.js` - Improved authentication middleware
4. `.env.production-template` - Template for production environment variables
5. `render.yaml` - Configuration file for deploying to Render
6. `build.sh` - Build script for deployment

## Deployment to Render

### Manual Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure as follows:
   - **Name**: `agrotech-forum-api` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `npm run start:prod`

### Using render.yaml

1. Push the code to your repository
2. In Render, choose "Blueprint"
3. Connect to your repository
4. Render will detect the `render.yaml` file and set up the service

## Environment Variables

Set these in your Render dashboard:

| Variable                | Description                   | Example                                              |
| ----------------------- | ----------------------------- | ---------------------------------------------------- |
| `MONGODB_URI`           | MongoDB connection string     | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET`            | Secret for JWT authentication | `your-strong-secret-key`                             |
| `CORS_ORIGIN`           | Allowed origin for CORS       | `*` or `https://your-frontend.com`                   |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name         | `your-cloud-name`                                    |
| `CLOUDINARY_API_KEY`    | Cloudinary API key            | `your-api-key`                                       |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret         | `your-api-secret`                                    |

## Fixes Made for Deployment

We've addressed several issues to make the API production-ready:

1. **CORS Handling**: Updated to work with any frontend origin
2. **Environment Variables**: Removed hardcoded values
3. **Error Handling**: Added robust error handling throughout
4. **Database Connection**: Enhanced with production-specific settings
5. **File Uploads**: Configured to use Cloudinary in production
6. **JWT Authentication**: Improved security for production use

## Testing Your Deployment

After deploying, test the following endpoints:

1. Health Check: `GET /health`
2. GraphQL: `POST /graphql` with a simple query
3. File Upload: `POST /upload` with a test image

## Troubleshooting

If you encounter issues:

1. Check Render logs for errors
2. Verify all environment variables are set correctly
3. Test MongoDB connection
4. Ensure Cloudinary credentials are valid
