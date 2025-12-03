import { NextRequest, NextResponse } from 'next/server'
import { generateDMResponse } from '@/lib/ai/dm-generator'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { message, studioContext } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    const response = await generateDMResponse(message, studioContext)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating DM response:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
