import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
})

export const insertWord = payload => api.post(`/createWord`, payload)
export const getRandomWords = () => api.get(`/randomWords`)
export const getNewGame = () => api.get('/game/newGame')
export const getGame = (id) => api.get(`game/getGame/${id}`)

const apis = {
    insertWord,
    getRandomWords,
    getNewGame,
    getGame
}

export default apis