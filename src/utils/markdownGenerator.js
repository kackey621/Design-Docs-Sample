// Generates Markdown from template definition + form data

function tableToMarkdown(columns, rows, lang) {
  if (!rows || rows.length === 0) return ''
  const header = '| ' + columns.map(c => c.label[lang]).join(' | ') + ' |'
  const sep    = '|' + columns.map(() => '------').join('|') + '|'
  const body   = rows
    .map(row => '| ' + columns.map(c => (row[c.key] || '').replace(/\n/g, ' ') || '—').join(' | ') + ' |')
    .join('\n')
  return [header, sep, body].join('\n')
}

function getStatusLabel(template, value, lang) {
  const field = template.metaFields.find(f => f.id === 'status')
  if (!field) return value
  const option = field.options.find(o => o.en === value || o.ja === value)
  return option ? option[lang] : value
}

export function generateMarkdown(template, formData, lang) {
  const lines = []

  // Title
  lines.push(`# ${template.title[lang]}`)
  lines.push('')

  // Metadata table
  const nameField = template.metaFields[0].label[lang]
  const metaLabel = lang === 'ja' ? '項目' : 'Field'
  const metaValue = lang === 'ja' ? '値'   : 'Value'
  lines.push(`| ${metaLabel} | ${metaValue} |`)
  lines.push('|------|-----|')
  template.metaFields.forEach(f => {
    let val = formData[f.id] || ''
    if (f.type === 'select') val = getStatusLabel(template, val, lang)
    lines.push(`| **${f.label[lang]}** | ${val || `[${f.label[lang]}]`} |`)
  })
  lines.push('')
  lines.push('---')
  lines.push('')

  // Clean Architecture full: inject static Architecture Principles after section 1
  const isCAFull = template.id === 'clean-architecture'

  // Sections
  template.sections.forEach((section, si) => {
    lines.push(`## ${section.title[lang]}`)
    lines.push('')

    // Inject Architecture Principles after section 1 (overview) for Clean Arch Full
    if (isCAFull && section.id === 'ca1') {
      if (lang === 'en') {
        lines.push('### 1.3 Architecture Principles')
        lines.push('This document follows **Clean Architecture** (Robert C. Martin) principles:')
        lines.push('- **Independence of frameworks**: Business logic does not depend on frameworks')
        lines.push('- **Testability**: Business rules can be tested without UI, database, or external services')
        lines.push('- **Independence of UI**: The UI can change without affecting business rules')
        lines.push('- **Independence of database**: Business rules are not bound to a specific database')
        lines.push('- **Independence of external agencies**: Business rules do not depend on external systems')
      } else {
        lines.push('### 1.3 アーキテクチャ原則')
        lines.push('本設計書は**クリーンアーキテクチャ**（Robert C. Martin）の原則に従います：')
        lines.push('- **フレームワーク非依存**: ビジネスロジックはフレームワークに依存しない')
        lines.push('- **テスト容易性**: ビジネスルールはUI、データベース、外部サービスなしでテスト可能')
        lines.push('- **UI非依存**: UIを変更してもビジネスルールに影響しない')
        lines.push('- **データベース非依存**: ビジネスルールは特定のデータベースに縛られない')
        lines.push('- **外部エージェント非依存**: ビジネスルールは外部システムに依存しない')
      }
      lines.push('')
      lines.push('---')
      lines.push('')
    }

    // Inject Layer Architecture after Architecture Principles (between sections 1 and 3)
    if (isCAFull && section.id === 'ca3') {
      if (lang === 'en') {
        lines.push('## 2. Layer Architecture')
        lines.push('')
        lines.push('### 2.1 Architecture Diagram')
        lines.push('')
        lines.push('```')
        lines.push('┌─────────────────────────────────────────────┐')
        lines.push('│  Frameworks & Drivers (Infrastructure)       │')
        lines.push('│  ┌─────────────────────────────────────────┐ │')
        lines.push('│  │  Interface Adapters                      │ │')
        lines.push('│  │  ┌─────────────────────────────────────┐ │ │')
        lines.push('│  │  │  Use Cases (Application)             │ │ │')
        lines.push('│  │  │  ┌─────────────────────────────────┐ │ │ │')
        lines.push('│  │  │  │  Entities (Domain)               │ │ │ │')
        lines.push('│  │  │  └─────────────────────────────────┘ │ │ │')
        lines.push('│  │  └─────────────────────────────────────┘ │ │')
        lines.push('│  └─────────────────────────────────────────┘ │')
        lines.push('└─────────────────────────────────────────────┘')
        lines.push('```')
        lines.push('')
        lines.push('### 2.2 Dependency Rule')
        lines.push('> Source code dependencies must point **inward only**. Nothing in an inner circle can know about anything in an outer circle.')
      } else {
        lines.push('## 2. レイヤーアーキテクチャ')
        lines.push('')
        lines.push('### 2.1 アーキテクチャ図')
        lines.push('')
        lines.push('```')
        lines.push('┌─────────────────────────────────────────────┐')
        lines.push('│  フレームワーク＆ドライバ（インフラストラクチャ）│')
        lines.push('│  ┌─────────────────────────────────────────┐ │')
        lines.push('│  │  インターフェースアダプタ                  │ │')
        lines.push('│  │  ┌─────────────────────────────────────┐ │ │')
        lines.push('│  │  │  ユースケース（アプリケーション）       │ │ │')
        lines.push('│  │  │  ┌─────────────────────────────────┐ │ │ │')
        lines.push('│  │  │  │  エンティティ（ドメイン）           │ │ │ │')
        lines.push('│  │  │  └─────────────────────────────────┘ │ │ │')
        lines.push('│  │  └─────────────────────────────────────┘ │ │')
        lines.push('│  └─────────────────────────────────────────┘ │')
        lines.push('└─────────────────────────────────────────────┘')
        lines.push('```')
        lines.push('')
        lines.push('### 2.2 依存性ルール')
        lines.push('> ソースコードの依存性は**内側のみ**を向かなければなりません。内側の円は外側の円について何も知ってはなりません。')
      }
      lines.push('')
      lines.push('---')
      lines.push('')
    }

    // Inject Allowed Dependencies table for ca8
    if (isCAFull && section.id === 'ca8') {
      if (lang === 'en') {
        lines.push('### 8.1 Allowed Dependencies')
        lines.push('')
        lines.push('| Layer | Can Depend On | Must NOT Depend On |')
        lines.push('|-------|--------------|-------------------|')
        lines.push('| Entities | Nothing (pure domain) | Application, Adapters, Infrastructure |')
        lines.push('| Use Cases | Entities | Adapters, Infrastructure |')
        lines.push('| Adapters | Use Cases, Entities | Infrastructure (except through DI) |')
        lines.push('| Infrastructure | All inner layers | — |')
      } else {
        lines.push('### 8.1 依存可能な関係')
        lines.push('')
        lines.push('| 層 | 依存可能 | 依存禁止 |')
        lines.push('|---|---------|---------|')
        lines.push('| エンティティ | なし（純粋ドメイン）| アプリケーション、アダプタ、インフラ |')
        lines.push('| ユースケース | エンティティ | アダプタ、インフラ |')
        lines.push('| アダプタ | ユースケース、エンティティ | インフラ（DI経由を除く）|')
        lines.push('| インフラ | すべての内側の層 | — |')
      }
      lines.push('')
    }

    section.fields.forEach(field => {
      lines.push(`### ${field.title[lang]}`)
      lines.push('')
      const val = formData[field.id]

      if (field.type === 'table') {
        lines.push(tableToMarkdown(field.columns, val, lang))
      } else if (field.type === 'code') {
        lines.push('```')
        lines.push(val || field.placeholder[lang])
        lines.push('```')
      } else {
        lines.push(val || `[${field.placeholder[lang]}]`)
      }
      lines.push('')
    })

    lines.push('---')
    lines.push('')
  })

  return lines.join('\n')
}
