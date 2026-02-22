import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()

export async function connect() {
    try{
        await mongoose.connect(process.env.MONGO_URI as string)// uri always available
        const connection = mongoose.connection;
        connection.on('connected',()=>{
            console.log("mongo db connected ",connection.host)
        })
        

    }catch(error){
        console.log("erro in dbconfig");
        console.log("error ", error);
    }
    
}