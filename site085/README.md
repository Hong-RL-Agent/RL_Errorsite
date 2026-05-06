# CertiHub - National Certification Exam Portal

## Site Information
- **Site ID**: site085
- **Port**: 9304
- **Tech Stack**: Vanilla HTML, CSS, JavaScript, Express
- **Theme**: Official Examination Schedule & Registration Portal

## Execution
```bash
cd site085
npm install
npm start
```
Access the site at: `http://localhost:9304`

## Features
- **Official Exam Directory**: Search and filter national/private certification exams by category and region.
- **Dynamic Calendar**: Interactive examination calendar with month navigation and key event highlighting.
- **Registration Workflow**: Mock registration process with a sticky summary panel to track selected exams.
- **Official Announcements**: Accordion-style notice board for important examination updates and venue changes.
- **Detailed Examination Info**: Modals providing comprehensive guidelines, periods, and status for each certificate.
- **Public Sector Design**: Clean, trust-focused UI using a professional Navy/Blue palette.
- **API Integrated**: Real-time data fetching for exams and notices from a mock backend.

## API Endpoints
- `GET /api/health`: Service availability status.
- `GET /api/exams`: Detailed exam dataset (ID, status, dates).
- `GET /api/notices`: Official portal announcements.

## Intentional Frontend Bugs
This site contains 3 intentional GUI/UX errors for PPO agent training:
1. **Status Label Mismatch**: The registration status (Open/Closed) shown on cards differs from the status shown in detail modals.
2. **Calendar Overflow**: The examination calendar has a fixed height, causing 6-week months to overflow and overlap the announcement section.
3. **Apply Button No-Response**: The "Apply" button for the Digital Forensic Specialist exam is non-functional.

Refer to `BUGS.md` and `TODO.md` for more details.
