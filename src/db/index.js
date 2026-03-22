import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
   const connections =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
   console.log(`\n MongoDb is connected !! DB Host: ${connections.connection.host}`)

  } catch (error) {
    console.error("Mongo Db connectin error",error);
    process.exit(1);
  }
}
export default connectDB
