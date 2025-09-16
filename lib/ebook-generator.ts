/**
 * Электронная книга генератор для экспорта историй в EPUB и PDF форматы
 */

import { StoryContent } from './db'

export interface EbookOptions {
  format: 'epub' | 'pdf' | 'html'
  includeImages: boolean
  includeAudio?: boolean
}

/**
 * Генерирует HTML контент для истории
 */
function generateStoryHTML(story: StoryContent, images: string[] = []): string {
  const pages = story.pages || []
  
  let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${story.title}</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    .story-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .story-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .story-title {
      font-size: 2.5em;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .story-moral {
      font-style: italic;
      margin-top: 15px;
      opacity: 0.9;
    }
    .page {
      padding: 30px;
      border-bottom: 1px solid #eee;
      page-break-inside: avoid;
    }
    .page:last-child {
      border-bottom: none;
    }
    .page-number {
      color: #667eea;
      font-weight: bold;
      font-size: 1.2em;
      margin-bottom: 15px;
    }
    .page-text {
      font-size: 1.1em;
      line-height: 1.8;
      color: #333;
      margin-bottom: 20px;
    }
    .page-image {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }
    @media print {
      body { background: white; }
      .story-container { box-shadow: none; }
      .page { page-break-after: always; }
      .page:last-child { page-break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="story-container">
    <div class="story-header">
      <h1 class="story-title">${story.title}</h1>
      ${story.moral ? `<p class="story-moral">"${story.moral}"</p>` : ''}
    </div>
`

  // Добавляем страницы
  pages.forEach((page, index) => {
    const pageNumber = index + 1
    const pageImage = images[index]
    
    htmlContent += `
    <div class="page">
      <div class="page-number">Страница ${pageNumber}</div>
      <div class="page-text">${page.text}</div>
      ${pageImage ? `<img src="${pageImage}" alt="Иллюстрация к странице ${pageNumber}" class="page-image" />` : ''}
    </div>
`
  })

  htmlContent += `
    <div class="footer">
      <p>Создано с помощью StoryBook AI</p>
      <p>Персонализированная история, созданная специально для вас</p>
    </div>
  </div>
</body>
</html>
`

  return htmlContent
}

/**
 * Создаёт EPUB структуру
 */
function generateEPUBStructure(story: StoryContent, images: string[] = []) {
  const storyHTML = generateStoryHTML(story, images)
  
  // EPUB metadata
  const metadata = {
    title: story.title,
    author: 'StoryBook AI',
    language: 'ru',
    identifier: `storybook-${Date.now()}`,
    date: new Date().toISOString().split('T')[0]
  }

  // OPF файл (Package Document)
  const opfContent = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${metadata.identifier}</dc:identifier>
    <dc:title>${metadata.title}</dc:title>
    <dc:creator>${metadata.author}</dc:creator>
    <dc:language>${metadata.language}</dc:language>
    <dc:date>${metadata.date}</dc:date>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="story" href="story.xhtml" media-type="application/xhtml+xml"/>
    <item id="css" href="styles.css" media-type="text/css"/>
  </manifest>
  <spine>
    <itemref idref="story"/>
  </spine>
</package>`

  // Navigation Document
  const navContent = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Navigation</title>
</head>
<body>
  <nav epub:type="toc">
    <h1>Содержание</h1>
    <ol>
      <li><a href="story.xhtml">${story.title}</a></li>
    </ol>
  </nav>
</body>
</html>`

  // Container.xml
  const containerContent = `<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`

  return {
    'mimetype': 'application/epub+zip',
    'META-INF/container.xml': containerContent,
    'OEBPS/content.opf': opfContent,
    'OEBPS/nav.xhtml': navContent,
    'OEBPS/story.xhtml': storyHTML,
    'OEBPS/styles.css': `
      body { font-family: Georgia, serif; line-height: 1.6; }
      .story-title { font-size: 2em; text-align: center; margin-bottom: 1em; }
      .page { margin-bottom: 2em; page-break-inside: avoid; }
      .page-image { max-width: 100%; height: auto; }
    `
  }
}

/**
 * Экспортирует историю в формат электронной книги
 */
export async function exportStoryAsEbook(
  story: StoryContent, 
  images: string[] = [], 
  options: EbookOptions = { format: 'epub', includeImages: true }
): Promise<string> {
  
  const processedImages = options.includeImages ? images : []
  
  if (options.format === 'epub') {
    // Для EPUB возвращаем JSON структуру файлов
    const epubStructure = generateEPUBStructure(story, processedImages)
    return JSON.stringify(epubStructure, null, 2)
  } 
  else if (options.format === 'pdf' || options.format === 'html') {
    // Для PDF и HTML возвращаем HTML, который можно конвертировать в PDF или отобразить
    return generateStoryHTML(story, processedImages)
  }
  
  throw new Error(`Unsupported format: ${options.format}`)
}

/**
 * Создаёт полный EPUB файл как Blob
 */
export async function createEPUBBlob(story: StoryContent, images: string[] = []): Promise<Blob> {
  // Эта функция потребует библиотеку JSZip для создания .epub файла
  // Для простоты пока возвращаем HTML
  const htmlContent = generateStoryHTML(story, images)
  return new Blob([htmlContent], { type: 'text/html' })
}

/**
 * Создаёт PDF используя Puppeteer или jsPDF
 */
export async function createPDFBlob(story: StoryContent, images: string[] = []): Promise<Blob> {
  const htmlContent = generateStoryHTML(story, images)
  
  // В будущем можно интегрировать с jsPDF или Puppeteer
  // Пока возвращаем HTML
  return new Blob([htmlContent], { type: 'text/html' })
}

/**
 * Вспомогательная функция для скачивания файла
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
