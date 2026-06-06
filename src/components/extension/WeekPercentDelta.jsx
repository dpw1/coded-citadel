export default function WeekPercentDelta({
  delta,
  className = 'CC__stats-bar__delta',
  negativeClassName = ' CC__stats-bar__delta--negative',
  as: Tag = 'span',
}) {
  if (!delta) return null
  const negative = delta.pct < 0
  return (
    <Tag className={`${className}${negative ? negativeClassName : ''}`}>
      {negative ? '↓' : '↑'} {Math.abs(delta.pct)}% past 7 days
    </Tag>
  )
}
