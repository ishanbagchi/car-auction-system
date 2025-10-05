# Technical Requirements Document (TRD)

Project: Car Auction Management API (Learning Project)
Version: v1
Last Updated: 2025-10-06

## 1) Overview

A simple REST API where:

-   Admin can create and start auctions
-   Dealers can place bids
-   Anyone with a valid token can fetch the highest bid for an auction

This is a learning project—keep code and design minimal, readable, and easy to run locally.

## 2) Tech Stack

-   Node.js with Express.js
-   MongoDB with Mongoose
-   JWT (Bearer) for auth
-   dotenv for configuration
-   Validation: express-validator (or Joi if preferred)
-   Test via Postman/Thunder Client

## 3) Authentication (JWT)

-   Endpoint: POST /api/v1/auction/token
-   Static credentials only:
    -   username: Admin
    -   password: Admin
-   On success, return a JWT signed with HS256 and a short expiry (default 8h). Token is required for all other endpoints as Authorization: Bearer <token>.
-   No registration/login flows; no role checks needed beyond having a valid token.

Example response:
{
"message": "Token generated successfully",
"token": "<jwt>",
"expiresIn": 28800
}

## 4) Data Models (Simple)

Note: If a PDF defines these models already, keep them consistent. The minimal fields needed to implement the brief are listed here.

-   Car

    -   carId: string (unique)
    -   make: string
    -   model: string
    -   year: number

-   Dealer

    -   dealerId: string (unique)
    -   name: string
    -   email: string

-   Auction

    -   auctionId: string (unique)
    -   carId: string (ref Car.carId)
    -   startingPrice: number
    -   startTime: Date
    -   endTime: Date
    -   auctionStatus: enum ["Pending", "Active", "Closed"] (default: "Pending")

-   Bid
    -   bidId: string (unique)
    -   auctionId: string (ref Auction.auctionId)
    -   dealerId: string (ref Dealer.dealerId)
    -   bidAmount: number
    -   previousBid: number (optional; store last highest bid before this one)
    -   bidTime: Date (default now)

IDs can be client-provided (as in examples) or auto-generated server-side. Keep it simple.

## 5) Endpoint Contracts

Base: /api/v1/auction

1. POST /token

-   Description: Generate JWT using static Admin credentials
-   Auth: None
-   Body: { username: string, password: string }
-   Responses:
    -   200: { message, token, expiresIn }
    -   401: invalid credentials

2. POST /createAuction

-   Description: Create a new auction for a car
-   Auth: Bearer token required
-   Body:
    {
    "carId": "C123",
    "startingPrice": 500000,
    "startTime": "2025-10-07T10:00:00Z",
    "endTime": "2025-10-07T18:00:00Z"
    }
-   Validation:
    -   carId required
    -   startingPrice >= 0
    -   startTime < endTime
-   Responses:
    -   201: { message: "Auction created successfully", auctionId: "A001" }
    -   400: validation error

3. PATCH /status/{auctionId}

-   Description: Start an auction by setting status to "Active"
-   Auth: Bearer token required
-   Path params: auctionId
-   Responses:
    -   200: { message: "Auction started successfully", auctionStatus: "Active" }
    -   404: auction not found
    -   409: auction already Active/Closed

4. POST /placeBids

-   Description: Dealer places a bid on an active auction
-   Auth: Bearer token required
-   Body:
    {
    "auctionId": "A001",
    "dealerId": "D002",
    "bidAmount": 600000
    }
-   Validation:
    -   auction exists and is Active
    -   now within [startTime, endTime]
    -   bidAmount > max(startingPrice, currentHighestBid)
-   Responses:
    -   201: { message: "Bid placed successfully", bidId: "B012" }
    -   400: validation error or bid too low
    -   404: auction not found

5. GET /{auctionId}/winner-bid

-   Description: Highest bid for a given auction + dealer details
-   Auth: Bearer token required
-   Responses:
    -   200: { auctionId, highestBid: { bidId, bidAmount, dealer: { dealerId, name, email } } }
    -   200: { auctionId, highestBid: null } if no bids yet
    -   404: auction not found

## 6) Simple Business Rules

-   Auction can be started only if currently Pending and current time >= startTime.
-   Bids allowed only when auctionStatus = Active and current time <= endTime.
-   Each new bid must be strictly greater than the current highest bid (or startingPrice if no bids).
-   For this learning project, simple checks are sufficient; no advanced concurrency or transactions required.

## 7) Validation (express-validator or Joi)

-   createAuction: carId (string), startingPrice (integer>=0), valid ISO dates where startTime < endTime
-   placeBids: auctionId (string), dealerId (string), bidAmount (integer>0)
-   token: username=="Admin" and password=="Admin"

## 8) Error Responses (simple)

-   Format:
    { "message": string }
-   Use appropriate HTTP codes: 400, 401, 404, 409, 500.
-   Keep messages clear and minimal, e.g., "Bid must be higher than current highest".

## 9) Environment (.env.example)

-   PORT=3000
-   MONGODB_URI=mongodb://localhost:27017/car_auction
-   JWT_SECRET=change_me
-   JWT_EXPIRES_IN=8h

## 10) Repository and Submission

-   Public GitHub repo with:
    -   /src for app code
    -   README.md: setup, run steps, API usage examples
    -   package.json with scripts/deps
    -   .env.example file
-   Submit the GitHub link. Ensure the repo is public.

## 11) Minimal Examples (cURL)

-   Get token
    curl -X POST http://localhost:3000/api/v1/auction/token \
     -H 'Content-Type: application/json' \
     -d '{"username":"Admin","password":"Admin"}'

-   Create auction
    curl -X POST http://localhost:3000/api/v1/auction/createAuction \
     -H 'Authorization: Bearer <token>' \
     -H 'Content-Type: application/json' \
     -d '{"carId":"C123","startingPrice":500000,"startTime":"2025-10-07T10:00:00Z","endTime":"2025-10-07T18:00:00Z"}'

-   Start auction
    curl -X PATCH http://localhost:3000/api/v1/auction/status/A001 \
     -H 'Authorization: Bearer <token>'

-   Place bid
    curl -X POST http://localhost:3000/api/v1/auction/placeBids \
     -H 'Authorization: Bearer <token>' \
     -H 'Content-Type: application/json' \
     -d '{"auctionId":"A001","dealerId":"D002","bidAmount":600000}'

-   Highest bid
    curl -X GET http://localhost:3000/api/v1/auction/A001/winner-bid \
     -H 'Authorization: Bearer <token>'
