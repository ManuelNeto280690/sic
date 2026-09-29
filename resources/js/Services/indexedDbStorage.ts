/**
 * Serviço de persistência local IndexedDB para o Workspace Multi-Abas do SIGD-SIC.
 * Impede a perda de notas, transcrições de interrogatórios e autos em caso de queda de sessão.
 */

const DB_NAME = 'SIGD_SIC_TACTICAL_CACHE';
const STORE_DRAFTS = 'interrogatorio_drafts';
const STORE_TABS = 'workspace_tabs';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            return reject('IndexedDB não suportado neste ambiente.');
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result as IDBDatabase;
            if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
                db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_TABS)) {
                db.createObjectStore(STORE_TABS, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveDraft(key: string, data: any): Promise<void> {
    try {
        const db = await openDb();
        const tx = db.transaction(STORE_DRAFTS, 'readwrite');
        const store = tx.objectStore(STORE_DRAFTS);
        store.put({ id: key, payload: data, updatedAt: new Date().toISOString() });
    } catch (e) {
        console.warn('Falha ao gravar rascunho no IndexedDB, fallback localStorage:', e);
        try {
            localStorage.setItem(`sigd_draft_${key}`, JSON.stringify(data));
        } catch (_) {}
    }
}

export async function getDraft(key: string): Promise<any | null> {
    try {
        const db = await openDb();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_DRAFTS, 'readonly');
            const store = tx.objectStore(STORE_DRAFTS);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result ? req.result.payload : null);
            req.onerror = () => resolve(null);
        });
    } catch (e) {
        const val = localStorage.getItem(`sigd_draft_${key}`);
        return val ? JSON.parse(val) : null;
    }
}

export async function saveTabsState(tabs: any[]): Promise<void> {
    try {
        const db = await openDb();
        const tx = db.transaction(STORE_TABS, 'readwrite');
        const store = tx.objectStore(STORE_TABS);
        store.put({ id: 'active_tabs', tabs, updatedAt: new Date().toISOString() });
    } catch (e) {
        localStorage.setItem('sigd_active_tabs', JSON.stringify(tabs));
    }
}

export async function getTabsState(): Promise<any[]> {
    try {
        const db = await openDb();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_TABS, 'readonly');
            const store = tx.objectStore(STORE_TABS);
            const req = store.get('active_tabs');
            req.onsuccess = () => resolve(req.result ? req.result.tabs : []);
            req.onerror = () => resolve([]);
        });
    } catch (e) {
        const val = localStorage.getItem('sigd_active_tabs');
        return val ? JSON.parse(val) : [];
    }
}
