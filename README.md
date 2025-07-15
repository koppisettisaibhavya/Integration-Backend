# Product Search Backend API

This is a Node.js backend service that provides a REST API for searching products using the Amazon Business API. The service is designed to work with a frontend application running on port 4200.

## Features

- Product search using keywords
- Product details retrieval by ASIN
- Product offers retrieval
- CORS enabled for frontend integration
- Comprehensive error handling and logging
- Token validation
- Request ID tracking for debugging

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Valid Amazon Business API credentials

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy the `.env` file and update the following variables:
   ```
   X_AMZ_ACCESS_TOKEN=your_actual_access_token
   X_AMZ_USER_EMAIL=your_actual_user_email
   ```

## Configuration

### Environment Variables

- `X_AMZ_ACCESS_TOKEN`: Your Amazon Business API access token
- `X_AMZ_USER_EMAIL`: Your Amazon Business user email
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `AMAZON_BUSINESS_API_BASE_URL`: Amazon Business API base URL
- `API_VERSION`: API version (default: 2020-08-26)

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status and timestamp

### Product Search
- **GET** `/api/products/search`
- **Query Parameters:**
  - `keywords` (required): Search keywords
  - `productRegion` (optional): Product region (default: US)
  - `locale` (optional): Locale (default: en_US)
  - `pageNumber` (optional): Page number (default: 0)
  - `pageSize` (optional): Page size (default: 24)

**Example Request:**
```
GET /api/products/search?keywords=laptop&productRegion=US&pageNumber=0&pageSize=10
```

**Example Response:**
```json
{
  "totalResults": 1500,
  "numberOfPages": 150,
  "currentPage": 0,
  "pageSize": 10,
  "products": [
    {
      "asin": "B08N5WRWNW",
      "title": "Echo Dot (4th Gen) | Smart speaker with Alexa",
      "image": "https://example.com/image.jpg",
      "price": {
        "amount": 49.99,
        "currency": "USD",
        "formatted": "USD 49.99"
      },
      "url": "https://www.amazon.com/dp/B08N5WRWNW",
      "hasAddToCart": true
    }
  ]
}
```

### Product Details
- **GET** `/api/products/:asin`
- **Path Parameters:**
  - `asin` (required): Product ASIN
- **Query Parameters:**
  - `productRegion` (optional): Product region (default: US)
  - `locale` (optional): Locale (default: en_US)

## Headers

All API requests require the following headers:
- `x-amz-access-token`: Your Amazon Business API access token
- `x-amz-user-email`: Your Amazon Business user email

Alternatively, these can be set in environment variables.

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the configured port (default: 3000) and will be accessible at:
- Health check: `http://localhost:3000/health`
- Product search: `http://localhost:3000/api/products/search`

## CORS Configuration

The server is configured to allow requests from:
- `http://localhost:4200`
- `http://127.0.0.1:4200`

This enables seamless integration with Angular applications running on the default development port.

## Error Handling

The API provides comprehensive error handling with detailed error messages and status codes:

- **400**: Bad Request (missing parameters, invalid input)
- **401**: Unauthorized (invalid or missing credentials)
- **403**: Forbidden (access denied)
- **404**: Not Found (resource not found)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

Error responses include:
- Error message
- Status code
- Request ID (for debugging)

## Logging

The application includes comprehensive logging for:
- Request/response details
- API calls to Amazon Business API
- Error tracking with Request IDs
- Performance monitoring

## Project Structure

```
/Users/saibhavy/new-be/
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables
├── server.js            # Main server file
├── routes/
│   └── productSearch.js # Product search routes
├── services/
│   └── ProductSearchService.js # Amazon Business API service
└── README.md           # This file
```

## Development Notes

- The server automatically restarts when files change (using nodemon in dev mode)
- All API calls are logged with request IDs for easy debugging
- Rate limiting information is logged when available
- Token validation is performed before each API call

## Troubleshooting

1. **Invalid Token Error**: Ensure your `X_AMZ_ACCESS_TOKEN` and `X_AMZ_USER_EMAIL` are correct
2. **CORS Issues**: Verify your frontend is running on port 4200
3. **Rate Limiting**: Check the `x-amzn-ratelimit-limit` header in responses
4. **Network Issues**: Check your internet connection and firewall settings

## Support

For issues related to the Amazon Business API, refer to the official documentation or contact Amazon Business support.
