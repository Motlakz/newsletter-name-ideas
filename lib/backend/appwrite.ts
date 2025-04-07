import { Account, Client, Databases } from 'appwrite';

// Constants for collections and databases
export const DATABASES = {
    MAIN: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
} as const;

export const COLLECTIONS = {
    USERS: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
    SUBSCRIPTIONS: process.env.NEXT_PUBLIC_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID!,
    PURCHASES: process.env.NEXT_PUBLIC_APPWRITE_PURCHASES_COLLECTION_ID!,
} as const;

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const database = new Databases(client);
export const account = new Account(client);
