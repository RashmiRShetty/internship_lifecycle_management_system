import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const distDirectory = resolve('dist');
const port = Number(process.env.PORT || 4173);
const mimeTypes = new Map([
  ['.avif', 'image/avif'],
  ['.css', 'text/css; charset=utf-8'],
  ['.eot', 'application/vnd.ms-fontobject'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.ttf', 'font/ttf'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let requestPath;
  try {
    requestPath = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  let filePath = resolve(distDirectory, `.${requestPath}`);
  if (filePath !== distDirectory && !filePath.startsWith(`${distDirectory}${sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    if (!(await stat(filePath)).isFile()) {
      filePath = resolve(distDirectory, 'index.html');
    }
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') {
      throw error;
    }
    if (extname(filePath)) {
      response.writeHead(404).end('Not found');
      return;
    }
    filePath = resolve(distDirectory, 'index.html');
  }

  try {
    const content = await readFile(filePath);
    const isAsset = filePath.startsWith(`${resolve(distDirectory, 'assets')}${sep}`);
    response.writeHead(200, {
      'Content-Type': mimeTypes.get(extname(filePath)) || 'application/octet-stream',
      'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    console.error('Failed to serve frontend file:', error);
    response.writeHead(500).end('Internal server error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend listening on port ${port}`);
});
