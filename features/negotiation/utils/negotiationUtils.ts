import { Paragraph, TextRun } from 'docx'

export function markdownToDocxParagraphs(markdown: string) {
  const lines = markdown.split(/\r?\n/)
  const paragraphs: Paragraph[] = []
  let inList = false
  for (const line of lines) {
    if (/^\s*[-*] /.test(line)) {
      if (!inList) inList = true
      paragraphs.push(new Paragraph({ text: line.replace(/^\s*[-*] /, ''), bullet: { level: 0 } }))
    } else if (line.trim() === '') {
      inList = false
      paragraphs.push(new Paragraph(''))
    } else {
      inList = false
      const children: TextRun[] = []
      let rest = line
      while (rest.length > 0) {
        const bold = rest.match(/\*\*(.+?)\*\*/)
        const italic = rest.match(/\*(.+?)\*/)
        if (bold && (!italic || bold.index! < italic.index!)) {
          if (bold.index! > 0) children.push(new TextRun(rest.slice(0, bold.index!)))
          children.push(new TextRun({ text: bold[1], bold: true }))
          rest = rest.slice(bold.index! + bold[0].length)
        } else if (italic) {
          if (italic.index! > 0) children.push(new TextRun(rest.slice(0, italic.index!)))
          children.push(new TextRun({ text: italic[1], italics: true }))
          rest = rest.slice(italic.index! + italic[0].length)
        } else {
          children.push(new TextRun(rest))
          break
        }
      }
      paragraphs.push(new Paragraph({ children }))
    }
  }
  return paragraphs
}
