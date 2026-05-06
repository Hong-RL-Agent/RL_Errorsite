# Rose & Gold Luxury - Online Accessory Shopping

## Site Information
- **Site ID**: site083
- **Port**: 9302
- **Tech Stack**: Vanilla HTML, CSS, JavaScript, Express
- **Theme**: Luxury Fashion Accessory Store

## Execution
```bash
cd site083
npm install
npm start
```
Access the site at: `http://localhost:9302`

## Features
- **Artisanal Catalog**: Browse premium necklaces, earrings, and rings with high-quality imagery.
- **Sophisticated Filters**: Filter by category, material (Rose Gold, Platinum, etc.), and seasonal color palettes.
- **Gift Guide Integration**: Toggle recommendations specifically curated for gift-giving.
- **Interactive Bag**: Sticky shopping bag summary with real-time subtotal calculation.
- **Wishlist System**: Save favorite pieces to your personal wishlist with header badge tracking.
- **Product Details**: Immersive detail modals showcasing material specifications and descriptions.
- **Responsive Navigation**: Desktop-first design optimized for a premium shopping experience.
- **Dynamic Sorting**: Sort by price or newest arrivals.

## API Endpoints
- `GET /api/health`: Service status check.
- `GET /api/accessories`: Full product catalog.
- `GET /api/collections`: Featured seasonal collections.

## Intentional Frontend Bugs
This site contains 3 intentional GUI/UX errors for PPO agent training:
1. **Wishlist Count Mismatch**: The header wishlist badge displays `length - 1` instead of the actual count.
2. **Accessory Image Overlap**: A specific product image overlaps its own title and price due to layout calculation errors.
3. **Cart Button No-Response**: The "Add to Bag" button for a specific ring is non-functional despite appearing active.

Refer to `BUGS.md` and `TODO.md` for more details.
