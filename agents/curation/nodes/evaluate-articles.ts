import type { CurationStateType, ArticleEvaluation, SourceArticle } from '../state'
import { getAnthropicClient } from '@/agents/shared/llm/anthropic'
import { z } from 'zod'

const EvaluationResultSchema = z.object({
  evaluations: z.array(z.object({
    article_id: z.number(),
    accepted: z.boolean(),
    relevance_score: z.number().min(0).max(1),
    selection_reason: z.string(),
  })),
})

export async function evaluateArticles(state: CurationStateType): Promise<Partial<CurationStateType>> {
  if (!state.agentSettings || state.sourceArticles.length === 0) {
    return {
      errors: ['Missing agent settings or no articles to evaluate'],
      shouldContinue: false,
    }
  }

  try {
    const anthropic = getAnthropicClient()
    
    // Prepare article summaries for evaluation
    const articleSummaries = state.sourceArticles.map((article) => ({
      id: article.id,
      title: article.title || 'Untitled',
      content_preview: (article.content || '').slice(0, 500),
    }))

    const evaluationPrompt = `
以下の記事リストを評価し、キュレーション記事に含めるべきかどうかを判断してください。

## 選定基準
${state.agentSettings.selection_prompt}

## 記事リスト
${JSON.stringify(articleSummaries, null, 2)}

## 出力形式
JSON形式で各記事の評価を出力してください：
{
  "evaluations": [
    {
      "article_id": 記事ID,
      "accepted": true/false,
      "relevance_score": 0.0-1.0の関連性スコア,
      "selection_reason": "採択/不採択の理由"
    }
  ]
}
`

    const { data, tokensUsed } = await anthropic.generateStructured(
      evaluationPrompt,
      EvaluationResultSchema,
      state.agentSettings.llm_model,
      'あなたは記事キュレーションの専門家です。与えられた基準に基づいて記事を評価してください。'
    )

    const evaluations: ArticleEvaluation[] = data.evaluations
    const acceptedArticles = state.sourceArticles.filter((article) => {
      const evaluation = evaluations.find((e) => e.article_id === article.id)
      return evaluation?.accepted === true
    })

    return {
      evaluations,
      acceptedArticles,
      articlesAccepted: acceptedArticles.length,
      articlesRejected: evaluations.filter((e) => !e.accepted).length,
      tokensUsed,
    }
  } catch (error) {
    console.error('Evaluate articles error:', error)
    return {
      errors: [`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      shouldContinue: false,
    }
  }
}
