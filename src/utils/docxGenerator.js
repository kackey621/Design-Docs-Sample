import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} from 'docx'

const BORDER_NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const CELL_BORDER  = { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' }
const cellBorders  = { top: CELL_BORDER, bottom: CELL_BORDER, left: CELL_BORDER, right: CELL_BORDER }

function makeHeading(text, level) {
  return new Paragraph({ text, heading: level })
}

function makeParagraph(text) {
  if (!text) return new Paragraph({ text: '' })
  return new Paragraph({
    children: text.split('\n').flatMap((line, i, arr) =>
      i < arr.length - 1
        ? [new TextRun(line), new TextRun({ break: 1 })]
        : [new TextRun(line)]
    ),
  })
}

function makeCodeParagraph(text) {
  return new Paragraph({
    children: [new TextRun({ text: text || '', font: 'Courier New', size: 18 })],
    shading: { type: ShadingType.SOLID, color: 'F5F5F5', fill: 'F5F5F5' },
  })
}

function makeTable(columns, rows, lang) {
  const headerRow = new TableRow({
    children: columns.map(col =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: col.label[lang], bold: true })] })],
        borders: cellBorders,
        shading: { type: ShadingType.SOLID, color: 'F0F4FF', fill: 'F0F4FF' },
        width: { size: Math.floor(9000 / columns.length), type: WidthType.DXA },
      })
    ),
    tableHeader: true,
  })

  const dataRows = (rows || []).map(row =>
    new TableRow({
      children: columns.map(col =>
        new TableCell({
          children: [new Paragraph({ text: row[col.key] || '' })],
          borders: cellBorders,
          width: { size: Math.floor(9000 / columns.length), type: WidthType.DXA },
        })
      ),
    })
  )

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 9000, type: WidthType.DXA },
  })
}

function getStatusLabel(template, value, lang) {
  const field = template.metaFields.find(f => f.id === 'status')
  if (!field) return value
  const option = field.options.find(o => o.en === value || o.ja === value)
  return option ? option[lang] : value
}

function metaTable(template, formData, lang) {
  const metaLabel = lang === 'ja' ? '項目' : 'Field'
  const metaValue = lang === 'ja' ? '値'   : 'Value'

  const headerRow = new TableRow({
    children: [metaLabel, metaValue].map(h =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
        borders: cellBorders,
        shading: { type: ShadingType.SOLID, color: 'F0F4FF', fill: 'F0F4FF' },
        width: { size: 4500, type: WidthType.DXA },
      })
    ),
    tableHeader: true,
  })

  const dataRows = template.metaFields.map(f => {
    let val = formData[f.id] || ''
    if (f.type === 'select') val = getStatusLabel(template, val, lang)
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: f.label[lang], bold: true })] })],
          borders: cellBorders,
          width: { size: 4500, type: WidthType.DXA },
        }),
        new TableCell({
          children: [new Paragraph({ text: val })],
          borders: cellBorders,
          width: { size: 4500, type: WidthType.DXA },
        }),
      ],
    })
  })

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 9000, type: WidthType.DXA },
  })
}

export async function generateDocx(template, formData, lang) {
  const children = []

  // Title
  children.push(makeHeading(template.title[lang], HeadingLevel.TITLE))
  children.push(new Paragraph(''))
  children.push(metaTable(template, formData, lang))
  children.push(new Paragraph(''))

  const isCAFull = template.id === 'clean-architecture'

  template.sections.forEach(section => {
    children.push(makeHeading(section.title[lang], HeadingLevel.HEADING_1))

    // Inject static content for Clean Architecture Full
    if (isCAFull && section.id === 'ca1') {
      const h = lang === 'en' ? '1.3 Architecture Principles' : '1.3 アーキテクチャ原則'
      children.push(makeHeading(h, HeadingLevel.HEADING_2))
      const principles = lang === 'en'
        ? ['Independence of frameworks', 'Testability', 'Independence of UI', 'Independence of database', 'Independence of external agencies']
        : ['フレームワーク非依存', 'テスト容易性', 'UI非依存', 'データベース非依存', '外部エージェント非依存']
      principles.forEach(p => children.push(new Paragraph({ text: `• ${p}` })))
      children.push(new Paragraph(''))
    }

    if (isCAFull && section.id === 'ca3') {
      const h1 = lang === 'en' ? '2. Layer Architecture' : '2. レイヤーアーキテクチャ'
      const h2 = lang === 'en' ? '2.2 Dependency Rule' : '2.2 依存性ルール'
      const rule = lang === 'en'
        ? 'Source code dependencies must point inward only.'
        : 'ソースコードの依存性は内側のみを向かなければなりません。'
      children.push(makeHeading(h1, HeadingLevel.HEADING_1))
      children.push(makeHeading(h2, HeadingLevel.HEADING_2))
      children.push(makeParagraph(rule))
      children.push(new Paragraph(''))
    }

    if (isCAFull && section.id === 'ca8') {
      const h = lang === 'en' ? '8.1 Allowed Dependencies' : '8.1 依存可能な関係'
      children.push(makeHeading(h, HeadingLevel.HEADING_2))
      const cols = lang === 'en'
        ? [{ key: 'layer', label: { en: 'Layer', ja: '層' } }, { key: 'can', label: { en: 'Can Depend On', ja: '依存可能' } }, { key: 'cannot', label: { en: 'Must NOT Depend On', ja: '依存禁止' } }]
        : [{ key: 'layer', label: { ja: '層', en: 'Layer' } }, { key: 'can', label: { ja: '依存可能', en: 'Can Depend On' } }, { key: 'cannot', label: { ja: '依存禁止', en: 'Must NOT Depend On' } }]
      const rows = lang === 'en'
        ? [
            { layer: 'Entities', can: 'Nothing (pure domain)', cannot: 'Application, Adapters, Infrastructure' },
            { layer: 'Use Cases', can: 'Entities', cannot: 'Adapters, Infrastructure' },
            { layer: 'Adapters', can: 'Use Cases, Entities', cannot: 'Infrastructure (except DI)' },
            { layer: 'Infrastructure', can: 'All inner layers', cannot: '—' },
          ]
        : [
            { layer: 'エンティティ', can: 'なし（純粋ドメイン）', cannot: 'アプリ、アダプタ、インフラ' },
            { layer: 'ユースケース', can: 'エンティティ', cannot: 'アダプタ、インフラ' },
            { layer: 'アダプタ', can: 'ユースケース、エンティティ', cannot: 'インフラ（DI経由を除く）' },
            { layer: 'インフラ', can: 'すべての内側の層', cannot: '—' },
          ]
      children.push(makeTable(cols, rows, lang))
      children.push(new Paragraph(''))
    }

    section.fields.forEach(field => {
      children.push(makeHeading(field.title[lang], HeadingLevel.HEADING_2))
      const val = formData[field.id]

      if (field.type === 'table') {
        children.push(makeTable(field.columns, val, lang))
      } else if (field.type === 'code') {
        ;(val || field.placeholder[lang]).split('\n').forEach(line => {
          children.push(makeCodeParagraph(line))
        })
      } else {
        children.push(makeParagraph(val || `[${field.placeholder[lang]}]`))
      }
      children.push(new Paragraph(''))
    })
  })

  const doc = new Document({
    sections: [{ children }],
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: { font: 'Noto Sans', size: 22 },
        },
      ],
    },
  })

  return Packer.toBlob(doc)
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
