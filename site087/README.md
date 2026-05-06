# Butter & Bread - Artisanal Online Bakery

## Site Information
- **Site ID**: site087
- **Port**: 9306
- **Tech Stack**: Vanilla HTML, CSS, JavaScript, Express
- **Theme**: Warm Artisanal Bakery Ordering Platform

## Execution
```bash
cd site087
npm install
npm start
```
Access the site at: `http://localhost:9306`

## Features
- **Bread & Pastry Menu**: Comprehensive catalog of handcrafted loaves and seasonal pastries.
- **Dynamic Filters**: Filter by item type (Bread, Cake, etc.) and allergy-safety tags (Gluten, Dairy, etc.).
- **Search System**: Real-time keyword search for finding specific bakery items.
- **Cake Reservation**: Specialized form for pre-ordering custom cakes with personalized messages.
- **Pickup Slots**: Integration with available time slots for fresh-from-the-oven pickup.
- **Order Basket**: Sticky summary panel that tracks item quantities and total pricing.
- **Ingredient Transparency**: Allergy information available on cards and detailed modals.
- **Warm Aesthetics**: Cozy cream and butter-yellow design for a premium bakery experience.

## API Endpoints
- `GET /api/health`: Service health check.
- `GET /api/bakery-items`: List of available bread, pastries, and cakes.
- `GET /api/pickup-slots`: Available pickup times and remaining capacity.

## Intentional Frontend Bugs
This site contains 3 intentional GUI/UX errors for PPO agent training:
1. **Allergy Tag Missing**: Specific product cards fail to render allergy tags that are present in the API and detail modal.
2. **Cake Option Form Overlap**: The message input and pickup time fields in the cake reservation form overlap visually.
3. **Order Button No-Response**: The "Add to Basket" button for the Chocolate Lava Season Cake is non-functional.

Refer to `BUGS.md` and `TODO.md` for more details.
