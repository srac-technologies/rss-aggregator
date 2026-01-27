# Newsletter Workflow

LangGraph-based workflow for processing and sending newsletters with LLM-powered filtering and summarization.

## Overview

This workflow handles the complete newsletter pipeline:
1. Fetches newsletter configuration
2. Retrieves available news items
3. Filters news with LLM based on user criteria
4. Generates summary with LLM
5. Renders email template
6. Sends via Resend
7. Updates delivery status

## State Schema

```typescript
interface NewsletterState {
  // Input
  subscriptionId: string

  // Configuration
  settings: NewsletterSettings | null

  // News data
  availableNews: NewsItemForFilter[]
  acceptedNewsIds: number[]
  rejectedNewsIds: number[]

  // LLM processing
  filterTokensUsed: number
  summaryTokensUsed: number
  totalTokensUsed: number

  // Content
  summaryHtml: string
  emailHtml: string

  // Newsletter record
  newsletterId: number | null
  startTime: number
  processingDuration: number

  // Email delivery
  emailProviderId: string | null

  // Control
  error: string | null
  status: 'pending' | 'processing' | 'sent' | 'failed'
}
```

## Graph Flow

```
START → fetch_settings → fetch_news → [has_news?]
                                        ↓
                          filter_news → [has_accepted_news?]
                                        ↓
                          generate_summary
                                        ↓
                          create_newsletter
                                        ↓
                          render_email
                                        ↓
                          send_email
                                        ↓
                          update_newsletter → END
```

## Nodes

### fetch_settings
Loads newsletter configuration from the database.

### fetch_news
Retrieves available news items from the rss_feed view (max 50).

### filter_news
Uses LLM to filter news based on user-defined criteria.

### generate_summary
Uses LLM to generate newsletter content from accepted news items.

### create_newsletter
Creates a newsletter_sends record in the database.

### render_email
Renders the React email template with summary and news items.

### send_email
Sends the email via Resend API.

### update_newsletter
Updates the newsletter record with final status and email provider ID.

## Conditional Edges

### hasNews
Checks if any news items are available. Exits early if none found.

### hasAcceptedNews
Checks if any news passed the LLM filter. Exits early if none accepted.

## Tools

### email-renderer.ts
Renders React email templates using `@react-email/components`.

### resend-client.ts
Client for Resend API to send emails with tracking.

## Usage

```typescript
import { runNewsletter } from '@/agents/newsletter'

const result = await runNewsletter(subscriptionId)

if (result.status === 'sent') {
  console.log(`Newsletter ${result.newsletterId} sent with ${result.newsCount} items`)
} else {
  console.error('Newsletter failed:', result.error)
}
```

## LLM Filtering

The filter node uses structured output with Zod schema:

```typescript
const FilterResultSchema = z.object({
  accepted_news_ids: z.array(z.number()),
  rejected_news_ids: z.array(z.number()),
  reasoning: z.string().optional(),
})
```

The LLM receives:
- User's filter criteria (from settings.filter_prompt)
- List of available news items with ID, title, content preview

Returns:
- Array of accepted news IDs
- Array of rejected news IDs
- Optional reasoning for decisions

## LLM Summarization

The summary node uses text generation:

```typescript
const summaryPrompt = `
Summary Instructions:
${settings.summary_prompt}

News Articles to Summarize:
${newsContent}

Generate the newsletter content.
`
```

The LLM returns HTML-formatted newsletter content.

## Email Template

The workflow uses a React email template at `/emails/newsletter.tsx`:

```typescript
<NewsletterEmail
  summary={summaryHtml}
  newsItems={acceptedNews}
  trackingPixelUrl={trackingUrl}
/>
```

## Tracking

Each newsletter includes a tracking pixel for open tracking:

```
/api/newsletters/track/${newsletterId}
```

When the email is opened, this endpoint updates the `viewed_at` timestamp.

## Error Handling

If any step fails, the workflow:
1. Sets `status` to 'failed'
2. Sets `error` with the error message
3. Updates the newsletter record
4. Exits gracefully

## Scheduling

Newsletters are scheduled by the cron job at `/app/api/cron/send-newsletters/route.ts`:

- **Hourly**: Runs every hour
- **Daily**: Runs at specified send_time
- **Weekly**: Runs on specified day_of_week at send_time

## Database Schema

**newsletter_settings**
- Newsletter configuration per subscription

**newsletter_sends**
- Record of each newsletter sent

**rss_feed** (view)
- Available news items for a subscription
