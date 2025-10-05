const mongoose = require('mongoose')

const BidSchema = new mongoose.Schema(
	{
		bidId: { type: String, required: true, unique: true },
		auctionId: { type: String, required: true },
		dealerId: { type: String, required: true },
		bidAmount: { type: Number, required: true, min: 1 },
		previousBid: { type: Number },
		bidTime: { type: Date, default: Date.now },
	},
	{ timestamps: true },
)

BidSchema.index({ auctionId: 1 })
BidSchema.index({ auctionId: 1, bidAmount: -1 })
BidSchema.index({ auctionId: 1, bidTime: -1 })

module.exports = mongoose.model('Bid', BidSchema)
