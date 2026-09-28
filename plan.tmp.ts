const { planPage } = await import('./server/plan')
const message = process.argv[2]
const t = performance.now()
try {
  const p = await planPage(message, [], 'full', AbortSignal.timeout(170000))
  console.log(
    `${(process.env.LLM_PLAN_MODELS ?? '').padEnd(42)} ${((performance.now() - t) / 1000).toFixed(0)}s | page ${JSON.stringify(p.page)}\n   ${p.sections.map((s) => `${s.id}[${s.uses.join('+')}]`).join(' → ')}\n   "${p.direction.slice(0, 170)}"`,
  )
} catch (e: any) {
  console.log(
    `${(process.env.LLM_PLAN_MODELS ?? '').padEnd(42)} FAILED ${((performance.now() - t) / 1000).toFixed(0)}s: ${String(e.message).slice(0, 90)}`,
  )
}
