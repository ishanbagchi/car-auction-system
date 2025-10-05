# Car Auction Management API

Minimal Node.js + Express + MongoDB API per TRD.

## Setup

1. Copy env

```sh
cp .env.example .env
```

2. Install deps

```sh
npm install
```

3. Seed sample data

```sh
npm run seed
```

4. Start server

```sh
npm start
```

Server: http://localhost:3000

## Endpoints

Base: /api/v1/auction

-   POST /token
-   POST /createAuction
-   PATCH /status/:auctionId
-   POST /placeBids
-   GET /:auctionId/winner-bid

Use Authorization: Bearer <token> for all except /token.
