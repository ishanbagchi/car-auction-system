const mongoose = require('mongoose')

const AuctionSchema = new mongoose.Schema(
	{
		auctionId: { type: String, required: true, unique: true },
		carId: { type: String, required: true },
		startingPrice: { type: Number, required: true, min: 0 },
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: true },
		auctionStatus: {
			type: String,
			enum: ['Pending', 'Active', 'Closed'],
			default: 'Pending',
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('Auction', AuctionSchema)
