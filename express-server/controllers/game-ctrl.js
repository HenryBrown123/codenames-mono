const Word = require('../models/word-model')
const Game = require('../models/game-model')

/**
 * Asynchronous function for returning a new game as a JSON object. 
 * 
 * @async 
 * @param req {Object} Request object
 * @param res {Object} New game JSON
 * @param req.params.gameSettings {Object} Optional param containing setting for the new game
 * 
 */


const getNewGame = async (req,res) => { 

    console.log('New game request received')

    const defaultGameSettings = {
        numberOfCards: 25,
        startingWithTeam: 'green',
        numberOfAssasins: 1
    }

    var gameSettings = req.params.gameSettings ? req.params.gameSettings: defaultGameSettings
    const otherTeam = (gameSettings.startingWithTeam === 'green') ? 'red':'green'


    /* Derives which card should be asigned what color based on number of total cards..
     * The same ratio is used as the default rules.
     * The starting team will likely have one more card than the next team.
     */

    // these are the number of bystander cards + the assasin card(s)
    const numberOfCardsNonTeam = Math.round((8/25)*gameSettings.numberOfCards)

    var numberOfCardsStartingTeam = Math.ceil((gameSettings.numberOfCards-numberOfCardsNonTeam)/2)
    var numberOfCardsOtherTeam = Math.floor((gameSettings.numberOfCards-numberOfCardsNonTeam)/2)
    var numberOfCardsAssasins = gameSettings.numberOfAssasins

    // total number - (other derived) so total always equals that requested
    var numberOfCardsBystander = (gameSettings.numberOfCards - 
                                 numberOfCardsStartingTeam - 
                                 numberOfCardsOtherTeam - 
                                 numberOfCardsAssasins)
                                 
    
    var colorsToAllocate = Array(numberOfCardsStartingTeam).fill(gameSettings.startingWithTeam).concat(
        Array(numberOfCardsOtherTeam).fill(otherTeam),
        Array(numberOfCardsAssasins).fill('black'),
        Array(numberOfCardsBystander).fill('blue')
    )

    await Word.findRandom({},{},{limit:gameSettings.numberOfCards}, function(err,results){
        if(err){
            return res.status(400).json({ success: false, error: err })
        }

        if (!results) {
            console.log("No results returned from Word.findRandom")
            return res
                .status(404)
                .json({ success: false, error: `error: No words found, populate db with start point (express-server/db/startpoint.json)`})
        }

        var gameWords = []
        for( var i = 0; i < results.length; i++){
            const randomIndex = Math.floor(Math.random() * colorsToAllocate.length)
            const wordColor = colorsToAllocate[randomIndex];
            colorsToAllocate.splice(randomIndex,1)
            const wordTile = {"word":results[i].word,"color":wordColor}
            gameWords.push(wordTile)
        }
        var newGame = new Game(
            {"number_of_cards":gameSettings.numberOfCards,
             "starting_team":gameSettings.startingWithTeam,
              "words":gameWords,
              "number_of_assasins":gameSettings.numberOfAssasins}
        )
        newGame.save()

        console.log(newGame)
        return res.status(200).json({ success: true, newgame: newGame})       
       })
       .catch(err =>
           console.log(err)
       )
}

/**
 * Asynchronous function for returning an existing game as a JSON object. 
 * 
 * @async 
 * @param req {Object} Request object
 * @param res {Object} New game JSON
 * @param req.params._id {String} game id for requested game
 * 
 */


const getGame = async (req,res) => {
    const id = req.params._id
    await Game.findById(id,function(err,results){
        if(err){
            return res.status(400).json({ success: false, error: err })
        }

        if (!results) {
            return res
                .status(404)
                .json({ success: false, error: `game not found` })
        }

        console.log(results)
        return res.status(200).json({ success: true, game: results})       
       })
       .catch(err =>
           console.log(err)
       )
}

/**
 * Asynchronous function for returning an existing game as a JSON object. 
 * 
 * @async 
 * @param req {Object} Request object
 * @param res {Object} New game JSON
 * @param req.params._id {String} game id for requested game
 * 
 */

const nextTurn = async (req,res) => {
    try{
        const game = await getGame(req, res);        
        if(!game.res.success){
            console.log('Unable to determine next turn')
            return game;
        }        
    } catch (err) {
        console.log(err);
    }
}


module.exports={getNewGame,getGame, nextTurn}