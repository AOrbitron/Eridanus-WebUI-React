// IndexedDB工具类，用于存储和检索聊天消息

// 消息类型定义
export interface ChatMessage {
  role: 'end' | 'start';
  content?: string;
  url?: string;
  type?: string;
  loading?: boolean;
  id?: number;
  replyTo?: { id: number; content?: string };
  nodeData?: any; // 添加node类型数据字段，用于存储转发消息
}

// 数据库名称和版本
const DB_NAME = 'chatMessagesDB';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

// 初始化数据库
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('数据库打开失败:', event);
      reject('数据库打开失败');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // 创建对象存储空间
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// 保存消息到数据库
export const saveMessages = async (messages: ChatMessage[]): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // 清除现有数据
    store.clear();

    // 添加所有消息
    messages.forEach(message => {
      store.add(message);
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = (event) => {
        console.error('保存消息失败:', event);
        reject('保存消息失败');
      };
    });
  } catch (error) {
    console.error('保存消息时出错:', error);
    throw error;
  }
};

// 从数据库加载消息
export const loadMessages = async (): Promise<ChatMessage[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result);
      };
      request.onerror = (event) => {
        console.error('加载消息失败:', event);
        reject('加载消息失败');
      };
    });
  } catch (error) {
    console.error('加载消息时出错:', error);
    return [];
  }
};

// 清除所有消息
export const clearMessages = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = (event) => {
        console.error('清除消息失败:', event);
        reject('清除消息失败');
      };
    });
  } catch (error) {
    console.error('清除消息时出错:', error);
    throw error;
  }
};
