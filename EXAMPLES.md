# M3U8 Proxy - Usage Examples

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Server runs on `http://localhost:8080`

## Example 1: Basic M3U8 Proxying

### Original Request (CORS blocked)
```javascript
fetch('https://example.com/stream.m3u8')
  .then(r => r.text())
  .catch(err => console.error('CORS error!', err));
```

### Using the Proxy
```javascript
const m3u8Url = 'https://example.com/stream.m3u8';
const proxyUrl = `http://localhost:8080/proxy?url=${encodeURIComponent(m3u8Url)}`;

fetch(proxyUrl)
  .then(r => r.text())
  .then(content => console.log(content));
```

## Example 2: With Your M3U8 Structure

Your M3U8 files have this structure:
1. **Main playlist** - Contains stream variants with relative URLs
2. **Index files** - Contain absolute URLs to video segments

### Main Playlist
```
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=682018,...
/Y7Q4ggbna/pl/...index.m3u8
```

### Index Playlist (nested)
```
#EXTM3U
#EXTINF:5.005,
https://remoteconsultinggroup.site/Y7Q4ggbna/content/.../page-0.html
```

### Using with Video Player

**HLS.js Example:**
```html
<video id="video" controls></video>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script>
  const proxyUrl = 'http://localhost:8080/proxy?url=https://original-domain.com/main.m3u8';
  
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(proxyUrl);
    hls.attachMedia(document.getElementById('video'));
  } else if (document.querySelector('video').canPlayType('application/vnd.apple.mpegurl')) {
    document.querySelector('video').src = proxyUrl;
  }
</script>
```

**Video.js Example:**
```html
<video id="video" class="video-js vjs-default-skin" controls preload="auto">
  <source src="http://localhost:8080/proxy?url=https://original-domain.com/main.m3u8" type="application/x-mpegURL" />
</video>
<script>
  videojs('video');
</script>
```

## Example 3: URL Rewriting Process

**Input M3U8:**
```
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=2332661
/Y7Q4ggbna/pl/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4462464
/Y7Q4ggbna/pl/index2.m3u8
```

**Output (from proxy):**
```
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=2332661
http://localhost:8080/proxy?url=https%3A%2F%2Foriginal-domain.com%2FY7Q4ggbna%2Fpl%2Findex.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4462464
http://localhost:8080/proxy?url=https%3A%2F%2Foriginal-domain.com%2FY7Q4ggbna%2Fpl%2Findex2.m3u8
```

## Example 4: With Authentication

If the source requires authentication, include it in the URL:

```javascript
const m3u8Url = 'https://username:password@example.com/stream.m3u8';
const proxyUrl = `http://localhost:8080/proxy?url=${encodeURIComponent(m3u8Url)}`;

fetch(proxyUrl);
```

## Example 5: Testing with cURL

```bash
# Test health
curl http://localhost:8080/health

# Test with real M3U8 URL
curl "http://localhost:8080/proxy?url=https%3A%2F%2Fexample.com%2Fstream.m3u8"

# Save output to file
curl "http://localhost:8080/proxy?url=https%3A%2F%2Fexample.com%2Fstream.m3u8" > output.m3u8
```

## Example 6: Node.js/JavaScript Client

```javascript
const axios = require('axios');

async function proxyM3U8(m3u8Url) {
  try {
    const proxyUrl = `http://localhost:8080/proxy?url=${encodeURIComponent(m3u8Url)}`;
    
    const response = await axios.get(proxyUrl);
    
    console.log('M3U8 Content:');
    console.log(response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Usage
proxyM3U8('https://example.com/main.m3u8');
```

## Example 7: Frontend Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>M3U8 Proxy Test</title>
</head>
<body>
  <h1>M3U8 Proxy Viewer</h1>
  <input type="text" id="urlInput" placeholder="Enter M3U8 URL" size="50" />
  <button onclick="proxyM3U8()">Load</button>
  
  <pre id="output" style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;"></pre>
  
  <script>
    async function proxyM3U8() {
      const url = document.getElementById('urlInput').value;
      if (!url) {
        alert('Please enter an M3U8 URL');
        return;
      }
      
      try {
        const proxyUrl = `http://localhost:8080/proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const content = await response.text();
        
        document.getElementById('output').textContent = content;
      } catch (error) {
        document.getElementById('output').textContent = 'Error: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

## URL Encoding

When passing URLs as query parameters, remember to URL-encode them:

```javascript
// ❌ Wrong
const proxyUrl = `http://localhost:8080/proxy?url=https://example.com/stream.m3u8`;

// ✓ Correct
const m3u8Url = 'https://example.com/stream.m3u8';
const proxyUrl = `http://localhost:8080/proxy?url=${encodeURIComponent(m3u8Url)}`;
```

## Troubleshooting

### "Port 8080 already in use"
```bash
# Use a different port
PORT=3000 npm start
```

### "Request timeout"
- The source M3U8 server may be slow or blocking the request
- Check if the URL is correct and accessible
- Try increasing the timeout in server.js (currently 10 seconds)

### "CORS error from browser"
- This means the proxy isn't properly setting CORS headers
- Verify the server is running and responding to requests
- Check that you're using the correct proxy URL format

### URLs not being rewritten
- Verify the M3U8 file actually contains URLs
- Check if it's a valid M3U8 file (should start with `#EXTM3U`)
- Look at server console for error messages
