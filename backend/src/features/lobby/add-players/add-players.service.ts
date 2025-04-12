// validation: based on game type... only single device can create multiple users
//  this is exceptional... the UI shouldn't let this happen so throw an exception

// also check if the game is in a valid status for adding players...

// the service shouldn't care about the number of players necessarilly, but perhaps have a max_player_limit
// I will have a start-game feature which will check if there are the necessary number of players... the lobby
// shoudl allow players to be added through multiple calls

// if valid...

// create players via repository call

// output array of plaayer data to controller
