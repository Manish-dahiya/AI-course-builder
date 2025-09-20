const mongoose=require("mongoose")

mongoose.connect(process.env.MONGO_URI);

let db=mongoose.connection

db.on("open",()=>{
    console.log("database connected successfully");
})
db.on("error",(err)=>{
    console.log("error in connecting db",err)
})

module.exports=db