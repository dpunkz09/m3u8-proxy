const express = require('express');
const axios = require('axios');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * Rewrite URLs in M3U8 content
 * @param {string} content - M3U8 file content
 * @param {string} baseUrl - Base URL to use for relative URLs
 * @param {string} proxyHost - The proxy host (e.g., localhost:8080)
 * @returns {string} - Modified M3U8 content
 */
function rewriteM3U8Content(content, baseUrl, proxyHost) {
  const baseUrlObj = new URL(baseUrl);
  const baseOrigin = baseUrlObj.origin;
  
  const lines = content.split('\n');
  
  const rewrittenLines = lines.map(line => {
    // Skip empty lines and tag lines
    if (!line.trim() || line.startsWith('#')) {
      return line;
    }
    
    // Check if it's a URL (relative or absolute)
    if (line.includes('://')) {
      // Absolute URL - rewrite through proxy
      const encodedUrl = encodeURIComponent(line.trim());
      return `https://${proxyHost}/proxy?url=${encodedUrl}`;
    } else if (line.trim().startsWith('/')) {
      // Relative URL starting with / (absolute path)
      const fullUrl = new URL(line.trim(), baseOrigin).href;
      const encodedUrl = encodeURIComponent(fullUrl);
      return `https://${proxyHost}/proxy?url=${encodedUrl}`;
    } else if (line.trim() && !line.startsWith('#')) {
      // Relative URL (relative path)
      try {
        const fullUrl = new URL(line.trim(), baseUrl).href;
        const encodedUrl = encodeURIComponent(fullUrl);
        return `https://${proxyHost}/proxy?url=${encodedUrl}`;
      } catch (e) {
        return line;
      }
    }
    
    return line;
  });
  
  return rewrittenLines.join('\n');
}

/**
 * Fetch and proxy M3U8 files
 */
app.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }
    
    // Decode the URL if it's encoded
    let targetUrl = url;
    try {
      targetUrl = decodeURIComponent(url);
    } catch (e) {
      // If decoding fails, use the original
    }
    
    // Validate URL
    try {
      new URL(targetUrl);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    
    // Fetch the M3U8 file
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    let content = response.data;
    
    // Check if it's an M3U8 file
    if (content.includes('#EXTM3U') || targetUrl.includes('.m3u8')) {
      // Get the proxy host from request
      const proxyHost = req.get('host');
      
      // Rewrite URLs in the content
      content = rewriteM3U8Content(content, targetUrl, proxyHost);
      
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
    } else {
      // For non-M3U8 files (like .ts segments), determine content type
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
    }
    
    res.send(content);
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Resource not found' });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({ error: 'Request timeout' });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch resource',
        message: error.message 
      });
    }
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * Root endpoint with usage info
 */
app.get('/', (req, res) => {
  res.json({
    name: 'M3U8 Proxy Server',
    usage: 'GET /proxy?url={m3u8_url}',
    example: 'https://localhost:8080/proxy?url=https://example.com/stream.m3u8',
    features: [
      'Bypass CORS issues',
      'Rewrite M3U8 streaming URLs',
      'Recursively proxy nested M3U8 files',
      'Support for relative and absolute URLs'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`M3U8 Proxy server running on https://localhost:${PORT}`);
  console.log(`Usage: https://localhost:${PORT}/proxy?url={m3u8_url}`);
});
