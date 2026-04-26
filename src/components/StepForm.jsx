import { useState } from 'react'
import SectionField from './SectionField'

const UI = {
  en: { back: '← Back', next: 'Preview →', metadata: 'Document Info' },
  ja: { back: '← 戻る', next: 'プレビューへ →', metadata: 'ドキュメント情報' },
}

export default function StepForm({ template, formData, setFormData, lang, onBack, onNext }) {
  const t = UI[lang]
  const [openSection, setOpenSection] = useState(null)

  function updateField(id, value) {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  function toggleSection(id) {
    setOpenSection(prev => prev === id ? null : id)
  }

  function renderMetaField(f) {
    const val = formData[f.id] || ''

    if (f.type === 'select') {
      return (
        <div key={f.id} className="meta-field">
          <label className="field-label">{f.label[lang]}</label>
          <select
            className="field-select"
            value={val}
            onChange={e => updateField(f.id, e.target.value)}
          >
            {f.options.map(o => (
              <option key={o.en} value={o.en}>{o[lang]}</option>
            ))}
          </select>
        </div>
      )
    }

    if (f.type === 'date') {
      return (
        <div key={f.id} className="meta-field">
          <label className="field-label">{f.label[lang]}</label>
          <input
            type="date"
            className="field-input"
            value={val}
            onChange={e => updateField(f.id, e.target.value)}
          />
        </div>
      )
    }

    return (
      <div key={f.id} className="meta-field">
        <label className="field-label">{f.label[lang]}</label>
        <input
          type="text"
          className="field-input"
          value={val}
          placeholder={f.placeholder?.[lang] || ''}
          onChange={e => updateField(f.id, e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className="step-content">
      <h2 className="step-heading">{template.title[lang]}</h2>

      {/* Metadata */}
      <div className="section-card open">
        <div className="section-header static">
          <span className="section-title">{t.metadata}</span>
        </div>
        <div className="section-body">
          <div className="meta-grid">
            {template.metaFields.map(f => renderMetaField(f))}
          </div>
        </div>
      </div>

      {/* Sections */}
      {template.sections.map(section => {
        const isOpen = openSection === section.id
        return (
          <div key={section.id} className={`section-card ${isOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="section-header"
              onClick={() => toggleSection(section.id)}
              aria-expanded={isOpen}
            >
              <span className="section-title">{section.title[lang]}</span>
              <span className="section-chevron">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <div className="section-body">
                {section.fields.map(field => (
                  <SectionField
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    lang={lang}
                    onChange={val => updateField(field.id, val)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>{t.back}</button>
        <button className="btn btn-primary" onClick={onNext}>{t.next}</button>
      </div>
    </div>
  )
}
