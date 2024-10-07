import express from 'express'
import {getNewGame, getGame, nextTurn} from '../controllers/game-ctrl.js'


const router = express.Router()

router.get('/newGame/:gameSettings?', getNewGame)
router.get('/getGame/:_id',  getGame)
router.get('/nextTurn/:_id', nextTurn)

export default router