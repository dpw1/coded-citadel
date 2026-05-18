const CORNER_SVG = (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M2 20 L2 4 Q2 2 4 2 L20 2"
      stroke="var(--CC__color-primary)"
      strokeWidth="2"
      strokeLinecap="square"
    />
    <path
      d="M2 24 L7 24"
      stroke="var(--CC__color-primary)"
      strokeWidth="1.25"
      strokeLinecap="square"
      opacity="0.6"
    />
    <path
      d="M24 2 L24 7"
      stroke="var(--CC__color-primary)"
      strokeWidth="1.25"
      strokeLinecap="square"
      opacity="0.6"
    />
    <rect x="4" y="4" width="4" height="4" rx="0.75" fill="var(--CC__color-primary)" />
    <path
      d="M8 9 L2 9"
      stroke="var(--CC__color-primary)"
      strokeWidth="0.75"
      strokeLinecap="square"
      opacity="0.3"
    />
    <path
      d="M9 8 L9 2"
      stroke="var(--CC__color-primary)"
      strokeWidth="0.75"
      strokeLinecap="square"
      opacity="0.3"
    />
    <path
      d="M1 28 L1 26"
      stroke="var(--CC__color-primary)"
      strokeWidth="1"
      strokeLinecap="square"
      opacity="0.25"
    />
    <path
      d="M28 1 L26 1"
      stroke="var(--CC__color-primary)"
      strokeWidth="1"
      strokeLinecap="square"
      opacity="0.25"
    />
  </svg>
)

export default function CyberCorners() {
  return (
    <>
      <div className="CC__cyber-accent__corner CC__cyber-accent__corner--tl" aria-hidden="true">
        {CORNER_SVG}
      </div>
      <div className="CC__cyber-accent__corner CC__cyber-accent__corner--tr" aria-hidden="true">
        {CORNER_SVG}
      </div>
      <div className="CC__cyber-accent__corner CC__cyber-accent__corner--bl" aria-hidden="true">
        {CORNER_SVG}
      </div>
      <div className="CC__cyber-accent__corner CC__cyber-accent__corner--br" aria-hidden="true">
        {CORNER_SVG}
      </div>
    </>
  )
}
