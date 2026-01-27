import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// 1x1 transparent PNG pixel
const TRACKING_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ newsletterId: string }> }
) {
  try {
    const { newsletterId } = await params

    // Update newsletter_sends record
    const { data: newsletter, error: fetchError } = await supabaseAdmin
      .from('newsletter_sends')
      .select('id, view_count, viewed_at')
      .eq('id', newsletterId)
      .single()

    if (!fetchError && newsletter) {
      const updates: any = {
        view_count: (newsletter.view_count || 0) + 1,
      }

      // Set viewed_at only on first view
      if (!newsletter.viewed_at) {
        updates.viewed_at = new Date().toISOString()
        updates.status = 'viewed'
      }

      await supabaseAdmin.from('newsletter_sends').update(updates).eq('id', newsletterId)
    }

    // Return 1x1 transparent pixel
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': TRACKING_PIXEL.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Tracking error:', error)
    // Always return pixel even on error
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': TRACKING_PIXEL.length.toString(),
      },
    })
  }
}
