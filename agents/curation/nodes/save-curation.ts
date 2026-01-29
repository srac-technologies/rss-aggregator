import type { CurationStateType } from '../state'
import { getSupabaseClient } from '@/agents/shared/database'

export async function saveCuration(state: CurationStateType): Promise<Partial<CurationStateType>> {
  if (!state.agentSettings || !state.curatedTitle || !state.curatedContent) {
    return {
      errors: ['Missing required data to save curation'],
      shouldContinue: false,
    }
  }

  const supabase = getSupabaseClient()

  try {
    // Insert curated article
    const { data: curatedArticle, error: articleError } = await supabase
      .from('curated_articles')
      .insert({
        magazine_id: state.agentSettings.magazine_id,
        agent_setting_id: state.agentSettings.id,
        title: state.curatedTitle,
        content: state.curatedContent,
        summary: state.curatedSummary,
        status: 'draft',
        llm_tokens_used: state.tokensUsed,
        processing_duration_ms: Date.now() - state.startTime,
      })
      .select()
      .single()

    if (articleError || !curatedArticle) {
      return {
        errors: [`Failed to save curated article: ${articleError?.message || 'Unknown error'}`],
        shouldContinue: false,
      }
    }

    // Link source articles
    const sourceLinks = state.acceptedArticles.map((article) => {
      const evaluation = state.evaluations.find((e) => e.article_id === article.id)
      return {
        curated_article_id: curatedArticle.id,
        news_id: article.id,
        relevance_score: evaluation?.relevance_score || 0,
        selection_reason: evaluation?.selection_reason || '',
      }
    })

    if (sourceLinks.length > 0) {
      const { error: linksError } = await supabase
        .from('curated_article_sources')
        .insert(sourceLinks)

      if (linksError) {
        console.error('Failed to link source articles:', linksError)
        // Don't fail the whole process for this
      }
    }

    return {
      curatedArticleId: curatedArticle.id,
    }
  } catch (error) {
    console.error('Save curation error:', error)
    return {
      errors: [`Save curation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      shouldContinue: false,
    }
  }
}
