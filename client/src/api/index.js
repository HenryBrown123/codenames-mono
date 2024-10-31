import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

export const insertWord = (payload) => api.post("/words", payload);
export const getRandomWords = () => api.get("/words/random");
export const getNewGame = (payload) => api.post("/games", payload);
export const getGame = (id) => api.get(`/games/${id}`);
export const processTurn = (id, action) =>
  api.post(`/games/${id}/turn`, action);

const apis = {
  insertWord,
  getRandomWords,
  getNewGame,
  getGame,
  processTurn,
};

export default apis;
