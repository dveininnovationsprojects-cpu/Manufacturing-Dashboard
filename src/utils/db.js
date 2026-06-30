const DB_NAME = 'EnterpriseAnalyticsDB';
const STORE_NAME = 'dashboard_pdfs';
const DB_VERSION = 1;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject('IndexedDB initialization failed: ' + event.target.error);
    };
  });
}

export async function savePdfToDB(dashboardId, fileBlob) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Store using dashboard ID as the key
    const request = store.put(fileBlob, String(dashboardId));

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject('Error saving PDF to DB: ' + event.target.error);
    };
  });
}

export async function getPdfFromDB(dashboardId) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(String(dashboardId));

    request.onsuccess = (event) => {
      resolve(event.target.result || null);
    };

    request.onerror = (event) => {
      reject('Error fetching PDF from DB: ' + event.target.error);
    };
  });
}

export async function deletePdfFromDB(dashboardId) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(String(dashboardId));

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject('Error deleting PDF from DB: ' + event.target.error);
    };
  });
}

export async function clearAllPdfsFromDB() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      reject('Error clearing PDFs from DB: ' + event.target.error);
    };
  });
}
