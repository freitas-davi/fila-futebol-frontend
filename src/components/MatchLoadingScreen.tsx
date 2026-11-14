export function MatchLoadingScreen() {
  return (
    <main className="match-loading-screen">
      <div className="match-loading-content" role="status" aria-live="polite">
        <div className="goal-animation" aria-hidden="true">
          <svg className="goal-svg" viewBox="0 0 200 140" fill="none">
            <g className="goal-net">
              <path
                d="M40 30H160V100H40V30Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {[60, 80, 100, 120, 140].map((x) => (
                <line key={x} x1={x} y1="30" x2={x} y2="100" className="net-line" />
              ))}
              {[47, 64, 81].map((y) => (
                <line key={y} x1="40" y1={y} x2="160" y2={y} className="net-line" />
              ))}
            </g>
            <line
              x1="10"
              y1="100"
              x2="190"
              y2="100"
              stroke="currentColor"
              strokeWidth="2"
              opacity=".3"
            />
            <g className="goal-ball">
              <circle r="11" className="ball-body" />
              <path d="M0 -5L5 -1L3 5H-3L-5 -1Z" className="ball-patch" />
            </g>
          </svg>
        </div>
        <p className="match-loading-label">
          Sorteando times<span className="loading-dots" />
        </p>
      </div>
    </main>
  )
}
