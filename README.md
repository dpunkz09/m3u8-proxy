# M3U8 Proxy Server

A lightweight Node.js/Express proxy server for M3U8 streaming URLs that bypasses CORS issues and rewrites streaming URLs.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/git/external)

## Features

- ✅ **CORS Bypass** - Proxy CORS-blocked M3U8 files
- ✅ **URL Rewriting** - Automatically rewrites relative and absolute URLs in M3U8 content
- ✅ **Recursive Proxying** - Handles nested M3U8 files (variant streams, index files)
- ✅ **Segment Proxying** - Can proxy video segments (.ts, .m4s files)
- ✅ **Simple API** - Single endpoint with URL parameter

## Installation

```bash
npm install
```

## Usage

### Start the server

```bash
npm start
```

The server will run on `http://localhost:8080` by default.

### Proxy an M3U8 file

```
http://localhost:8080/proxy?url={m3u8_url}
```

**Example:**
```
http://localhost:8080/proxy?url=https://example.com/playlist.m3u8
```

### URL Parameters

- `url` (required) - The full URL of the M3U8 file to proxy

### Response

- **M3U8 files** - Returns with rewritten URLs pointing back through the proxy
- **Media files** - Returns the raw file (segments, etc.)
- **Errors** - Returns JSON error responses

## How It Works

1. **Request received** - User requests `http://localhost:8080/proxy?url=https://example.com/stream.m3u8`
2. **Fetch M3U8** - Server fetches the M3U8 file from the provided URL
3. **Parse Content** - Identifies M3U8 playlists vs. media files
4. **Rewrite URLs** - Converts all URLs (relative and absolute) to go through the proxy
5. **Set CORS Headers** - Adds CORS headers to the response
6. **Return Content** - Returns the modified M3U8 or the raw media file

### URL Rewriting Examples

Original M3U8:
```
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=2332661
/playlist/index.m3u8

#EXTINF:5.005,
https://cdn.example.com/segment-1.ts
```

Rewritten by proxy:
```
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=2332661
http://localhost:8080/proxy?url=https://example.com/playlist/index.m3u8

#EXTINF:5.005,
http://localhost:8080/proxy?url=https://cdn.example.com/segment-1.ts
```

## Environment Variables

- `PORT` - Server port (default: 8080)

```bash
PORT=3000 npm start
```

## Use Cases

1. **Bypass CORS** - Stream content blocked by CORS policies
2. **Unified Domain** - Consolidate requests from multiple CDN/servers through one endpoint
3. **URL Rewriting** - Modify streaming URLs for compatibility with players
4. **Security** - Hide actual streaming server URLs from clients

## API Endpoints

### `GET /`
Returns API information and usage examples.

### `GET /health`
Returns server health status.

### `GET /proxy?url=<url>`
Main proxy endpoint. Fetches and proxies M3U8 or media files.

## Error Handling

- **400** - Missing or invalid URL parameter
- **404** - Resource not found on the remote server
- **408** - Request timeout
- **500** - Server error

Error responses are returned as JSON:
```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Limitations

- No caching (each request fetches fresh content)
- No authentication forwarding (credentials must be in the URL)
- Timeouts set to 10 seconds
- No bandwidth throttling

## Security Notes

- Be cautious with URLs that contain authentication tokens
- The proxy will expose the original URLs in the request logs
- Consider implementing IP whitelisting or rate limiting in production

## License

MIT
