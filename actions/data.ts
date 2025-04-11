"use server"

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { auth, currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { ActivityType, SocialHandleCheck } from '@/types/data'
import { SubscriptionStatus } from '@prisma/client'

const nameSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
})

class ActionError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
    this.name = 'ActionError'
  }
}

/**
 * Check if user has an active subscription
 */
async function checkSubscription(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE' as SubscriptionStatus,
      currentPeriodEnd: {
        gt: new Date(),
      },
    },
  });

  return !!subscription;
}

/**
 * Ensure user exists and has subscription
 */
async function ensureSubscribedUser() {
  const { userId } = await auth()
  if (!userId) throw new ActionError('Unauthorized', 401)

  // Check if user has subscription first
  const hasSubscription = await checkSubscription(userId)
  if (!hasSubscription) {
    throw new ActionError('Subscription required', 403)
  }

  const user = await currentUser()
  if (!user?.emailAddresses?.[0]?.emailAddress) {
    throw new ActionError('User email not found', 400)
  }

  try {
    // Try to find the user first
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    // If user doesn't exist, create them since they have a subscription
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: userId,
          email: user.emailAddresses[0].emailAddress,
        }
      })
    }

    return userId
  } catch (error) {
    console.error('Error ensuring user exists:', error)
    throw new ActionError('Failed to ensure user exists')
  }
}

/**
 * Track user activity
 */
export async function trackActivity(type: ActivityType, name: string) {
  const userId = await ensureSubscribedUser()

  try {
    // Check for duplicate activity within the last minute
    const recentActivity = await prisma.activity.findFirst({
      where: {
        userId,
        type,
        name,
        createdAt: {
          gt: new Date(Date.now() - 60000) // Last minute
        }
      }
    })

    if (!recentActivity) {
      await prisma.activity.create({
        data: {
          type,
          name,
          userId,
          date: new Date().toISOString(),
        }
      })
      revalidatePath('/dashboard')
    }
  } catch (error) {
    console.error('Error tracking activity:', error)
    throw new ActionError('Failed to track activity')
  }
}

/**
 * Save a favorite name
 */
export async function saveFavoriteName(data: { 
  name: string; 
  category: string; 
  description?: string; 
}) {
  const userId = await ensureSubscribedUser()

  try {
    const validated = nameSchema.parse(data)

    // Check if name already exists for this user
    const existing = await prisma.savedName.findFirst({
      where: {
        userId,
        name: validated.name,
      }
    })

    if (existing) {
      throw new ActionError('Name already saved')
    }

    // Create the data object explicitly
    const createData = {
      name: validated.name,
      category: validated.category,
      userId,
      ...(validated.description ? { description: validated.description } : {})
    }

    // Save the name
    const savedName = await prisma.savedName.create({
      data: createData
    })

    await trackActivity('Favorited', validated.name)
    revalidatePath('/dashboard')
    return { success: true, data: savedName }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ActionError(error.errors[0].message)
    }
    if (error instanceof ActionError) {
      throw error
    }
    console.error('Error saving favorite:', error)
    throw new ActionError('Failed to save favorite')
  }
}

/**
 * Edit a saved name
 */
export async function editSavedName(id: string, data: { name: string; category: string }) {
  const userId = await ensureSubscribedUser()

  try {
    // Validate input
    const validated = nameSchema.parse(data)

    // Check if name exists and belongs to user
    const existing = await prisma.savedName.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new ActionError('Name not found')
    }

    if (existing.userId !== userId) {
      throw new ActionError('Unauthorized', 401)
    }

    // Update the name
    const updatedName = await prisma.savedName.update({
      where: { id },
      data: validated
    })

    await trackActivity('Edited', validated.name)
    revalidatePath('/dashboard')
    return { success: true, data: updatedName }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ActionError(error.errors[0].message)
    }
    if (error instanceof ActionError) {
      throw error
    }
    console.error('Error editing name:', error)
    throw new ActionError('Failed to edit name')
  }
}

/**
 * Delete a saved name
 */
export async function deleteSavedName(id: string) {
  const userId = await ensureSubscribedUser()

  try {
    // Check if name exists and belongs to user
    const existing = await prisma.savedName.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new ActionError('Name not found')
    }

    if (existing.userId !== userId) {
      throw new ActionError('Unauthorized', 401)
    }

    // Delete the name
    await prisma.savedName.delete({
      where: { id }
    })

    await trackActivity('Deleted', existing.name)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    if (error instanceof ActionError) {
      throw error
    }
    console.error('Error deleting name:', error)
    throw new ActionError('Failed to delete name')
  }
}

/**
 * Store social media check results
 */
export async function storeSocialCheck(name: string, results: SocialHandleCheck) {
  const userId = await ensureSubscribedUser()

  try {
    // Create or update social check
    await prisma.socialCheck.upsert({
      where: {
        userId_name: {
          userId,
          name,
        }
      },
      update: results,
      create: {
        ...results,
        name,
        userId,
      }
    })

    await trackActivity('Social Check', name)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error storing social check:', error)
    throw new ActionError('Failed to store social check results')
  }
}

/**
 * Get user's dashboard data
 */
export async function getDashboardData() {
  const { userId } = await auth()
  if (!userId) throw new ActionError('Unauthorized', 401)

  try {
    // Check subscription status
    const hasSubscription = await checkSubscription(userId)

    // If not subscribed, return empty data
    if (!hasSubscription) {
      return {
        success: true,
        data: {
          totalGenerated: 0,
          savedNames: [],
          categories: {},
          recentActivity: [],
          socialChecks: {},
          subscribed: false
        }
      }
    }

    // Fetch all required data in parallel
    const [savedNames, activities, socialChecks] = await Promise.all([
      prisma.savedName.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.socialCheck.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Calculate analytics
    const categories = savedNames.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      success: true,
      data: {
        totalGenerated: savedNames.length,
        savedNames,
        categories,
        recentActivity: activities,
        socialChecks: socialChecks.reduce((acc, check) => {
          acc[check.name] = {
            twitter: check.twitter,
            instagram: check.instagram,
            facebook: check.facebook
          }
          return acc
        }, {} as Record<string, SocialHandleCheck>),
        subscribed: true
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw new ActionError('Failed to fetch dashboard data')
  }
}

/**
 * Search saved names
 */
export async function searchSavedNames(searchTerm: string) {
  const userId = await ensureSubscribedUser()

  try {
    const names = await prisma.savedName.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: names }
  } catch (error) {
    console.error('Error searching names:', error)
    throw new ActionError('Failed to search names')
  }
}

/**
 * Check subscription status
 */
export async function checkSubscriptionStatus(): Promise<{
  subscribed: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) return { subscribed: false, error: 'Unauthorized' };

    const hasSubscription = await checkSubscription(userId);
    return { 
      subscribed: hasSubscription,
      ...(!hasSubscription && { error: 'No active subscription found' })
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { 
      subscribed: false,
      error: error instanceof Error ? error.message : 'Subscription check failed'
    };
  }
}

