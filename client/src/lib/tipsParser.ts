/**
 * Utilities to extract tips arrays from LLM output.
 */
export function parseTipsFromLlm(output: string): { content: string }[] | null {
  try {
    try {
      const wrapper = JSON.parse(output)
      const candidates = [
        wrapper.response,
        wrapper.text,
        wrapper.output?.[0]?.content,
        wrapper.result?.content,
        wrapper.choices?.[0]?.message?.content,
        wrapper.choices?.[0]?.text,
      ]
      for (const c of candidates) {
        if (!c || typeof c !== 'string') continue
        const trimmed = c.trim()
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) return parsed.map((t: any) => ({ content: String(t.content || t) })).slice(0, 5)
          } catch (err) {}
        }

        const arrMatch = String(c).match(/\[[\s\S]*\]/)
        if (arrMatch) {
          try {
            const parsed = JSON.parse(arrMatch[0])
            if (Array.isArray(parsed)) return parsed.map((t: any) => ({ content: String(t.content || t) })).slice(0, 5)
          } catch (err) {}
        }
      }
    } catch (err) {
      // not a JSON wrapper — continue to raw extraction
    }

    const jsonMatch = output.match(/\[[\s\S]*?\]/)
    if (jsonMatch) {
      let arrText = jsonMatch[0]
      arrText = arrText.replace(/\\"/g, '"')
      const parsed = JSON.parse(arrText)
      if (Array.isArray(parsed)) return parsed.map((t: any) => ({ content: String(t.content || t) })).slice(0, 5)
    }

    return null
  } catch (err) {
    console.warn('⚠️ Failed to parse tips from LLM output:', err)
    return null
  }
}
