// Global in-memory cache fallback
const memoryFileCache = new Map<string, string>();

const DB_NAME = 'InternSmartFileStore';
const STORE_NAME = 'files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e: any) => reject(e.target.error);
  });
}

function dataURLtoBlob(dataurl: string): Blob {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Error converting DataURL to Blob:', e);
    return new Blob([], { type: 'application/octet-stream' });
  }
}

export async function saveFileContent(fileName: string, dataUrl: string, scopeKey?: string): Promise<void> {
  if (!fileName || !dataUrl) return;

  const storageKeys = [fileName];
  if (scopeKey) {
    storageKeys.unshift(`${scopeKey}_${fileName}`);
  }

  for (const k of storageKeys) {
    memoryFileCache.set(k, dataUrl);
    (window as any)[`file_data_${k}`] = dataUrl;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const k of storageKeys) {
      store.put(dataUrl, k);
    }
  } catch (err) {
    console.warn('IndexedDB save notice:', err);
  }
}

export async function getFileContent(fileName: string, scopeKey?: string): Promise<string> {
  if (!fileName) return '';

  const cleanName = fileName.trim();
  const lowerName = cleanName.toLowerCase();

  const candidates: string[] = [];
  if (scopeKey) {
    candidates.push(`${scopeKey}_${cleanName}`);
    candidates.push(`${scopeKey.toLowerCase()}_${cleanName}`);
  }
  candidates.push(cleanName);

  // 1. Check memory cache
  for (const k of candidates) {
    if (memoryFileCache.has(k)) {
      return memoryFileCache.get(k)!;
    }
    if ((window as any)[`file_data_${k}`]) {
      return (window as any)[`file_data_${k}`];
    }
  }

  // Scan memory cache keys for matching suffix
  for (const [mk, mval] of memoryFileCache.entries()) {
    if (mk === cleanName || mk.endsWith(`_${cleanName}`) || mk.toLowerCase().endsWith(`_${lowerName}`)) {
      if (mval && mval.startsWith('data:')) return mval;
    }
  }

  // 2. Check localStorage
  for (const k of candidates) {
    try {
      const localVal = localStorage.getItem(`file_data_${k}`);
      if (localVal && localVal.startsWith('data:')) {
        memoryFileCache.set(k, localVal);
        return localVal;
      }
    } catch (e) {}
  }

  // Scan localStorage for matching file_data_ key
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const lk = localStorage.key(i);
      if (lk && lk.startsWith('file_data_')) {
        if (lk.endsWith(`_${cleanName}`) || lk === `file_data_${cleanName}` || lk.toLowerCase().endsWith(`_${lowerName}`)) {
          const val = localStorage.getItem(lk);
          if (val && val.startsWith('data:')) {
            memoryFileCache.set(cleanName, val);
            return val;
          }
        }
      }
    }
  } catch (e) {}

  // 3. Check IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    for (const k of candidates) {
      const val = await new Promise<string>((resolve) => {
        const req = store.get(k);
        req.onsuccess = () => resolve(typeof req.result === 'string' ? req.result : '');
        req.onerror = () => resolve('');
      });
      if (val && val.startsWith('data:')) {
        memoryFileCache.set(k, val);
        return val;
      }
    }

    // Cursor scan IndexedDB store as ultimate fallback
    const cursorVal = await new Promise<string>((resolve) => {
      const req = store.openCursor();
      req.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          const keyStr = String(cursor.key);
          if (keyStr === cleanName || keyStr.endsWith(`_${cleanName}`) || keyStr.toLowerCase().endsWith(`_${lowerName}`)) {
            if (typeof cursor.value === 'string' && cursor.value.startsWith('data:')) {
              resolve(cursor.value);
              return;
            }
          }
          cursor.continue();
        } else {
          resolve('');
        }
      };
      req.onerror = () => resolve('');
    });

    if (cursorVal) {
      memoryFileCache.set(cleanName, cursorVal);
      return cursorVal;
    }
  } catch (e) {}

  return '';
}

export async function deleteFileContent(fileName: string, scopeKey?: string): Promise<void> {
  const candidates = scopeKey ? [`${scopeKey}_${fileName}`, fileName] : [fileName];
  for (const k of candidates) {
    memoryFileCache.delete(k);
    delete (window as any)[`file_data_${k}`];
    try {
      localStorage.removeItem(`file_data_${k}`);
    } catch (e) {}
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const k of candidates) {
      store.delete(k);
    }
  } catch (e) {}
}

export async function downloadFileHelper(fileName: string, fileUrl?: string, scopeKey?: string): Promise<void> {
  let realUrl = fileUrl;
  if (!realUrl || !realUrl.startsWith('data:')) {
    realUrl = await getFileContent(fileName, scopeKey);
  }

  if (realUrl && (realUrl.startsWith('data:') || realUrl.startsWith('blob:') || realUrl.startsWith('http'))) {
    if (realUrl.startsWith('data:')) {
      const blob = dataURLtoBlob(realUrl);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return;
    }

    const link = document.createElement('a');
    link.href = realUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  alert(`File content for "${fileName}" is not cached. Please re-attach the file and submit.`);
}

export async function saveReportData(key: string, reportObj: any): Promise<void> {
  if (!key || !reportObj) return;
  const jsonStr = typeof reportObj === 'string' ? reportObj : JSON.stringify(reportObj);
  const fullKey = `report_${key}`;
  memoryFileCache.set(fullKey, jsonStr);
  (window as any)[fullKey] = jsonStr;

  try {
    localStorage.setItem(fullKey, jsonStr);
  } catch (e) {}

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(jsonStr, fullKey);
  } catch (e) {}
}

export async function getReportData(key: string): Promise<any> {
  if (!key) return null;
  const fullKey = `report_${key}`;

  if (memoryFileCache.has(fullKey)) {
    try { return JSON.parse(memoryFileCache.get(fullKey)!); } catch (e) {}
  }
  if ((window as any)[fullKey]) {
    try { return JSON.parse((window as any)[fullKey]); } catch (e) {}
  }

  try {
    const localVal = localStorage.getItem(fullKey);
    if (localVal) {
      memoryFileCache.set(fullKey, localVal);
      return JSON.parse(localVal);
    }
  } catch (e) {}

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const val = await new Promise<string>((resolve) => {
      const req = store.get(fullKey);
      req.onsuccess = () => resolve(typeof req.result === 'string' ? req.result : '');
      req.onerror = () => resolve('');
    });
    if (val) {
      memoryFileCache.set(fullKey, val);
      return JSON.parse(val);
    }
  } catch (e) {}

  return null;
}
