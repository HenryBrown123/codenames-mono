const express = require('express')
const WordCtrl = require('../controllers/word-ctrl')


const router = express.Router()

router.get('/randomWord', WordCtrl.getRandomWord)
router.post('/createWord',WordCtrl.createWord)
router.get('/randomWords',WordCtrl.getRandomWords)
router.post('/createWordArray',WordCtrl.postWordArray)


module.exports = router 