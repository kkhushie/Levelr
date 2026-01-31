import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export const connectDB = async () => {
    try {
        // Use supplied URI or fallback

        const connString = process.env.MONGODB_URI;
        await mongoose.connect(connString);
        console.log('✅ MongoDB Connected Correctly');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};
