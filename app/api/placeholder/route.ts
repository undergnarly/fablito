import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text') || 'Изображение загружается...'
  const width = searchParams.get('width') || '400'
  const height = searchParams.get('height') || '400'

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#F3F4F6"/>
      <rect width="${width}" height="${height}" fill="url(#gradient)" fill-opacity="0.5"/>
      
      <!-- Beautiful book icon -->
      <g transform="translate(${Number(width) / 2 - 50}, ${Number(height) / 2 - 80})">
        <rect x="10" y="40" width="80" height="120" rx="4" fill="#8B5CF6" opacity="0.8"/>
        <rect x="15" y="50" width="70" height="100" rx="2" fill="#A78BFA" opacity="0.9"/>
        <rect x="20" y="60" width="60" height="80" rx="1" fill="#C4B5FD"/>
        
        <!-- Sparkles -->
        <circle cx="0" cy="20" r="3" fill="#FBBF24"/>
        <circle cx="100" cy="30" r="2" fill="#F59E0B"/>
        <circle cx="85" cy="10" r="2" fill="#FCD34D"/>
      </g>
      
      <!-- Text -->
      <text x="${Number(width) / 2}" y="${Number(height) / 2 + 60}" text-anchor="middle" fill="#6B7280" font-family="Arial, sans-serif" font-size="16" font-weight="500">
        ${text.length > 50 ? text.substring(0, 47) + '...' : text}
      </text>
      
      <!-- Gradient definition -->
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:0.1" />
          <stop offset="50%" style="stop-color:#EC4899;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:0.1" />
        </linearGradient>
      </defs>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}

