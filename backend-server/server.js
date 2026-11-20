/**
 * Express API Server for Action Recorder Widget
 * Handles storage and retrieval of event settings using SQLite3
 * Compatible with Node.js 20 & Node.js 22
 * Port: 3000
 */

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/build', express.static(path.join(__dirname, '../build')));

// Initialize SQLite database
const db = new sqlite3.Database(
  path.join(__dirname, 'events.db'),
  (err) => {
    if (err) {
      console.error('Database connection error:', err.message);
    } else {
      console.log('✓ Connected to SQLite database');
      initializeDatabase();
    }
  }
);

/**
 * Initialize database schema
 */
function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      selector TEXT NOT NULL,
      event_type TEXT NOT NULL,
      elements TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Database initialization error:', err.message);
    } else {
      console.log('✓ Database initialized successfully');
    }
  });
}

/**
 * GET /api/events
 */
app.get('/api/events', (req, res) => {
  const query = `SELECT * FROM events ORDER BY created_at DESC`;

  db.all(query, [], (err, events) => {
    if (err) {
      console.error('Error fetching events:', err.message);

      return res.status(500).json({
        success: false,
        error: 'Failed to fetch events',
      });
    }

    const parsedEvents = events.map((event) => {
      if (event.elements) {
        try {
          event.elements = JSON.parse(event.elements);
        } catch {
          event.elements = null;
        }
      }

      return event;
    });

    res.json({
      success: true,
      data: parsedEvents,
      count: parsedEvents.length,
    });
  });
});

/**
 * GET /api/events/:id
 */
app.get('/api/events/:id', (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM events WHERE id = ?`;

  db.get(query, [id], (err, event) => {
    if (err) {
      console.error('Error fetching event:', err.message);

      return res.status(500).json({
        success: false,
        error: 'Failed to fetch event',
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    if (event.elements) {
      try {
        event.elements = JSON.parse(event.elements);
      } catch {
        event.elements = null;
      }
    }

    res.json({
      success: true,
      data: event,
    });
  });
});

/**
 * POST /api/events
 */
app.post('/api/events', (req, res) => {
  const { name, selector, event_type, elements } = req.body;

  if (!name || !selector || !event_type) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
    });
  }

  const elementsJson = elements ? JSON.stringify(elements) : null;

  const query = `
    INSERT INTO events (name, selector, event_type, elements)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    query,
    [name, selector, event_type, elementsJson],
    function (err) {
      if (err) {
        console.error('Error creating event:', err.message);

        return res.status(500).json({
          success: false,
          error: 'Failed to create event',
        });
      }

      db.get(
        `SELECT * FROM events WHERE id = ?`,
        [this.lastID],
        (err, newEvent) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch created event',
            });
          }

          if (newEvent.elements) {
            try {
              newEvent.elements = JSON.parse(newEvent.elements);
            } catch {
              newEvent.elements = null;
            }
          }

          res.status(201).json({
            success: true,
            data: newEvent,
            message: 'Event created successfully',
          });
        }
      );
    }
  );
});

/**
 * PUT /api/events/:id
 */
app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { name, selector, event_type, elements } = req.body;

  if (!name || !selector || !event_type) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
    });
  }

  const elementsJson = elements ? JSON.stringify(elements) : null;

  const checkQuery = `SELECT * FROM events WHERE id = ?`;

  db.get(checkQuery, [id], (err, existingEvent) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to check event',
      });
    }

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    const updateQuery = `
      UPDATE events
      SET
        name = ?,
        selector = ?,
        event_type = ?,
        elements = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(
      updateQuery,
      [name, selector, event_type, elementsJson, id],
      (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to update event',
          });
        }

        db.get(
          `SELECT * FROM events WHERE id = ?`,
          [id],
          (err, updatedEvent) => {
            if (err) {
              return res.status(500).json({
                success: false,
                error: 'Failed to fetch updated event',
              });
            }

            if (updatedEvent.elements) {
              try {
                updatedEvent.elements = JSON.parse(updatedEvent.elements);
              } catch {
                updatedEvent.elements = null;
              }
            }

            res.json({
              success: true,
              data: updatedEvent,
              message: 'Event updated successfully',
            });
          }
        );
      }
    );
  });
});

/**
 * DELETE /api/events/:id
 */
app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM events WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting event:', err.message);

      return res.status(500).json({
        success: false,
        error: 'Failed to delete event',
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  });
});

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════');
  console.log('  Action Recorder Backend Server');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Server running on: http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════════');
});

/**
 * Graceful Shutdown
 */
process.on('SIGINT', () => {
  console.log('\nShutting down server...');

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }

    process.exit(0);
  });
});