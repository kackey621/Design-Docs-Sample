import { useState, useEffect } from 'react'
import { marked } from 'marked'
import { generateMarkdown } from '../utils/markdownGenerator'
import { generateDocx, downloadBlob } from '../utils/docxGenerator'

const UI = {
  en: {
    back:        '← Back to Form',
    dlMd:        '⬇ Download .md',
    dlDocx:      '⬇ Download .docx',
    dlDocxBusy:  'Generating…',
    tabPreview:  'Preview',
    tabMarkdown: 'Markdown Source',
    heading:     'Preview & Export',
  },
  ja: {
    back:        '← フォームに戻る',
    dlMd:        '⬇ .md をダウンロード',
    dlDocx:      '⬇ .docx をダウンロード',
    dlDocxBusy:  '生成中…',
    tabPreview:  'プレビュー',
    tabMarkdown: 'Markdownソース',
    heading:     'プレビュー＆エクスポート',
  },
}

export default function StepPreview({ template, formData, lang, onBack }) {
  const t = UI[lang]
  const [tab, setTab] = useState('preview')
  const [docxBusy, setDocxBusy] = useState(false)

  const markdown = generateMarkdown(template, formData, lang)

  const nameVal = formData[template.titleField] || 'document'
  const safeName = nameVal.replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase() || 'document'

  function downloadMd() {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    downloadBlob(blob, `${safeName}.md`)
  }

  async function downloadDocxFile() {
    setDocxBusy(true)
    try {
      const blob = await generateDocx(template, formData, lang)
      downloadBlob(blob, `${safeName}.docx`)
    } finally {
      setDocxBusy(false)
    }
  }

  const renderedHtml = marked.parse(markdown)

  return (
    <div className="step-content preview-step">
      <div className="preview-topbar">
        <h2 className="step-heading">{t.heading}</h2>
        <div className="preview-actions">
          <button className="btn btn-secondary" onClick={onBack}>{t.back}</button>
          <button className="btn btn-outline" onClick={downloadMd}>{t.dlMd}</button>
          <button
            className="btn btn-primary"
            onClick={downloadDocxFile}
            disabled={docxBusy}
          >
            {docxBusy ? t.dlDocxBusy : t.dlDocx}
          </button>
        </div>
      </div>

      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === 'preview' ? 'active' : ''}`}
          onClick={() => setTab('preview')}
        >{t.tabPreview}</button>
        <button
          className={`tab-btn ${tab === 'markdown' ? 'active' : ''}`}
          onClick={() => setTab('markdown')}
        >{t.tabMarkdown}</button>
      </div>

      {tab === 'preview' ? (
        <div
          className="markdown-preview"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      ) : (
        <pre className="markdown-source">{markdown}</pre>
      )}
    </div>
  )
}
