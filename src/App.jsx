import { useState } from 'react'
import Header from './components/Header'
import StepConfig from './components/StepConfig'
import StepForm from './components/StepForm'
import StepPreview from './components/StepPreview'
import { getTemplate, getDefaultFormData } from './data/templates'

const STEP_LABELS = {
  en: ['Configure', 'Fill In', 'Preview & Export'],
  ja: ['設定',      '入力',    'プレビュー＆出力'],
}

export default function App() {
  const [lang, setLang]       = useState('en')
  const [step, setStep]       = useState(1)
  const [config, setConfig]   = useState({ type: 'microservice', version: 'simple' })
  const [formData, setFormData] = useState(null)

  const templateId = `${config.type}-${config.version === 'simple' ? 'simple' : ''}`
    .replace(/-$/, '')
  const template = getTemplate(
    config.version === 'simple' ? `${config.type}-simple` : config.type
  )

  function handleConfigNext() {
    const tpl = getTemplate(config.version === 'simple' ? `${config.type}-simple` : config.type)
    setFormData(getDefaultFormData(tpl))
    setStep(2)
  }

  function handleFormNext() {
    setStep(3)
  }

  function handleBackToConfig() {
    setStep(1)
  }

  function handleBackToForm() {
    setStep(2)
  }

  const labels = STEP_LABELS[lang]

  return (
    <div className="app">
      <Header lang={lang} />

      <main className="app-main">
        {/* Step indicator */}
        <nav className="step-indicator" aria-label="steps">
          {[1, 2, 3].map(n => (
            <div key={n} className={`step-dot ${step === n ? 'active' : ''} ${step > n ? 'done' : ''}`}>
              <span className="step-num">{step > n ? '✓' : n}</span>
              <span className="step-label">{labels[n - 1]}</span>
            </div>
          ))}
        </nav>

        {step === 1 && (
          <StepConfig
            lang={lang}
            setLang={setLang}
            config={config}
            setConfig={setConfig}
            onNext={handleConfigNext}
          />
        )}

        {step === 2 && template && formData && (
          <StepForm
            template={template}
            formData={formData}
            setFormData={setFormData}
            lang={lang}
            onBack={handleBackToConfig}
            onNext={handleFormNext}
          />
        )}

        {step === 3 && template && formData && (
          <StepPreview
            template={template}
            formData={formData}
            lang={lang}
            onBack={handleBackToForm}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>
          {lang === 'ja'
            ? 'MIT ライセンス · '
            : 'MIT License · '}
          <a href="https://github.com/kackey621/Design-Docs-Sample" target="_blank" rel="noopener noreferrer">GitHub</a>
        </span>
        <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer" className="footer-netlify">
          This site is powered by Netlify
        </a>
      </footer>
    </div>
  )
}
