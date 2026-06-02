# Inventory & Order Management System

A simplified full-stack system for managing products, customers, orders, and inventory tracking.

## Tech Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL
- Frontend: React, Vite, Axios
- Database: PostgreSQL
- Containers: Docker, Docker Compose

## Business Rules Covered

- Product SKUs are unique.
- Customer emails are unique.
- Product prices must be positive.
- Product stock cannot be negative.
- Orders require at least one item.
- Order item quantities must be positive.
- Orders are rejected when stock is insufficient.
- Product stock is reduced automatically after a valid order is placed.
- Order totals are calculated by the backend.

## Local Setup With Docker

From the project root:

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:8000/health`
- Backend API docs: `http://localhost:8000/docs`

## Local Testing Flow

1. Open `http://localhost:3000`.
2. Add a product with a unique SKU, for example:
   - Name: `Notebook`
   - SKU: `NB-001`
   - Price: `50`
   - Stock: `10`
3. Try adding another product with SKU `NB-001`; it should fail with a duplicate SKU message.
4. Add a customer with a unique email.
5. Try adding another customer with the same email; it should fail with a duplicate email message.
6. Go to Orders, select the customer, select the product, and place an order with quantity `2`.
7. Go back to Products and confirm stock reduced from `10` to `8`.
8. Try placing an order with quantity higher than available stock; it should fail.

## API Endpoints

- `GET /health`
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/{id}`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `GET /api/customers`
- `POST /api/customers`
- `GET /api/customers/{id}`
- `PUT /api/customers/{id}`
- `DELETE /api/customers/{id}`
- `GET /api/orders`
- `POST /api/orders`

## Environment Variables

Backend:

```bash
DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/inventory_db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

Frontend:

```bash
VITE_API_URL=http://localhost:8000/api
```

## Deployment Plan

Recommended free/hobby deployment:

- Frontend: Vercel
- Backend: Render Web Service
- Database: Render PostgreSQL or Neon PostgreSQL
- Docker image: Docker Hub

Deployment checklist:

1. Push this repository to GitHub.
2. Create a PostgreSQL database on Render or Neon.
3. Deploy the backend as a Render web service.
4. Set backend environment variables:
   - `DATABASE_URL`
   - `CORS_ORIGINS`
5. Deploy the frontend on Vercel.
6. Set frontend environment variable:
   - `VITE_API_URL`
7. Build and push Docker image to Docker Hub.
8. Submit:
   - GitHub repository link
   - Docker image link
   - Frontend live URL
   - Backend live URL
   - API docs URL
