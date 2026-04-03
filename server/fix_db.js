require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(async () => {
    await mongoose.connection.db.collection("foodlistings").updateMany(
        { status: "expired" },
        { 
            $set: { 
                status: "available", 
                expiryAt: new Date(Date.now() + 6 * 60 * 60 * 1000) 
            } 
        }
    );
    console.log("Fixed expired items!");
    process.exit(0);
});