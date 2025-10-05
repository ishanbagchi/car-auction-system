const express = require('express')
const { body, param, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const Auction = require('../models/Auction')
const Bid = require('../models/Bid')
const Dealer = require('../models/Dealer')
const Car = require('../models/Car')
const auth = require('../middleware/auth')

const router = express.Router()

function validate(req, res) {
	const errors = validationResult(req)
	if (!errors.isEmpty())
		return res
			.status(400)
			.json({ message: 'Validation error', errors: errors.array() })
}

router.post(
	'/token',
	body('username').isString(),
	body('password').isString(),
	async (req, res) => {
		const err = validate(req, res)
		if (err) return
		const { username, password } = req.body
		if (username !== 'Admin' || password !== 'Admin')
			return res.status(401).json({ message: 'Invalid credentials' })
		const token = jwt.sign({ sub: 'admin' }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN || '8h',
		})
		return res.json({
			message: 'Token generated successfully',
			token,
			expiresIn: 60 * 60 * 8,
		})
	},
)

router.post(
	'/createAuction',
	auth,
	body('carId').isString(),
	body('startingPrice').isInt({ min: 0 }),
	body('startTime').isISO8601(),
	body('endTime').isISO8601(),
	async (req, res) => {
		const err = validate(req, res)
		if (err) return
		const { carId, startingPrice, startTime, endTime } = req.body
		if (new Date(startTime) >= new Date(endTime))
			return res
				.status(400)
				.json({ message: 'startTime must be before endTime' })
		const car = await Car.findOne({ carId })
		if (!car)
			return res.status(400).json({ message: 'carId does not exist' })
		const auctionId = 'A' + Date.now()
		const auction = await Auction.create({
			auctionId,
			carId,
			startingPrice,
			startTime,
			endTime,
			auctionStatus: 'Pending',
		})
		return res
			.status(201)
			.json({
				message: 'Auction created successfully',
				auctionId: auction.auctionId,
			})
	},
)

router.patch(
	'/status/:auctionId',
	auth,
	param('auctionId').isString(),
	async (req, res) => {
		const err = validate(req, res)
		if (err) return
		const { auctionId } = req.params
		const auction = await Auction.findOne({ auctionId })
		if (!auction)
			return res.status(404).json({ message: 'Auction not found' })
		if (auction.auctionStatus !== 'Pending')
			return res
				.status(409)
				.json({ message: 'Auction not in Pending state' })
		const now = new Date()
		if (now < new Date(auction.startTime))
			return res
				.status(400)
				.json({ message: 'Cannot start before startTime' })
		if (now > new Date(auction.endTime))
			return res.status(409).json({ message: 'Auction already ended' })
		auction.auctionStatus = 'Active'
		await auction.save()
		return res.json({
			message: 'Auction started successfully',
			auctionStatus: 'Active',
		})
	},
)

router.post(
	'/placeBids',
	auth,
	body('auctionId').isString(),
	body('dealerId').isString(),
	body('bidAmount').isInt({ min: 1 }),
	async (req, res) => {
		const err = validate(req, res)
		if (err) return
		const { auctionId, dealerId, bidAmount } = req.body
		const auction = await Auction.findOne({ auctionId })
		if (!auction)
			return res.status(404).json({ message: 'Auction not found' })
		if (auction.auctionStatus !== 'Active')
			return res.status(400).json({ message: 'Auction not active' })
		const now = new Date()
		if (
			now < new Date(auction.startTime) ||
			now > new Date(auction.endTime)
		)
			return res
				.status(400)
				.json({ message: 'Bidding not allowed at this time' })

		const dealer = await Dealer.findOne({ dealerId })
		if (!dealer)
			return res.status(400).json({ message: 'dealerId does not exist' })

		const top = await Bid.findOne({ auctionId }).sort({ bidAmount: -1 })
		const currentHighest = top ? top.bidAmount : auction.startingPrice
		if (bidAmount <= currentHighest)
			return res
				.status(400)
				.json({ message: 'Bid must be higher than current highest' })

		const bidId = 'B' + Date.now()
		const bid = await Bid.create({
			bidId,
			auctionId,
			dealerId,
			bidAmount,
			previousBid: currentHighest,
		})
		return res
			.status(201)
			.json({ message: 'Bid placed successfully', bidId: bid.bidId })
	},
)

router.get(
	'/:auctionId/winner-bid',
	auth,
	param('auctionId').isString(),
	async (req, res) => {
		const err = validate(req, res)
		if (err) return
		const { auctionId } = req.params
		const auction = await Auction.findOne({ auctionId })
		if (!auction)
			return res.status(404).json({ message: 'Auction not found' })
		const top = await Bid.findOne({ auctionId }).sort({ bidAmount: -1 })
		if (!top) return res.json({ auctionId, highestBid: null })
		const dealer = await Dealer.findOne({ dealerId: top.dealerId }).lean()
		return res.json({
			auctionId,
			highestBid: {
				bidId: top.bidId,
				bidAmount: top.bidAmount,
				dealer: dealer
					? {
							dealerId: dealer.dealerId,
							name: dealer.name,
							email: dealer.email,
					  }
					: null,
			},
		})
	},
)

module.exports = router
