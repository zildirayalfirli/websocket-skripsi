import mongoose from 'mongoose'

const warningSchema = new mongoose.Schema({
    Timestamp: {
        type: Date,
        default: Date.now
    },
    Datetime: {
        type: Date,
        required: true
    },
    Warning_Desc: {
        type: String,
        required: true
    }
})

export default mongoose.model('Warning', warningSchema)
