export default function WeekPercentDelta({
  delta,
  className = 'CC__stats-bar__delta',
  as: Tag = 'span',
}) {
  if (!delta || delta.pct <= 0) {
    return (
      <Tag className={className} aria-hidden="true">
        &nbsp;
      </Tag>
    )
  }

  return (
    <Tag className={className}>
      ↑ {delta.pct}% past 7 days
    </Tag>
  )
}
