const express = require('express')
const auctionRoutes = require('./routes/auction.routes')

const app = express()
app.use(express.json())

app.use('/api/v1/auction', auctionRoutes)

module.exports = app
