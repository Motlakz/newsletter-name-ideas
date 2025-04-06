import { Client, Account, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const database = new Databases(client);

export const COLLECTIONS = {
    USERS: 'users',
    PURCHASES: 'purchases',
    SUBSCRIPTIONS: 'subscriptions',
} as const;

export const DATABASES = {
    MAIN: process.env.APPWRITE_DATABASE_ID!,
} as const;
