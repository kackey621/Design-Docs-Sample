import { TEMPLATES } from '../data/templates'

const UI = {
  en: {
    heading:    'Create a New Design Document',
    langLabel:  'Language',
    typeLabel:  'Document Type',
    verLabel:   'Template Version',
    next:       'Start Writing →',
    typeNames:  { 'microservice': 'Microservice Design', 'clean-architecture': 'Clean Architecture Design' },
    verNames:   { 'simple': 'Simple (recommended for quick docs)', 'full': 'Full (comprehensive)' },
  },
  ja: {
    heading:    '設計書を新規作成',
    langLabel:  '言語',
    typeLabel:  'ドキュメント種別',
    verLabel:   'テンプレートバージョン',
    next:       '入力へ進む →',
    typeNames:  { 'microservice': 'マイクロサービス設計書', 'clean-architecture': 'クリーンアーキテクチャ設計書' },
    verNames:   { 'simple': '簡易版（クイックドキュメント向け）', 'full': '詳細版（包括的な設計書）' },
  },
}

export default function StepConfig({ lang, setLang, config, setConfig, onNext }) {
  const t = UI[lang]

  function handleChange(key, value) {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const selectedTemplate = TEMPLATES.find(
    tpl => tpl.type === config.type && tpl.version === config.version
  )

  return (
    <div className="step-content">
      <h2 className="step-heading">{t.heading}</h2>

      {/* Language */}
      <div className="form-group">
        <label className="form-label">{t.langLabel}</label>
        <div className="radio-group">
          {[['en', 'English'], ['ja', '日本語']].map(([val, lbl]) => (
            <label key={val} className={`radio-card ${lang === val ? 'selected' : ''}`}>
              <input
                type="radio"
                name="lang"
                value={val}
                checked={lang === val}
                onChange={() => setLang(val)}
              />
              <span>{lbl}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Document type */}
      <div className="form-group">
        <label className="form-label">{t.typeLabel}</label>
        <div className="radio-group">
          {['microservice', 'clean-architecture'].map(type => (
            <label key={type} className={`radio-card ${config.type === type ? 'selected' : ''}`}>
              <input
                type="radio"
                name="type"
                value={type}
                checked={config.type === type}
                onChange={() => handleChange('type', type)}
              />
              <span>{t.typeNames[type]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="form-group">
        <label className="form-label">{t.verLabel}</label>
        <div className="radio-group col">
          {['simple', 'full'].map(ver => (
            <label key={ver} className={`radio-card ${config.version === ver ? 'selected' : ''}`}>
              <input
                type="radio"
                name="version"
                value={ver}
                checked={config.version === ver}
                onChange={() => handleChange('version', ver)}
              />
              <span>{t.verNames[ver]}</span>
            </label>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <p className="template-preview-label">
          → <strong>{selectedTemplate.title[lang]}</strong>
          {' · '}
          {lang === 'en'
            ? `${selectedTemplate.sections.length} sections`
            : `${selectedTemplate.sections.length} セクション`}
        </p>
      )}

      <div className="step-actions">
        <button className="btn btn-primary" onClick={onNext}>{t.next}</button>
      </div>
    </div>
  )
}
