require('dotenv').config()
const { connect } = require('./src/config/db')
const Car = require('./src/models/Car')
const Dealer = require('./src/models/Dealer')

async function run() {
	await connect(process.env.MONGODB_URI)
	await Car.updateOne(
		{ carId: 'C123' },
		{ carId: 'C123', make: 'Toyota', model: 'Corolla', year: 2020 },
		{ upsert: true },
	)
	await Dealer.updateOne(
		{ dealerId: 'D002' },
		{ dealerId: 'D002', name: 'Ravi Kumar', email: 'ravi@example.com' },
		{ upsert: true },
	)
	console.log('Seeded Car C123 and Dealer D002')
	process.exit(0)
}

run()
