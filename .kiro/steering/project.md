# Life Dashboard — Project Steering

## Project Overview
A personal productivity dashboard built with vanilla HTML, CSS, and JavaScript.

## Features
- **Clock & Greeting**: Live clock, date display, and time-based greeting with custom name
- **Focus Timer**: Pomodoro-style timer with custom duration, progress bar, and page title update
- **To-Do List**: Add, edit, complete, delete tasks with LocalStorage persistence
- **Quick Links**: Bookmark favourite sites with favicon support and LocalStorage persistence

## Challenges Implemented
1. Light / Dark Mode toggle (Challenge 1)
2. Custom Name in Greeting (Challenge 2)
3. Prevent Duplicate Tasks (Challenge 3)
4. Sort / Filter Tasks (Bonus)
5. Change Pomodoro Time (Bonus)

## Tech Stack
- HTML5, CSS3 (CSS Variables, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- LocalStorage for persistence
- No external libraries or frameworks

## File Structure
```
index.html        — Main HTML structure
css/style.css     — All styles including dark mode variables
js/main.js        — All JavaScript logic
```

## Coding Conventions
- Use CSS custom properties (variables) for theming
- Keep all JS in a single DOMContentLoaded listener
- Use LocalStorage keys prefixed with `dashboard_`
- Accessibility: all interactive elements have aria-labels
