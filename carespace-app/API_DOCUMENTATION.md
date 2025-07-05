# Doctors Booking Chatbot API Documentation

This API provides comprehensive endpoints for a doctors booking chatbot system, reading data from CSV files in the `data/` folder.

## Base URL
```
http://localhost:3000/api
```

## Health Check
### GET /health
Returns server health status and data statistics.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-05T18:34:02.780Z",
  "uptime": 0.388427542,
  "environment": "development",
  "dataStats": {
    "doctors": 10,
    "spaces": 120,
    "bookings": 42
  }
}
```

## Doctors API

### GET /doctors
Get all doctors from the system.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "Id": "1",
      "Specialty": "Pediatric Anesthesiologist",
      "Name": "Dr. Tiger TestField",
      "Email": "t.testfield@example-hospital.test",
      "Dedicated Space in Office": "yes",
      "Office Id": "1100",
      "Home Office": "no"
    }
  ]
}
```

### GET /doctors/:id
Get a specific doctor by ID.

**Parameters:**
- `id` (string): Doctor ID

**Response:**
```json
{
  "success": true,
  "data": {
    "Id": "1",
    "Specialty": "Pediatric Anesthesiologist",
    "Name": "Dr. Tiger TestField",
    "Email": "t.testfield@example-hospital.test",
    "Dedicated Space in Office": "yes",
    "Office Id": "1100",
    "Home Office": "no"
  }
}
```

### GET /doctors/specialty/:specialty
Get doctors by specialty.

**Parameters:**
- `specialty` (string): Specialty name (e.g., "pediatric", "cardiology")

**Response:**
```json
{
  "success": true,
  "count": 4,
  "specialty": "pediatric",
  "data": [...]
}
```

### GET /doctors/available
Get doctors who have dedicated office space.

**Response:**
```json
{
  "success": true,
  "count": 7,
  "data": [...]
}
```

## Spaces API

### GET /spaces
Get all spaces in the system.

**Response:**
```json
{
  "success": true,
  "count": 120,
  "data": [
    {
      "Space ID": "1008",
      "Name": "Emergency Triage",
      "Category": "Clinical",
      "Area (sqm)": "25",
      "Capacity (people)": "3",
      "Specialized Equipment": "ECG, monitors",
      "Conference Equip.": "None",
      "Bookable": "No"
    }
  ]
}
```

### GET /spaces/:id
Get a specific space by ID.

**Parameters:**
- `id` (string): Space ID

**Response:**
```json
{
  "success": true,
  "data": {...}
}
```

### GET /spaces/bookable
Get all bookable spaces.

**Response:**
```json
{
  "success": true,
  "count": 39,
  "data": [...]
}
```

### GET /spaces/category/:category
Get spaces by category.

**Parameters:**
- `category` (string): Category name (e.g., "clinical", "education", "admin")

**Response:**
```json
{
  "success": true,
  "count": 25,
  "category": "clinical",
  "data": [...]
}
```

## Bookings API

### GET /bookings
Get all space bookings.

**Response:**
```json
{
  "success": true,
  "count": 42,
  "data": [
    {
      "Space ID": "1114",
      "Name": "Doctor Office #1025",
      "Duration (hours)": "2",
      "Date": "2025-07-10",
      "Start Timestamp": "2025-07-10 8:00:00",
      "End Timestamp": "2025-07-10 10:00:00"
    }
  ]
}
```

### GET /bookings/space/:spaceId
Get bookings for a specific space.

**Parameters:**
- `spaceId` (string): Space ID

**Response:**
```json
{
  "success": true,
  "count": 2,
  "spaceId": "1105",
  "data": [...]
}
```

### GET /bookings/date/:date
Get bookings for a specific date.

**Parameters:**
- `date` (string): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "count": 5,
  "date": "2025-07-10",
  "data": [...]
}
```

## Chatbot API

### GET /chatbot/search-doctors
Search doctors by query and/or specialty.

**Query Parameters:**
- `query` (optional): Search term for name, specialty, or email
- `specialty` (optional): Filter by specialty

**Example:**
```
GET /chatbot/search-doctors?query=pediatric&specialty=cardiology
```

**Response:**
```json
{
  "success": true,
  "count": 4,
  "query": "pediatric",
  "specialty": null,
  "data": [...]
}
```

### GET /chatbot/available-spaces
Find available spaces for booking.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format
- `time` (optional): Time in HH:MM format
- `duration` (optional): Duration in hours (default: 1)
- `category` (optional): Space category filter

**Example:**
```
GET /chatbot/available-spaces?date=2025-07-10&time=09:00&duration=2&category=education
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "date": "2025-07-10",
  "time": "09:00",
  "duration": "2",
  "category": "education",
  "data": [...]
}
```

### GET /chatbot/suggestions
Get booking suggestions based on criteria.

**Query Parameters:**
- `specialty` (optional): Doctor specialty
- `date` (optional): Date in YYYY-MM-DD format
- `time` (optional): Time in HH:MM format

**Example:**
```
GET /chatbot/suggestions?specialty=pediatric&date=2025-07-10&time=09:00
```

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [...],
    "spaces": [...],
    "message": "Found 3 doctors and 37 available spaces for your request."
  }
}
```

## Statistics API

### GET /stats
Get overall system statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": {
      "total": 10,
      "withDedicatedSpace": 7,
      "specialties": 10
    },
    "spaces": {
      "total": 120,
      "bookable": 39,
      "categories": 8
    },
    "bookings": {
      "total": 42,
      "upcoming": 42
    },
    "timestamp": "2025-07-05T18:35:32.098Z"
  }
}
```

### GET /stats/specialties
Get statistics by doctor specialty.

**Response:**
```json
{
  "success": true,
  "data": {
    "Pediatric Anesthesiologist": {
      "count": 1,
      "withDedicatedSpace": 1
    },
    "Emergency Medicine Physician": {
      "count": 1,
      "withDedicatedSpace": 0
    }
  }
}
```

## Legacy Endpoints (for backward compatibility)

### GET /users
Returns doctors data (legacy endpoint).

### GET /tasks
Returns spaces data (legacy endpoint).

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

## Data Sources

The API reads data from the following CSV files in the `data/` folder:

- `Doctors.csv` - Doctor information
- `Spaces.csv` - Space/room information
- `SpaceBookings.csv` - Booking information

## Usage Examples

### Finding a Pediatric Doctor
```bash
curl "http://localhost:3000/api/chatbot/search-doctors?query=pediatric"
```

### Finding Available Spaces
```bash
curl "http://localhost:3000/api/spaces/bookable"
```

### Getting Booking Suggestions
```bash
curl "http://localhost:3000/api/chatbot/suggestions?specialty=cardiology&date=2025-07-10&time=14:00"
```

### Checking System Health
```bash
curl "http://localhost:3000/api/health"
```

## Server Information

- **Port**: 3000 (configurable via PORT environment variable)
- **Environment**: development/production (configurable via NODE_ENV)
- **Data Loading**: Automatic on server startup
- **CORS**: Enabled for cross-origin requests
- **Logging**: Morgan HTTP request logging enabled 