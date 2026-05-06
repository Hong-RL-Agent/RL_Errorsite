# Visionary Eyewear - Minimalist E-commerce Store (site071)

Visionary Eyewear is a high-fidelity online shopping platform for premium minimalist eyewear. This project is created as a training environment for PPO (Proximal Policy Optimization) reinforcement learning agents to detect frontend GUI errors.

## Project Details
- **Site ID:** site071
- **Port:** 9290
- **Tech Stack:** Vanilla HTML, CSS, JavaScript, Express.js
- **Design Theme:** Minimalist Fashion (White, Black, Sand Beige, Silver)

## Key Features
- **Product Filtering:** Filter by frame shape (Square, Round, Aviator, etc.).
- **Search:** Live search for frame names.
- **Product Details:** Detailed view with lens selection options.
- **Cart Summary:** Sticky panel showing selected frame, lens, and total price.
- **Virtual Try-on:** Mock interface for trying on glasses virtually.
- **Responsive Design:** Optimized for 1440px desktop displays.

## API Endpoints
- `GET /api/health`: Check server status.
- `GET /api/glasses`: Retrieve the collection of eyewear.
- `GET /api/lens-options`: Retrieve available lens types and pricing.

## Intentional Frontend Bugs
This site contains 3 intentional GUI bugs for PPO agent training:
1. **Lens Option Summary Mismatch (Bug ID: site071-bug01):** Selected lens option in modal doesn't update in the cart summary panel.
2. **Product Image Ratio Break (Bug ID: site071-bug02):** One specific product image is distorted due to incorrect CSS scaling.
3. **Try-on Button No Response (Bug ID: site071-bug03):** "Try-on" button for a specific product does not trigger any action.

For detailed bug reports, see [BUGS.md](./BUGS.md).

## Running the Project
1. Navigate to the directory: `cd site071`
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Access the site: `http://localhost:9290`
