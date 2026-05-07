# Nexus Commerce Admin Dashboard (site024)

This is a professional e-commerce management console built for PPO agent training. It simulates a real-world admin dashboard for managing products, categories, and orders.

## Project Information
- **Site ID**: site024
- **Port**: 9133
- **Stack**: React (Vite) + Express

## Features
- **Overview**: Real-time stats cards for products, orders, and stock alerts.
- **Product Catalog**: Full list of products with filtering and status badges.
- **Categories**: Visual category structure and item counts.
- **Order Management**: Order history with status tracking.
- **Diagnostics**: Tools for system health and data integrity checks.
- **Performance Lab**: Stress testing tools for API latency.

## Intentional Backend Bugs
The following bugs are implemented for PPO agent detection training:

1. **site024-bug01**: Seed Data Inconsistency
   - Some products reference non-existent category IDs.
   - Trigger: Click "Run Seed Integrity Scan" in Seed Diagnostics menu.
   - data-bug-id: `site024-bug01`

2. **site024-bug02**: Backward Compatibility Break
   - Legacy API removes the `displayName` field required by older clients.
   - Trigger: Click "Fetch Legacy Product Response" in Legacy Compat menu.
   - data-bug-id: `site024-bug02`

3. **site024-bug03**: Default Value Logic Collapse
   - New products are saved as `draft`/`hidden` instead of `active`/`public` when status is omitted.
   - Trigger: Create a new product via the "New Product" form.
   - data-bug-id: `site024-bug03`

4. **site024-bug04**: N+1 Query Timeout
   - Fetching orders with details triggers an inefficient N+1 query pattern, causing extreme latency.
   - Trigger: Click "Fetch Orders with Full Details" in Performance Lab.
   - data-bug-id: `site024-bug04`

## Getting Started
1. `cd site024`
2. `npm install`
3. `npm start`
4. Visit `http://localhost:9133`
