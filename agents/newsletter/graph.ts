import { StateGraph, START, END } from '@langchain/langgraph'
import { NewsletterState } from './state'

// Import nodes
import { fetchSettings } from './nodes/fetch-settings'
import { fetchNews } from './nodes/fetch-news'
import { filterNews } from './nodes/filter-news'
import { generateSummary } from './nodes/generate-summary'
import { createNewsletter } from './nodes/create-newsletter'
import { renderEmail } from './nodes/render-email'
import { sendEmail } from './nodes/send-email'
import { updateNewsletter } from './nodes/update-newsletter'

// Import edges
import { hasNews } from './edges/has-news'
import { hasAcceptedNews } from './edges/has-accepted-news'

// Build the workflow
const workflow = new StateGraph(NewsletterState)

// Add all nodes
workflow.addNode('fetch_settings', fetchSettings)
workflow.addNode('fetch_news', fetchNews)
workflow.addNode('filter_news', filterNews)
workflow.addNode('generate_summary', generateSummary)
workflow.addNode('create_newsletter', createNewsletter)
workflow.addNode('render_email', renderEmail)
workflow.addNode('send_email', sendEmail)
workflow.addNode('update_newsletter', updateNewsletter)

// Add edges
workflow.addEdge(START, 'fetch_settings' as any)
workflow.addEdge('fetch_settings' as any, 'fetch_news' as any)

// After fetching news, check if there are any
workflow.addConditionalEdges('fetch_news' as any, hasNews)

// After filtering news, check if any accepted
workflow.addConditionalEdges('filter_news' as any, hasAcceptedNews)

// Linear flow after summary generation
workflow.addEdge('generate_summary' as any, 'create_newsletter' as any)
workflow.addEdge('create_newsletter' as any, 'render_email' as any)
workflow.addEdge('render_email' as any, 'send_email' as any)
workflow.addEdge('send_email' as any, 'update_newsletter' as any)

// End workflow
workflow.addEdge('update_newsletter' as any, END)

// Compile the graph
export const newsletterGraph = workflow.compile()
