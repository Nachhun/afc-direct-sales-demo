import ExcelJS from 'exceljs'

export interface ExcelColumnDef {
  header: string
  key: string
  width?: number
  isCurrency?: boolean
  isDate?: boolean
  isCenter?: boolean
  isStatusBadge?: boolean
}

export interface StyledExcelOptions {
  title: string
  subtitle?: string
  sheetName?: string
  filename: string
  columns: ExcelColumnDef[]
  data: any[]
}

export async function exportStyledExcel(options: StyledExcelOptions) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'AFC Direct Sales'
  workbook.lastModifiedBy = 'Store AI Analyst'
  workbook.created = new Date()
  workbook.modified = new Date()

  const sheet = workbook.addWorksheet(options.sheetName || 'Stores Report', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 4 }]
  })

  const colCount = options.columns.length

  // 1. Title Row (Row 1)
  sheet.mergeCells(1, 1, 1, colCount)
  const titleCell = sheet.getCell('A1')
  titleCell.value = options.title.toUpperCase()
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF065F46' } // Dark Emerald
  }
  titleCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  sheet.getRow(1).height = 32

  // 2. Subtitle / Metadata Row (Row 2)
  sheet.mergeCells(2, 1, 2, colCount)
  const subCell = sheet.getCell('A2')
  const dateText = new Date().toLocaleString()
  subCell.value = (options.subtitle ? `${options.subtitle} • ` : '') + `Exported on: ${dateText} • Total Records: ${options.data.length}`
  subCell.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FF475569' } }
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' } // Light slate
  }
  subCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  sheet.getRow(2).height = 20

  // Row 3 is a subtle empty spacer
  sheet.getRow(3).height = 8

  // 3. Table Headers (Row 4)
  const headerRow = sheet.getRow(4)
  headerRow.height = 26

  options.columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1)
    cell.value = col.header
    cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF047857' } // Emerald 700
    }
    cell.alignment = { horizontal: col.isCenter || col.isDate ? 'center' : (col.isCurrency ? 'right' : 'left'), vertical: 'middle' }
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF065F46' } },
      bottom: { style: 'medium', color: { argb: 'FF065F46' } },
      left: { style: 'thin', color: { argb: 'FF065F46' } },
      right: { style: 'thin', color: { argb: 'FF065F46' } }
    }
  })

  // 4. Data Rows (Starting Row 5)
  options.data.forEach((item, rIdx) => {
    const rowNumber = rIdx + 5
    const row = sheet.getRow(rowNumber)
    row.height = 22

    const isEven = rIdx % 2 === 1
    const rowBgColor = isEven ? 'FFF8FAFC' : 'FFFFFFFF'

    options.columns.forEach((col, cIdx) => {
      const cell = row.getCell(cIdx + 1)
      let val = item[col.key]

      if (col.isCurrency) {
        val = Number(val || 0)
        cell.numFmt = '$#,##0.00'
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
      } else if (col.isCenter || col.isDate) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' }
      }

      cell.value = val !== undefined && val !== null ? val : ''
      cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1E293B' } }

      // Status Badge Styling
      if (col.isStatusBadge && typeof val === 'string') {
        const v = val.toLowerCase()
        if (v.includes('critical') || v.includes('cancel')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF991B1B' } }
        } else if (v.includes('high') || v.includes('pend')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF92400E' } }
        } else if (v.includes('moderate')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1E40AF' } }
        } else if (v.includes('completed') || v.includes('active')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF166534' } }
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } }
        }
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } }
      }

      // Cell Border
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      }
    })
  })

  // 5. Compute Optimal Column Widths
  options.columns.forEach((col, idx) => {
    let maxLen = col.header.length
    options.data.forEach(row => {
      const val = row[col.key]
      if (val !== undefined && val !== null) {
        const str = String(val)
        if (str.length > maxLen) maxLen = str.length
      }
    })
    const width = col.width ? col.width : Math.max(12, Math.min(maxLen + 4, 45))
    sheet.getColumn(idx + 1).width = width
  })

  // 6. Generate Buffer and Trigger Browser Download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = options.filename.endsWith('.xlsx') ? options.filename : `${options.filename}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
