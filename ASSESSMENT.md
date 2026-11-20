# Frontend Engineer Assessment

## Action Recorder Widget

**Duration:** 4 hours maximum  
**Level:** Frontend Engineer (2+ years experience)

---

## Overview

You are tasked with completing an **Action Recorder Widget** - an embeddable React component that allows users to configure and track user interactions on any webpage.

The widget should:
- Be draggable and repositionable on the page
- Support minimize/maximize functionality
- Display a list of configured events with search and pagination
- Allow creating, editing, and deleting events
- Support element picking from the host page
- Load/unload based on URL query parameters

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend Server

```bash
cd backend-server
npm install
npm start
```

The server runs on `http://localhost:3000` and serves:
- API endpoints at `/api/events`
- Test page at `http://localhost:3000`

### 3. Build the Widget

```bash
npm run build:dev
```

### 4. Test the Widget

Open `http://localhost:3000?cl_widget=define` to load the widget.

---

## Provided Utilities (DO NOT MODIFY)

The following files are complete and ready to use:

### `src/utils/elementPicker.js`
Element selection utility with CSS selector generation.

**Usage:**
```javascript
import { startElementPicker, highlightElement } from '../../utils/elementPicker';

// Start picking an element
const result = await startElementPicker({
  onMinimize: () => { /* minimize widget */ },
  onRestore: () => { /* restore widget */ }
});
// result = { selector: 'button.cta', textContent: 'Click me', elementType: 'button' }

// Highlight an element temporarily
highlightElement('.my-selector', 2000);
```

### `src/hooks/useDraggable.js`
Hook for drag functionality.

**Usage:**
```javascript
import useDraggable from '../../hooks/useDraggable';

const { position, isDragging, handleMouseDown } = useDraggable(isMoveMode, initialPosition);
// position = { x: number, y: number }
// isDragging = boolean
// handleMouseDown = event handler for starting drag
```

---

## Tasks

Complete the TODO sections in the following files. Each task has a point value and category.

### React Tasks (50 points)

| Task | File | Points | Description |
|------|------|--------|-------------|
| 1 | `Widget.jsx` | 8 | Initialize component state variables |
| 2 | `Widget.jsx` | 5 | Initialize and use custom hooks |
| 3 | `Widget.jsx` | 10 | Implement all event handlers |
| 4 | `Widget.jsx` | 10 | Implement search filtering with useMemo |
| 5 | `Widget.jsx` | 7 | Implement pagination logic |
| 6 | `Widget.jsx` | 10 | Render the complete widget UI |
| 7 | `EventForm.jsx` | 12 | Implement form with element picker |
| 8 | `EventForm.jsx` | 5 | Implement form validation |
| 9 | `EventTable.jsx` | 5 | Implement table with states |
| 10 | `Header.jsx` | 3 | Implement header controls |
| 11 | `Button.jsx` | 2 | Implement reusable button |
| 12 | `SearchBox.jsx` | 2 | Implement search input |
| 13 | `Pagination.jsx` | 2 | Implement pagination controls |
| 14 | `useMinimize.js` | 4 | Implement minimize/maximize hook |
| 15 | `useEventData.js` | 8 | Implement data fetching hook |

### JavaScript Tasks (50 points)

| Task | File | Points | Description |
|------|------|--------|-------------|
| 16 | `api.js` | 12 | Implement API functions with data transformation |
| 17 | `api.js` | 3 | Implement error handling |
| 18 | `loader.js` | 12 | Implement widget lifecycle with query params |
| 19 | `loader.js` | 8 | Implement localStorage state persistence |
| 24 | `webpack.config.js` | 4 | Configure widget output with UMD library format |
| 25 | `webpack.config.js` | 5 | Configure module rules for Babel and CSS Modules |
| 26 | `webpack.config.js` | 2 | Configure build plugins |
| 27 | `webpack.config.js` | 2 | Configure resolve extensions and optimization |
| 28 | `webpack.config.js` | 2 | Configure loader bundle output and devtools |

### CSS Tasks (10 points)

| Task | File | Points | Description |
|------|------|--------|-------------|
| 20 | `Button.module.css` | 5 | Implement button variant styles and states |
| 21 | `Widget.module.css` | 5 | Implement minimized icon animation |

### HTML Tasks (2.5 points)

| Task | File | Points | Description |
|------|------|--------|-------------|
| 22 | `EventTable.jsx` | 2.5 | Implement empty state markup with icon |

### API Tasks (2.5 points)

| Task | File | Points | Description |
|------|------|--------|-------------|
| 23 | `api.js` | 2.5 | Implement fetch wrapper with proper headers |

---

## Scoring Breakdown

| Category | Weight | Points |
|----------|--------|--------|
| React.js | 43.5% | 50 |
| JavaScript | 43.5% | 50 |
| CSS | 8.7% | 10 |
| HTML | 2.2% | 2.5 |
| API | 2.2% | 2.5 |
| **Total** | **100%** | **115** |

---

## Requirements

### Functional Requirements

1. **Widget Loading** (`loader.js`)
   - Load widget when URL has `?cl_widget=define`
   - Hide widget when URL has `?cl_widget=track`
   - Persist state in localStorage across page navigations

2. **Widget UI** (`Widget.jsx`)
   - Draggable positioning (use provided `useDraggable` hook)
   - Minimize to floating icon
   - List view with search and pagination (3 items per page)
   - Form view for creating/editing events

3. **Event Management**
   - Create new events with name, type, and element selector
   - Edit existing events
   - Delete events with confirmation
   - Search events by name and action type

4. **Element Picker** (use provided `elementPicker.js`)
   - Minimize widget when picker starts
   - Restore widget when picker completes
   - Store selected element's selector and text

### Technical Requirements

- Use ES5 syntax (var, function expressions) for browser compatibility
- Use React hooks (useState, useEffect, useMemo, useCallback)
- Handle loading and error states
- Implement proper form validation

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create new event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

### Event Object (Backend Format)

```json
{
  "id": 1,
  "name": "CTA Button Click",
  "selector": "button.cta-btn",
  "event_type": "button_click",
  "elements": [],
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Event Object (Frontend Format)

```json
{
  "id": "1",
  "eventName": "CTA Button Click",
  "selector": "button.cta-btn",
  "actionType": "button_click",
  "elements": [],
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## Screenshots Reference

See the `screenshots/` folder for UI reference:
- `screen-1.png` - Widget list view
- `screen-2.png` - Widget form view
- `screen-3.png` - Element picker active
- `screen-4.png` - Minimized state
- `screen-5.png` - Search functionality
- `screen-6.png` - Pagination

---

## Submission

1. Ensure all TODO sections are completed
2. Test that the widget builds without errors: `npm run build:dev`
3. Test functionality with the backend server
4. Commit your changes

---

## Tips

- Read through all provided files before starting
- Check the screenshots for expected UI behavior
- Use the browser console to debug issues
- The backend server logs all API requests
- Focus on completing high-point tasks first

Good luck!

