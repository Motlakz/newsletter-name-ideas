import { Account, Client, Databases, ID } from 'appwrite';

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

// Auth Functions
export async function createUserAccount(email: string, password: string, name: string, role: 'user' | 'admin') {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            name
        );

        if (!newAccount) throw Error;

        // Return the user information directly
        return {
            userId: newAccount.$id,
            email: newAccount.email,
            name: newAccount.name,
            is2FAEnabled: false,
            role: role, // Role can be managed in your application logic
            createdAt: new Date(),
            updatedAt: new Date()
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function signInAccount(email: string, password: string) {
    try {
        // Step 1: Create a session for the user
        const session = await account.createEmailPasswordSession(email, password);

        // Step 2: Fetch user details from the account service
        const userDetails = await account.get();

        // Return user information directly from the session and user details
        return {
            userId: session.$id,
            email: userDetails.email,
            name: userDetails.name || '',
            is2FAEnabled: false,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function sendMagicLink(email: string, redirectUrl: string, name?: string, expire?: boolean) {
    try {
        // Send a magic link to the user's email
        const response = await account.createMagicURLToken(email, redirectUrl, name, expire);
        console.log(`Magic link sent to ${email}:`, response);
    } catch (error) {
        console.error('Error sending magic link:', error);
        throw error;
    }
}

export async function sendEmailOTP(email: string) {
    try {
        // Send an OTP to the user's email
        const response = await account.createVerification(email);
        console.log(`OTP sent to ${email}:`, response);
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) throw Error;

        // Return user information directly from the account
        return {
            userId: currentAccount.$id,
            email: currentAccount.email,
            name: currentAccount.name,
            is2FAEnabled: false,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function signOutAccount() {
    try {
        return await account.deleteSession('current');
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function deleteAccount(userId: string): Promise<void> {
    try {
        await account.deleteIdentity(userId);
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
}
