# TemplateFlow - Document Template Marketplace (site074)

TemplateFlow is a high-fidelity online marketplace for professional document templates. This project is a training environment for PPO reinforcement learning agents to detect GUI errors.

## Project Details
- **Site ID:** site074
- **Port:** 9293
- **Tech Stack:** Vanilla HTML, CSS, JavaScript, Express.js
- **Design Theme:** Productivity Style (White, Royal Blue, Purple)

## Key Features
- **Template Search:** Find templates by keywords.
- **Category & Format Filters:** Narrow down selection by business/design and DOCX/PDF/etc.
- **Preview Modal:** View large-scale previews of documents.
- **Library System:** Save templates to a side panel library.
- **Responsive Toolbar:** Sort and manage templates easily.

## API Endpoints
- `GET /api/health`: Health status.
- `GET /api/templates`: List of all document templates.
- `GET /api/categories`: List of categories with template counts.

## Intentional Frontend Bugs
1. **Saved Template Count Mismatch (Bug ID: site074-bug01):** Header badge shows 1 less than actual saved items.
2. **Preview Modal Overflow (Bug ID: site074-bug02):** Preview image overflows modal, covering UI elements.
3. **Preview Button No Response (Bug ID: site074-bug03):** One template's "Preview" button fails to open the modal.

## Running
1. `cd site074`
2. `npm install`
3. `npm start`
4. Visit `http://localhost:9293`
