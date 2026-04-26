export default function Header({ lang }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="6" fill="#0066CC"/>
            <path d="M7 8h14M7 14h10M7 20h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="header-title">
            {lang === 'ja' ? '設計書ジェネレーター' : 'Design Doc Generator'}
          </span>
        </div>
        <a
          href="https://www.netlify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="netlify-badge"
          title="This site is powered by Netlify"
        >
          <img
            src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg"
            alt="Powered by Netlify"
            height="20"
          />
        </a>
      </div>
    </header>
  )
}
