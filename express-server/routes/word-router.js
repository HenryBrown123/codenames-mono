import express from 'express'
import {getRandomWord, createWord, getRandomWords, postWordArray} from '../controllers/word-ctrl.js'

const router = express.Router()

router.get('/randomWord', getRandomWord)
router.post('/createWord', createWord)
router.get('/randomWords', getRandomWords)
router.post('/createWordArray',postWordArray)


export default router