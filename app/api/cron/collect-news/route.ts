import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { runNewsCollector } from '@/agents/news-collector'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query active sources due for collection
    const { data: sources, error: sourcesError } = await supabaseAdmin
      .from('news_collection_sources')
      .select('*')
      .eq('is_active', true)
      .or('next_collection_at.is.null,next_collection_at.lte.' + new Date().toISOString())
      .limit(10) // Process max 10 sources per cron run

    if (sourcesError) {
      console.error('Failed to fetch sources:', sourcesError)
      return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
    }

    if (!sources || sources.length === 0) {
      return NextResponse.json({
        message: 'No sources due for collection',
        sourcesProcessed: 0,
      })
    }

    const results = []

    // Process each source
    for (const source of sources) {
      try {
        const result = await runNewsCollector(source.id)
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          success: true,
          ...result,
        })

        // Calculate and update next collection time
        const nextCollectionAt = calculateNextCollectionTime(source.collection_frequency)
        await supabaseAdmin
          .from('news_collection_sources')
          .update({
            next_collection_at: nextCollectionAt,
          })
          .eq('id', source.id)
      } catch (error) {
        console.error(`Failed to collect from source ${source.id}:`, error)
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const totalNew = results.reduce((sum, r) => sum + ((r as any).itemsNew || 0), 0)
    const totalSkipped = results.reduce((sum, r) => sum + ((r as any).itemsSkipped || 0), 0)
    const totalErrors = results.filter((r) => !r.success).length

    return NextResponse.json({
      message: 'News collection completed',
      sourcesProcessed: sources.length,
      totalNewItems: totalNew,
      totalSkippedItems: totalSkipped,
      totalErrors,
      results,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function calculateNextCollectionTime(frequency: string): string {
  const now = new Date()

  switch (frequency) {
    case 'hourly':
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString()
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    default:
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString()
  }
}
