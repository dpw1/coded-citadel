/** Resize only when the chart canvas is still mounted (avoids Chart.js ownerDocument errors). */
export function safeChartResize(chart) {
  if (!chart) return

  try {
    const canvas = chart.canvas
    if (!canvas?.ownerDocument || !canvas.isConnected) return
    chart.resize()
  } catch {
    // Chart was destroyed or detached between checks and resize.
  }
}

export function bindChartResize(charts) {
  const list = Array.isArray(charts) ? charts : [charts]
  const onResize = () => list.forEach(safeChartResize)

  window.addEventListener('resize', onResize)
  const rafId = requestAnimationFrame(onResize)

  return () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
  }
}
