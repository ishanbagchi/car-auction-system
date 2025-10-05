require('dotenv').config()
const app = require('./app')
const { connect } = require('./config/db')

const port = process.env.PORT || 3000

connect(process.env.MONGODB_URI)
	.then(() => {
		app.listen(port, () => {
			console.log(`Server running on port ${port}`)
		})
	})
	.catch((err) => {
		console.error('Failed to connect to DB', err)
		process.exit(1)
	})
