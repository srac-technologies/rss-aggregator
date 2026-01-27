import { StateGraph, START, END } from '@langchain/langgraph'
import { NewsCollectorState } from './state'

// Import nodes
import { initializeRun } from './nodes/initialize'
import { fetchSource } from './nodes/fetch-source'
import { collectItemsRss } from './nodes/collect-rss'
import { collectItemsTavily } from './nodes/collect-tavily'
import { checkDuplicate } from './nodes/check-duplicate'
import { insertNews } from './nodes/insert-news'
import { autoTag } from './nodes/auto-tag'
import { applyTags } from './nodes/apply-tags'
import { updateMetrics } from './nodes/update-metrics'
import { finalizeRun } from './nodes/finalize'

// Import edges
import { routeCollector } from './edges/route-collector'
import { shouldProcessItems } from './edges/should-process'
import { afterCheckDuplicate, shouldAutoTag, shouldApplyTags } from './edges/item-processor'

// Build the workflow
const workflow = new StateGraph(NewsCollectorState)
  .addNode('initialize_run', initializeRun)
  .addNode('fetch_source', fetchSource)
  .addNode('collect_items_rss', collectItemsRss)
  .addNode('collect_items_tavily', collectItemsTavily)
  .addNode('check_duplicate', checkDuplicate)
  .addNode('insert_news', insertNews)
  .addNode('auto_tag', autoTag)
  .addNode('apply_tags', applyTags)
  .addNode('update_metrics', updateMetrics)
  .addNode('finalize_run', finalizeRun)
  .addEdge(START, 'initialize_run')
  .addEdge('initialize_run', 'fetch_source')
  .addConditionalEdges('fetch_source', routeCollector)
  .addConditionalEdges('collect_items_rss', shouldProcessItems)
  .addConditionalEdges('collect_items_tavily', shouldProcessItems)
  .addConditionalEdges('check_duplicate', afterCheckDuplicate)
  .addConditionalEdges('insert_news', shouldAutoTag)
  .addConditionalEdges('auto_tag', shouldApplyTags)
  .addEdge('apply_tags', 'check_duplicate')
  .addEdge('update_metrics', 'finalize_run')
  .addEdge('finalize_run', END)

// Compile the graph
export const newsCollectorGraph = workflow.compile()
