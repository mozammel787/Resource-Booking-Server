# Resource Booking System - Backend

REST API for managing resource bookings with conflict detection and buffer time logic.

## 🚀 Live API
- **Base URL**: https://resource-booking-server.vercel.app/
- **Frontend**: https://resource-booking.vercel.app/

## Features
- Create/view/delete bookings
- Automatic conflict detection
- 10-minute buffer before/after each booking
- Filter by resource and date
- JSON file storage

## Tech Stack
- Node.js + Express + TypeScript
- CORS enabled
- JSON file storage

## Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/mozammel787/Resource-Booking-server.git
   cd Resource-Booking-server
   npm install
   ```

2. **Environment Setup**
   Create `.env`:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

3. **Run**
   ```bash
   npm run dev
   ```
   API runs on http://localhost:5000

## API Endpoints

### Get Bookings
```http
GET /bookings
GET /bookings?resource=Room A&date=2024-01-15
```

### Create Booking
```http
POST /bookings
Content-Type: application/json

{
  "resource": "Conference Room A",
  "startTime": "2024-01-15T14:00:00.000Z",
  "endTime": "2024-01-15T15:00:00.000Z",
  "requestedBy": "John Doe"
}
```

### Delete Booking
```http
DELETE /bookings/:id
```

## Buffer Logic
If a room is booked 2:00-3:00 PM:
- **Blocked time**: 1:50-3:10 PM (includes 10-min buffer)
- **Available**: Before 1:50 PM or after 3:10 PM

## Scripts
```bash
npm run dev    # Development with auto-reload
npm run build  # Build TypeScript
npm start      # Production
```

## Deployment
Deploy to Vercel and set environment variables in dashboard.

---
Built with Express + TypeScript
