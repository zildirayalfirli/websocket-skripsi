import mongoose from 'mongoose'

const humiditySchema = new mongoose.Schema({
  Timestamp: {
    type: Date,
  },
  Datetime: {
    type: Date,
  },
  Air_Humidity: {
    type: Number,
  }
})

export default mongoose.model('Humidity', humiditySchema)
