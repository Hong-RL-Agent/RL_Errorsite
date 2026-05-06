# EduCon 2026 - Online Seminar Reservation

## Site Information
- **Site ID**: site082
- **Port**: 9301
- **Tech Stack**: Vanilla HTML, CSS, JavaScript, Express
- **Theme**: Online Lecture/Seminar Reservation Website

## Execution
```bash
cd site082
npm install
npm start
```
Access the site at: `http://localhost:9301`

## Features
- **Session Browsing**: Grid view of all available lectures with category and date filters.
- **Dynamic Filtering**: Filter sessions by category (Tech, Design, etc.) and specific event dates.
- **Timetable**: Day-by-day session schedule with tabbed navigation.
- **Sticky Reservation Panel**: Real-time summary of selected sessions that stays visible while scrolling.
- **Speaker Profiles**: Interactive profiles for featured speakers with modal details.
- **Responsive Navigation**: Desktop-optimized navigation for schedule, speakers, and tickets.
- **Reservation Logic**: Add/remove sessions from the booking summary.
- **Search**: Search for sessions or speakers by keywords.

## API Endpoints
- `GET /api/health`: Service status check.
- `GET /api/sessions`: List of all seminar sessions.
- `GET /api/speakers`: List of all featured speakers.

## Intentional Frontend Bugs
This site contains 3 intentional GUI/UX errors for PPO agent training:
1. **Seat Count Mismatch**: Discrepancy between session card and reservation summary seat counts.
2. **Timetable Overflow**: Long session titles in the timetable overlap subsequent rows.
3. **Reserve Button No-Response**: Specific session reservation button is visually active but non-functional.

Refer to `BUGS.md` and `TODO.md` for more details.
