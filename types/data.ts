export interface ServerSavedName {
    id: string
    name: string
    category: string
    userId: string
    createdAt: Date
    updatedAt: Date
}

export interface SavedName {
    id: string;
    name: string;
    category: string;
    description?: string;
    dateAdded: string;
    lastModified: string;
}

export type ActivityType = 'Generated' | 'Favorited' | 'Domain Checked' | 'Social Check' | 'Saved' | 'Edited' | 'Deleted'

export interface SocialHandleCheck {
    twitter: boolean
    instagram: boolean
    facebook: boolean
}

export interface Activity {
    id: string
    type: string
    name: string
    date: string
}
