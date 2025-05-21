import mongoose from 'mongoose'

const windSchema = new mongoose.Schema({
  Timestamp: {
    type: Date,
  },
  Datetime: {
    type: Date,
  },
  Degrees_Wind: {
    type: Number,
  },
  Wind_From: {
    type: String,
  },
  Wind_To: {
    type: String,
  },
  Wind_Speed: {
    type: Number,
  }
})

export default mongoose.model('Wind', windSchema)
