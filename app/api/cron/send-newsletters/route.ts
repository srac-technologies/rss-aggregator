import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { runNewsletter } from '@/agents/newsletter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max execution time

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

    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay() // 0 = Sunday, 6 = Saturday
    const currentTime = `${String(currentHour).padStart(2, '0')}:00:00`

    // Query active newsletter settings that should be sent now
    const { data: newsletterSettings, error: settingsError } = await supabaseAdmin
      .from('newsletter_settings')
      .select('*, subscriptions(id)')
      .eq('is_active', true)

    if (settingsError) {
      console.error('Failed to fetch newsletter settings:', settingsError)
      return NextResponse.json({ error: 'Failed to fetch newsletter settings' }, { status: 500 })
    }

    if (!newsletterSettings || newsletterSettings.length === 0) {
      return NextResponse.json({
        message: 'No active newsletters configured',
        newslettersSent: 0,
      })
    }

    // Filter newsletters that should be sent now
    const newslettersToSend = newsletterSettings.filter((settings) => {
      // Check frequency and time
      if (settings.frequency === 'hourly') {
        return true // Send every hour when cron runs
      }

      if (settings.frequency === 'daily') {
        // Check if current hour matches send_time
        const sendHour = settings.send_time ? parseInt(settings.send_time.split(':')[0]) : 9
        return currentHour === sendHour
      }

      if (settings.frequency === 'weekly') {
        // Check if current day and hour match
        const sendHour = settings.send_time ? parseInt(settings.send_time.split(':')[0]) : 9
        return currentDay === settings.send_day_of_week && currentHour === sendHour
      }

      return false
    })

    if (newslettersToSend.length === 0) {
      return NextResponse.json({
        message: 'No newsletters scheduled for this time',
        newslettersSent: 0,
        totalActive: newsletterSettings.length,
      })
    }

    const results = []

    // Process each newsletter
    for (const settings of newslettersToSend) {
      try {
        const result = await runNewsletter(settings.subscription_id)
        results.push({
          subscriptionId: settings.subscription_id,
          recipientEmail: settings.recipient_email,
          success: result.status === 'sent',
          newsletterId: result.newsletterId,
          newsCount: result.newsCount,
          tokensUsed: result.tokensUsed,
          error: result.error,
        })
      } catch (error) {
        console.error(`Failed to send newsletter for subscription ${settings.subscription_id}:`, error)
        results.push({
          subscriptionId: settings.subscription_id,
          recipientEmail: settings.recipient_email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const totalSent = results.filter((r) => r.success).length
    const totalFailed = results.filter((r) => !r.success).length
    const totalNewsItems = results.reduce((sum, r) => sum + (r.newsCount || 0), 0)
    const totalTokens = results.reduce((sum, r) => sum + (r.tokensUsed || 0), 0)

    return NextResponse.json({
      message: 'Newsletter sending completed',
      newslettersSent: totalSent,
      newslettersFailed: totalFailed,
      totalNewsItems,
      totalTokensUsed: totalTokens,
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
