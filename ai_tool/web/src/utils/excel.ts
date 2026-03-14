import * as XLSX from 'xlsx'
import type { AmazonCopy, Keyword } from '../types'

/** 下载文案为 Excel 文件 */
export function downloadCopyAsExcel(
  copy: AmazonCopy,
  projectName: string,
  keywords: Keyword[] = []
): void {
  const wb = XLSX.utils.book_new()

  // ===== Sheet 1: Listing 文案 =====
  const bullets = [...copy.bulletPoints]
  while (bullets.length < 5) bullets.push('')

  const listingRows: (string | number)[][] = [
    [`Amazon Listing 文案 · ${projectName}`],
    ['生成时间', new Date().toLocaleString('zh-CN')],
    [],
    ['━━ 产品标题 Title ━━'],
    [copy.title],
    [],
    ['━━ 五点描述 Bullet Points ━━'],
    ['1.', bullets[0]],
    ['2.', bullets[1]],
    ['3.', bullets[2]],
    ['4.', bullets[3]],
    ['5.', bullets[4]],
    [],
    ['━━ 产品描述 Description ━━'],
    [copy.description],
    [],
    ['━━ Search Terms ━━'],
    [copy.searchTerms],
    [],
    ['字符统计'],
    ['标题字符数', copy.title.length],
    ['描述字符数', copy.description.length],
    ['ST 字节数', new Blob([copy.searchTerms]).size],
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(listingRows)
  ws1['!cols'] = [{ wch: 14 }, { wch: 120 }]
  // 首行合并
  ws1['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Listing 文案')

  // ===== Sheet 2: 关键词列表 =====
  if (keywords.length > 0) {
    const kwRows: string[][] = [
      ['关键词', '类型', '是否选用'],
      ...keywords.map(kw => [
        kw.text,
        kw.type === 'keyword' ? '搜索词' : '属性词',
        kw.selected ? '✓' : ''
      ])
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(kwRows)
    ws2['!cols'] = [{ wch: 32 }, { wch: 10 }, { wch: 8 }]
    XLSX.utils.book_append_sheet(wb, ws2, '关键词列表')
  }

  const fileName = `${projectName.replace(/[\\/:*?"<>|]/g, '_')}-Amazon文案.xlsx`
  XLSX.writeFile(wb, fileName)
}

