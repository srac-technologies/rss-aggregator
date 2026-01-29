import type { CurationStateType } from '../state'
import { getAnthropicClient } from '@/agents/shared/llm/anthropic'
import { z } from 'zod'

const CurationResultSchema = z.object({
  title: z.string(),
  summary: z.string(),
  content: z.string(),
})

export async function generateCuration(state: CurationStateType): Promise<Partial<CurationStateType>> {
  if (!state.agentSettings || state.acceptedArticles.length === 0) {
    return {
      errors: ['No accepted articles to curate'],
      shouldContinue: false,
    }
  }

  try {
    const anthropic = getAnthropicClient()
    
    // Prepare accepted articles for curation
    const articlesForCuration = state.acceptedArticles.map((article) => ({
      id: article.id,
      title: article.title || 'Untitled',
      content: article.content || '',
      url: article.url,
    }))

    // Get selection reasons for context
    const selectionReasons = state.evaluations
      .filter((e) => e.accepted)
      .map((e) => ({
        article_id: e.article_id,
        reason: e.selection_reason,
        relevance_score: e.relevance_score,
      }))

    const curationPrompt = `
以下の採択された記事群をもとに、キュレーション記事を作成してください。

## キュレーション指示
${state.agentSettings.curation_prompt}

## 採択された記事
${JSON.stringify(articlesForCuration, null, 2)}

## 採択理由（参考情報）
${JSON.stringify(selectionReasons, null, 2)}

## 出力形式
JSON形式で以下を出力してください：
{
  "title": "キュレーション記事のタイトル",
  "summary": "記事の要約（200文字程度）",
  "content": "記事本文（Markdown形式、元記事への参照を含む）"
}

## 注意事項
- 元記事の内容を適切に引用・参照してください
- 読者にとって価値のある解説や考察を加えてください
- 元記事のURLがある場合は参照リンクとして含めてください
`

    const { data, tokensUsed } = await anthropic.generateStructured(
      curationPrompt,
      CurationResultSchema,
      state.agentSettings.llm_model,
      'あなたは優秀なテクニカルライターです。複数の記事をまとめ、読者に価値のある解説記事を作成してください。'
    )

    return {
      curatedTitle: data.title,
      curatedSummary: data.summary,
      curatedContent: data.content,
      tokensUsed,
    }
  } catch (error) {
    console.error('Generate curation error:', error)
    return {
      errors: [`Curation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      shouldContinue: false,
    }
  }
}
