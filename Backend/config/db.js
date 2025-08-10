import mongoose from "mongoose"

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI, {})
        console.log("MONGODB connected")
    }catch(error){
        console.error("Problem with connection _ error: ", error)
        process.exit(1)
    }
}

export default connectDB;