import mongoose from "mongoose";

const connectDB = async() =>{
    try{
        mongoose.connect(process.env.MONGO_URI, {})
        console.log("MONGODB connection successful");
}catch(err){
    console.log("Error in connection with database || ",err );
    process.exit(1);
}
}

export default connectDB;