// Renders a single field (textarea / code / table) inside the form

function TableEditor({ field, value, lang, onChange }) {
  const rows = Array.isArray(value) ? value : [{}]

  function updateCell(rowIdx, key, cellVal) {
    const next = rows.map((r, i) => i === rowIdx ? { ...r, [key]: cellVal } : r)
    onChange(next)
  }

  function addRow() {
    onChange([...rows, Object.fromEntries(field.columns.map(c => [c.key, '']))])
  }

  function removeRow(idx) {
    if (rows.length <= 1) return
    onChange(rows.filter((_, i) => i !== idx))
  }

  const addLabel = lang === 'ja' ? '+ 行を追加' : '+ Add Row'
  const delLabel = lang === 'ja' ? '削除' : 'Remove'

  return (
    <div className="table-editor">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {field.columns.map(col => (
                <th key={col.key}>{col.label[lang]}</th>
              ))}
              <th className="col-action"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {field.columns.map(col => (
                  <td key={col.key}>
                    <input
                      type="text"
                      value={row[col.key] || ''}
                      placeholder={col.placeholder?.[lang] || ''}
                      onChange={e => updateCell(ri, col.key, e.target.value)}
                    />
                  </td>
                ))}
                <td className="col-action">
                  <button
                    type="button"
                    className="btn-remove-row"
                    onClick={() => removeRow(ri)}
                    disabled={rows.length <= 1}
                    aria-label={delLabel}
                    title={delLabel}
                  >×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn-add-row" onClick={addRow}>{addLabel}</button>
    </div>
  )
}

export default function SectionField({ field, value, lang, onChange }) {
  if (field.type === 'table') {
    return (
      <div className="field-block">
        <label className="field-label">{field.title[lang]}</label>
        <TableEditor field={field} value={value} lang={lang} onChange={onChange} />
      </div>
    )
  }

  if (field.type === 'code') {
    return (
      <div className="field-block">
        <label className="field-label">{field.title[lang]}</label>
        <textarea
          className="field-textarea code-textarea"
          value={value || ''}
          placeholder={field.placeholder?.[lang] || ''}
          onChange={e => onChange(e.target.value)}
          rows={8}
          spellCheck={false}
        />
      </div>
    )
  }

  // default: textarea
  return (
    <div className="field-block">
      <label className="field-label">{field.title[lang]}</label>
      <textarea
        className="field-textarea"
        value={value || ''}
        placeholder={field.placeholder?.[lang] || ''}
        onChange={e => onChange(e.target.value)}
        rows={4}
      />
    </div>
  )
}
