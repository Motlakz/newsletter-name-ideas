"use server"

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { account } from '../backend/appwrite';
import { PlanId, Plans, PurchaseResult } from '@/types/billing';

/**
 * Server action to purchase a plan
 * @param planId The ID of the plan being purchased
 * @param isAnnual Whether the purchase is for an annual subscription
 */
export async function purchasePlan(planId: PlanId, isAnnual: boolean = false): Promise<PurchaseResult> {
  try {
    
    // Get user session from cookies
    const sessionId = (await cookies()).get('appwrite_session')?.value;
    if (!sessionId) {
      return {
        success: false,
        message: 'User not authenticated',
        planId,
        error: 'No session found'
      };
    }
    
    // Get current user
    const currentUser = await account.get();
    const userId = currentUser.$id;
    
    if (!userId) {
      return {
        success: false,
        message: 'Failed to retrieve user',
        planId,
        error: 'User ID not found'
      };
    }
    
    // Get plan details
    const plan = Plans.find(p => p.id === planId);
    if (!plan) {
      return {
        success: false,
        message: 'Invalid plan',
        planId,
        error: 'Plan not found'
      };
    }
    
    // Calculate expiration date for subscription plans
    let expiresAt: Date | undefined = undefined;
    if (plan.durationMonths) {
      expiresAt = new Date();
      // For annual plans, multiply the duration by 12
      const months = isAnnual ? 12 : plan.durationMonths;
      expiresAt.setMonth(expiresAt.getMonth() + months);
    }
    
    // In a real implementation, you would:
    // 1. Update the user's subscription in your database
    // 2. Record the transaction
    // 3. Update any relevant user permissions

    // For example, using a hypothetical database client:
    // await db.users.update({
    //   where: { id: userId },
    //   data: {
    //     planId: planId,
    //     planExpiresAt: expiresAt,
    //     isAnnualBilling: isAnnual
    //   }
    // });
    
    // For this example, we'll just mock the successful update
    console.log(`User ${userId} purchased plan ${planId} (${isAnnual ? 'annual' : 'monthly'})`);
    
    // Revalidate cached data
    revalidatePath('/dashboard');
    revalidatePath('/account');
    
    return {
      success: true,
      message: `Successfully purchased ${plan.name} plan${expiresAt ? ` (expires: ${expiresAt.toLocaleDateString()})` : ''}`,
      planId,
      expiresAt
    };
    
  } catch (error: any) {
    console.error('Error purchasing plan:', error);
    
    return {
      success: false,
      message: 'Failed to process purchase',
      planId,
      error: error.message || 'Unknown error'
    };
  }
}
