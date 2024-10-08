
import Game from '../models/game-model.js'
import { createNewGame } from '../services/gameService';

/**
 * Asynchronous function for returning a new game as a JSON object. 
 * 
 * @async 
 * @param req {Object} Request object
 * @param res {Object} New game JSON
 * @param req.params.gameSettings {Object} Optional param containing setting for the new game
 * 
 */

export const getNewGame = async (req, res) => {
  console.log('New game request received');

  const gameSettings = req.params.gameSettings;

  try {
    const newGame = await createNewGame(gameSettings);
    console.log(newGame);
    res.status(200).json({ success: true, newgame: newGame });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
}
};

/**
 * Asynchronous function for returning an existing game as a JSON object. 
 * 
 * @async 
 * @param req {Object} Request object
 * @param res {Object} New game JSON
 * @param req.params._id {String} game id for requested game
 * 
 */


export const getGame = async (req,res) => {
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

