# Car Auction Management API

Node.js + Express + MongoDB API implementing a simple car auction flow.

Admins generate a token, create and start auctions; dealers place bids; anyone with a token can fetch the highest bid.

## Prerequisites

-   Node.js 18+ and npm
-   MongoDB (local) or MongoDB Atlas connection string

## Setup

1. Copy env template

Create `.env` from `.env.example` and set `MONGODB_URI`, `JWT_SECRET` as needed.

2. Install dependencies

`npm install`

3. Seed sample data (Car C123, Dealer D002)

`npm run seed`

4. Start server

`npm start`

Server runs at: http://localhost:3000

## Environment Variables

-   PORT=3000
-   MONGODB_URI=mongodb://localhost:27017/car_auction (or Atlas URI)
-   JWT_SECRET=change_me
-   JWT_EXPIRES_IN=8h

## API Endpoints

Base path: `/api/v1/auction`

1. POST `/token`

-   Description: Generate JWT using static credentials (username: Admin, password: Admin)
-   Auth: None
-   Body: `{ "username": "Admin", "password": "Admin" }`
-   200: `{ message, token, expiresIn }`

2. POST `/createAuction`

-   Description: Create a new auction
-   Auth: Bearer token required
-   Body:
    -   `carId`: string (must exist; example uses seeded `C123`)
    -   `startingPrice`: integer >= 0
    -   `startTime`: ISO string
    -   `endTime`: ISO string (must be after startTime)
-   201: `{ message, auctionId }`

3. PATCH `/status/:auctionId`

-   Description: Start an auction (sets status to Active)
-   Auth: Bearer token required
-   200: `{ message, auctionStatus: "Active" }`

4. POST `/placeBids`

-   Description: Place a bid on an active auction
-   Auth: Bearer token required
-   Body:
    -   `auctionId`: string
    -   `dealerId`: string (must exist; example uses seeded `D002`)
    -   `bidAmount`: integer > current highest (or startingPrice if none)
-   201: `{ message, bidId }`

5. GET `/:auctionId/winner-bid`

-   Description: Highest bid for an auction with dealer details
-   Auth: Bearer token required
-   200: `{ auctionId, highestBid: { bidId, bidAmount, dealer } }` or `{ highestBid: null }`

## Quick Flow (example bodies)

1. Get token (public)

```
POST /api/v1/auction/token
{ "username": "Admin", "password": "Admin" }
```

2. Create auction (use seeded Car `C123`)

```
POST /api/v1/auction/createAuction
Auth: Bearer <token>
{
	"carId": "C123",
	"startingPrice": 500000,
	"startTime": "2025-10-01T00:00:00Z",
	"endTime": "2025-10-08T00:00:00Z"
}
```

3. Start auction

```
PATCH /api/v1/auction/status/<auctionId>
Auth: Bearer <token>
```

4. Place a bid (use seeded Dealer `D002`)

```
POST /api/v1/auction/placeBids
Auth: Bearer <token>
{
	"auctionId": "<auctionId>",
	"dealerId": "D002",
	"bidAmount": 600000
}
```

5. Get highest bid

```
GET /api/v1/auction/<auctionId>/winner-bid
Auth: Bearer <token>
```

## Notes & Troubleshooting

-   Start auction only if current time is between `startTime` and `endTime`, and status is `Pending`.
-   Bids are allowed only while the auction is `Active` and within time window.
-   If you see connection errors, verify `MONGODB_URI` in `.env` (Atlas users: ensure IP allowlist includes your machine and the URI includes credentials).
-   Sample data: Car `C123`, Dealer `D002` are created by `npm run seed`.

## License

MIT
