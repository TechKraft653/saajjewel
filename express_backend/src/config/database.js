   const mongoose = require('mongoose');

   const connectDB = async () => {
     try {
       const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saajjewels_db', {
         useNewUrlParser: true,
         useUnifiedTopology: true,
       });
       
       console.log(`MongoDB Connected: ${conn.connection.host}`);
       return true;
     } catch (error) {
       console.error(`Error: ${error.message}`);
       return false;
     }
   };

   module.exports = connectDB;