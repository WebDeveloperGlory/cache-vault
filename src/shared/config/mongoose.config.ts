import mongoose from 'mongoose';
import { config } from './env.config';

export class Database {
    private static instance: Database;

    private constructor() {}

    static getInstance(): Database {
        if (!Database.instance) Database.instance = new Database();
        return Database.instance;
    }

    async connect(): Promise<void> {
        try {
            const uri = config.env === 'test' ? config.database.testUri : config.database.uri;
            await mongoose.connect(uri);
            console.log('✅ MongoDB connected');

            mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
            mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));

            process.on('SIGINT', async () => { await this.disconnect(); process.exit(0); });
        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error);
            process.exit(1);
        }
    }

    async disconnect(): Promise<void> {
        try {
            await mongoose.connection.close();
            console.log('✅ MongoDB connection closed');
        } catch (error) {
            console.error('Error closing MongoDB connection:', error);
        }
    }
}

export const database = Database.getInstance();
