import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const subscription = await prisma.subscription.findUnique({
            where: { id: userId },
            select: { status: true }
        })

        const valid = subscription?.status === 'ACTIVE'
        return NextResponse.json({ valid })
        
    } catch (error) {
        return NextResponse.json(
            { error: 'Premium validation failed' },
            { status: 500 }
        )
    }
}
