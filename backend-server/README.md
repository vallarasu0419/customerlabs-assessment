# Action Recorder Backend API

Express.js server with SQLite database for storing and retrieving event settings from the widget.

## Features

- RESTful API for event management
- SQLite database for persistent storage
- CORS enabled for widget integration
- Comprehensive error handling
- Health check endpoint

## Installation

```bash
cd backend-server
npm install
```

## Running the Server

```bash
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/api/health` - Check server status

### Events Management

#### Get All Events
- **GET** `/api/events`
- Response: List of all events with metadata

#### Get Single Event
- **GET** `/api/events/:id`
- Response: Single event details

#### Create Event
- **POST** `/api/events`
- Body:
  ```json
  {
    "name": "Button Click",
    "selector": "#submit-btn",
    "event_type": "click"
  }
  ```
- Response: Created event with ID

#### Update Event
- **PUT** `/api/events/:id`
- Body:
  ```json
  {
    "name": "Updated Button Click",
    "selector": "#new-submit-btn",
    "event_type": "click"
  }
  ```
- Response: Updated event

#### Delete Event
- **DELETE** `/api/events/:id`
- Response: Success confirmation

## Database Schema

### Events Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| name | TEXT | Event name |
| selector | TEXT | CSS selector for the element |
| event_type | TEXT | Type of event (click, submit, etc.) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Example Usage

### Using cURL

```bash
# Get all events
curl http://localhost:3000/api/events

# Create a new event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"name":"Submit Form","selector":"#contact-form","event_type":"submit"}'

# Update an event
curl -X PUT http://localhost:3000/api/events/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Submit","selector":"#new-form","event_type":"submit"}'

# Delete an event
curl -X DELETE http://localhost:3000/api/events/1
```

### Using JavaScript (from widget)

```javascript
// Get all events
fetch('http://localhost:3000/api/events')
  .then(response => response.json())
  .then(data => console.log(data));

// Create event
fetch('http://localhost:3000/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Button Click',
    selector: '#my-button',
    event_type: 'click'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## Notes

- The database file (`events.db`) will be created automatically on first run
- CORS is enabled for all origins (modify in production)
- Server gracefully handles shutdown (Ctrl+C)

