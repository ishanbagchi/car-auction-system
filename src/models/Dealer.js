const mongoose = require('mongoose')

const DealerSchema = new mongoose.Schema(
	{
		dealerId: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
	},
	{ timestamps: true },
)

module.exports = mongoose.model('Dealer', DealerSchema)
