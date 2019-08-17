import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
})

export const insertWord = payload => api.post(`/createWord`, payload)
export const getRandomWords = () => api.get(`/randomWords`)
export const getGame = () => api.get('/game/newGame')

const apis = {
    insertWord,
    getRandomWords,
    getGame,
}

export default apis