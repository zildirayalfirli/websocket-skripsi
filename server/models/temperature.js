import mongoose from 'mongoose'

const temperatureSchema = new mongoose.Schema({
  Timestamp: {
    type: Date,
  },
  Datetime: {
    type: Date,
  },
  Temperature: {
    type: Number,
  }
})

export default mongoose.model('Temperature', temperatureSchema)
