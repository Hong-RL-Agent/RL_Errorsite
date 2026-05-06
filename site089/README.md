# Little Explorers - Online Kids Class Reservation

## Site Information
- **Site ID**: site089
- **Port**: 9308
- **Tech Stack**: Vanilla HTML, CSS, JavaScript, Express
- **Theme**: Bright & Educational Kids Discovery Center

## Execution
```bash
cd site089
npm install
npm start
```
Access the site at: `http://localhost:9308`

## Features
- **Class Discovery**: Browse educational classes for children aged 4 to 9.
- **Dynamic Age Filtering**: Find appropriate classes by age group (4-5y, 6-7y, 8-9y).
- **Teacher Profiles**: Meet the expert instructors leading art, science, and music sessions.
- **Weekly Schedule**: Check the daily timetable for various discovery activities.
- **Sticky Booking Summary**: Real-time tracking of selected classes in a persistent sidebar.
- **Safety Accordion**: Detailed information about safety protocols and environmental standards.
- **Kids-Friendly Design**: Vibrant pastel colors and rounded typography for a welcoming look.
- **API Integrated**: Real-time fetching of classes and teacher data from a mock backend.

## API Endpoints
- `GET /api/health`: Service health check.
- `GET /api/kids-classes`: List of discovery classes with age and capacity info.
- `GET /api/teachers`: Profiles of the education staff.

## Intentional Frontend Bugs
This site contains 3 intentional GUI/UX errors for PPO agent training:
1. **Age Filter Result Mismatch**: The "6~7 years" filter incorrectly includes classes from the "4~5 years" age group.
2. **Safety Card Overlap**: Accordion items in the safety section overlap each other when expanded due to layout constraints.
3. **Class Book Button No-Response**: The "Book Class" button for the popular Junior Chef Academy is non-functional.

Refer to `BUGS.md` and `TODO.md` for more details.
