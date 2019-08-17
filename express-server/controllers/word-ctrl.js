const Word = require('../models/word-model')



postWordArray = async (req,res) => {
    const body = req.body
    console.log(body[0])
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide one or more words',
        })
    }

    for(var index in body){
        console.log(body[index]);
        const word = new Word(body[index])

            if (!word) {
                return res.status(400).json({ success: false, error: err })
            }

            word
                .save()
                .then(() => {
                    return res.status(201).json({
                        success: true,
                        id: word._id,
                        message: 'Word created!',
                    })
                })
                .catch(error => {
                    return res.status(400).json({
                        error,
                        message: 'Word not created!',
                    })
                })
    }

}

getRandomWords = async (req,res) => {
    await Word.findRandom({},{},{limit:12}, function(err,results){
        if(err){
            return res.status(400).json({ success: false, error: err })
        }

        if (!results) {
            return res
                .status(404)
                .json({ success: false, error: `none` })
        }

        console.log(results);
        return res.status(200).json({ success: true, words: results })       
       })
       .catch(err =>
           console.log(err)
       )

}

getRandomWord = async (req, res) => {
    await Word.findOneRandom(function(err, word) {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!word) {
            return res
                .status(404)
                .json({ success: false, error: `none` })
        }

         console.log(word);
         return res.status(200).json({ success: true, data: word })
      })
      .catch(err => console.log(err))
}

createWord = (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a word',
        })
    }

    const word = new Word(body)

    if (!word) {
        return res.status(400).json({ success: false, error: err })
    }

    word
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: word._id,
                message: 'Word created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Word not created!',
            })
        })

    
    
}


module.exports={getRandomWords,getRandomWord,createWord,postWordArray}