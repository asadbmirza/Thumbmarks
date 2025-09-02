import { vi } from 'vitest';
import '@testing-library/jest-dom';

(global as any).chrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn(),
      hasListeners: vi.fn(),
      addRules: vi.fn(),
      getRules: vi.fn(),
      removeRules: vi.fn()
    }
  } as any,
  tabs: {
    create: vi.fn(),
    query: vi.fn(),
    captureVisibleTab: vi.fn(),
    executeScript: vi.fn(),
    get: vi.fn(),
    getAllInWindow: vi.fn(),
    getCurrent: vi.fn(),
    connect: vi.fn(),
    detectLanguage: vi.fn(),
    discard: vi.fn(),
    duplicate: vi.fn(),
    highlight: vi.fn(),
    insertCSS: vi.fn(),
    move: vi.fn(),
    reload: vi.fn(),
    remove: vi.fn(),
    sendMessage: vi.fn(),
    update: vi.fn(),

  } as any,
  scripting: {
      executeScript: vi.fn(),
      insertCSS: vi.fn(),
      removeCSS: vi.fn(),
      registerContentScripts: vi.fn(),
      unregisterContentScripts: vi.fn(),
      updateContentScripts: vi.fn(),
      getRegisteredContentScripts: vi.fn()
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({
        supabase_session: {
          access_token: "fake_token",
          user: { id: "user123", email: "test@example.com" }
        }
      }),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined)
    }
  }
};