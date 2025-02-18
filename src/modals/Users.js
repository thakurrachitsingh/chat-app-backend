const mongoose = require("mongoose")

const modal = new mongoose.Schema({
    uuid : {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    chatRoomReference : [{
        chatRoomId : {
            type: String
        }
    }]
})

