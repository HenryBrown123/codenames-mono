import express from 'express'
import {getNewGame, getGame} from '../controllers/game-ctrl.js'


const router = express.Router()

router.get('/newGame/:gameSettings?', getNewGame)
router.get('/getGame/:_id',  getGame)

export default router