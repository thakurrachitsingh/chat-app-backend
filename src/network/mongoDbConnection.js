const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://thakurrachitsingh:q123456!@cluster0.oa2reon.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => { console.log("connection successfull with mongodb")})
.catch((e)=>{console.log(e);})