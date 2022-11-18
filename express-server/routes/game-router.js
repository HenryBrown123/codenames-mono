const express = require('express')
const GameCtrl = require('../controllers/game-ctrl')


const router = express.Router()

router.get('/newGame/:gameSettings?', GameCtrl.getNewGame)
router.get('/getGame/:_id', GameCtrl.getGame)

module.exports = router 