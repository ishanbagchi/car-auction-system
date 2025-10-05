const jwt = require('jsonwebtoken')

function auth(req, res, next) {
	const h = req.headers['authorization'] || ''
	const parts = h.split(' ')
	if (parts.length !== 2 || parts[0] !== 'Bearer')
		return res
			.status(401)
			.json({ message: 'Missing or invalid Authorization header' })
	try {
		const payload = jwt.verify(parts[1], process.env.JWT_SECRET)
		req.user = payload
		next()
	} catch (e) {
		return res.status(401).json({ message: 'Invalid or expired token' })
	}
}

module.exports = auth
