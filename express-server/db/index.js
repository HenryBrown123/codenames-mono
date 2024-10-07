import mongoose from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'


mongoose
    .connect('mongodb://127.0.0.1:27017/codenames', { useNewUrlParser: true })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection
const AutoIncrement = AutoIncrementFactory(db)

export default db

