import { StateGraph, START, END } from '@langchain/langgraph'
import { CurationState } from './state'

// Import nodes
import { initializeRun } from './nodes/initialize'
import { fetchSourceArticles } from './nodes/fetch-articles'
import { evaluateArticles } from './nodes/evaluate-articles'
import { generateCuration } from './nodes/generate-curation'
import { saveCuration } from './nodes/save-curation'
import { finalizeRun } from './nodes/finalize'

// Import edges
import {
  shouldContinueAfterFetch,
  shouldContinueAfterEvaluate,
  shouldContinueAfterGenerate,
} from './edges/should-continue'

// Build the workflow
const workflow = new StateGraph(CurationState)
  .addNode('initialize_run', initializeRun)
  .addNode('fetch_articles', fetchSourceArticles)
  .addNode('evaluate_articles', evaluateArticles)
  .addNode('generate_curation', generateCuration)
  .addNode('save_curation', saveCuration)
  .addNode('finalize_run', finalizeRun)
  .addEdge(START, 'initialize_run')
  .addEdge('initialize_run', 'fetch_articles')
  .addConditionalEdges('fetch_articles', shouldContinueAfterFetch)
  .addConditionalEdges('evaluate_articles', shouldContinueAfterEvaluate)
  .addConditionalEdges('generate_curation', shouldContinueAfterGenerate)
  .addEdge('save_curation', 'finalize_run')
  .addEdge('finalize_run', END)

// Compile the graph
export const curationGraph = workflow.compile()
