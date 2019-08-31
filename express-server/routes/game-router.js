const express = require('express')
const GameCtrl = require('../controllers/game-ctrl')


const router = express.Router()

router.get('/newGame', GameCtrl.getNewGame)
router.get('/getGame/:_id', GameCtrl.getGame)

module.exports = router 