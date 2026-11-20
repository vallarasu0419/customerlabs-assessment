# Assessment Guide

This guide provides a high-level overview of the Action Recorder Widget assessment.

---

## 1. Before You Start

### Read First, Code Later

Spend 15-20 minutes reading the codebase before writing any code. Understanding the architecture will save you time and prevent mistakes.

### Setup Checklist

- [ ] Run `npm install` in the root directory
- [ ] Run `npm install` in the `backend-server` directory
- [ ] Start the backend server: `cd backend-server && npm start`
- [ ] In a new terminal, run `npm run build:dev` to build the widget
- [ ] Open `http://localhost:3000?cl_widget=define` in your browser
- [ ] Verify the widget appears

### Identify All TODOs

Search for `TODO` comments across the codebase. Each TODO includes:

- **Task number** for reference
- **Point value** to help prioritize

```bash
# Find all TODOs
grep -r "TODO" src/
```

### Key Files to Review

| File | Purpose | Priority |
|------|---------|----------|
| `src/loader.js` | Widget initialization, localStorage | High |
| `src/components/Widget/Widget.jsx` | Main widget component | High |
| `src/hooks/useEventData.js` | Data fetching and CRUD | High |
| `src/utils/api.js` | API communication | High |
| `src/components/EventForm/EventForm.jsx` | Form handling | Medium |
| `webpack.config.js` | Build configuration | Medium |
| CSS files | Styling tasks | Low |

---

## 2. Recommended Approach

- Review the requirements and UI screenshots.
- Implement features incrementally.
- Build and test frequently.

---

## 3. Task Areas

### React.js Tasks

These tasks assess state management, component composition, and UI behavior.

### JavaScript Tasks

These tasks assess DOM/browser APIs, async operations, and build configuration.

### CSS/HTML Tasks

These tasks assess styling, animations, and semantic markup.

---

## 4. Scoring & Code Quality

Evaluators look for:

- Correct behavior and edge case handling
- Clean, readable structure
- Appropriate error handling and user feedback
- Good component boundaries and predictable state

---

## 5. Tips for Success

- Build incrementally and keep changes small.
- Test the widget behaviors end-to-end.
- Handle loading/empty/error states.
- Keep code readable and consistent.

