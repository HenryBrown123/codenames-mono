const Word = require('../models/word-model')
const GameTile = require('../models/game-model')

getGame = async (req,res) => {

    var colors = ['red','red','red','red','red','green','green','green','green','green','green','blue']

    await Word.findRandom({},{},{limit:12}, function(err,results){
        if(err){
            return res.status(400).json({ success: false, error: err })
        }

        if (!results) {
            return res
                .status(404)
                .json({ success: false, error: `none` })
        }

        var game = []
        
        for( var i = 0; i < results.length; i++){
            randomIndex = Math.floor(Math.random() * colors.length)
            wordColor = colors[randomIndex];
            colors.splice(randomIndex,1)
            const wordTile = new GameTile({"word":results[i].word,"color":wordColor})
            wordTile.save()
            game.push(wordTile)

        }
        console.log(game)
        return res.status(200).json({ success: true, newgame: game })       
       })
       .catch(err =>
           console.log(err)
       )
}


module.exports={getGame}