const express = require('express')
const GameCtrl = require('../controllers/game-ctrl')


const router = express.Router()

router.get('/newGame', GameCtrl.getGame)

module.exports = router 