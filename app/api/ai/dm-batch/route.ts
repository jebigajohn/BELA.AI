import { NextRequest, NextResponse } from 'next/server'
import { generateMultipleDMResponses } from '@/lib/ai/dm-generator'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { queries, studioContext } = await request.json()

    if (!Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json(
        { error: 'Queries array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (queries.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 queries allowed at once' },
        { status: 400 }
      )
    }

    const responses = await generateMultipleDMResponses(queries, studioContext)

    return NextResponse.json(responses)
  } catch (error) {
    console.error('Error generating multiple DM responses:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate responses',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
