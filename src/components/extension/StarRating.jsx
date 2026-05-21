export default function StarRating({ rating, className = '' }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5

  return (
    <div className={className} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < full
        const isHalf = i === full && half
        return (
          <svg key={i} viewBox="0 0 24 24" aria-hidden="true">
            {filled ? (
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill="#ff9900"
              />
            ) : isHalf ? (
              <>
                <defs>
                  <linearGradient id={`half-star-${i}`}>
                    <stop offset="50%" stopColor="#ff9900" />
                    <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  fill={`url(#half-star-${i})`}
                  stroke="#ff9900"
                  strokeWidth="1"
                />
              </>
            ) : (
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill="none"
                stroke="#ff9900"
                strokeWidth="1.5"
              />
            )}
          </svg>
        )
      })}
    </div>
  )
}
