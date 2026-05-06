# MediLife Hospital - Online Appointment System

## Site Information
- **Site ID**: site090
- **Port**: 9309
- **Tech Stack**: Vanilla HTML, CSS, JavaScript, Express
- **Theme**: Professional Medical & Healthcare Portal

## Execution
```bash
cd site090
npm install
npm start
```
Access the site at: `http://localhost:9309`

## Features
- **Department Directory**: Browse medical departments with availability status and clinician counts.
- **Clinician Finder**: View specialist profiles, specialties, and weekly availability within each department.
- **Interactive Booking**: Mock appointment scheduling with date and time selection.
- **Hospital Announcements**: Accordion-style notice board for important updates and campaign news.
- **Dynamic Directions**: Tabbed navigation for bus, subway, and car access information.
- **Sticky Appointment Summary**: Persistent sidebar tracking selected department and clinician for confirmation.
- **Medical FAQ**: Helpful guidance for appointment cancellations and required documentation.
- **Professional Aesthetics**: Trust-focused design using Medical Blue and Mint accents.

## API Endpoints
- `GET /api/health`: Service availability status.
- `GET /api/departments`: Clinical departments dataset.
- `GET /api/doctors`: Medical specialist profiles and department mapping.
- `GET /api/notices`: Hospital-wide announcements and holiday schedules.

## Intentional Frontend Bugs
This site contains 3 intentional GUI/UX errors for PPO agent training:
1. **Doctor-Department Mapping Error**: The Pediatrics (d002) department modal incorrectly displays Orthopedics specialists.
2. **Medical Summary Panel Overflow**: The appointment summary sidebar has a fixed height, causing the "Confirm" button to be cut off when content is long.
3. **Medical Booking Button No-Response**: The "Select" button for the Cardiology department is non-functional.

Refer to `BUGS.md` and `TODO.md` for more details.
