import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── UI Store ────────────────────────────────────────────────────────────────
interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))

// ─── App Store (persisted) ────────────────────────────────────────────────────
// Replace this with your app's actual state shape
interface AppState {
  items: string[]
  addItem: (item: string) => void
  removeItem: (item: string) => void
  clearItems: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      removeItem: (item) => set((s) => ({ items: s.items.filter((i) => i !== item) })),
      clearItems: () => set({ items: [] }),
    }),
    { name: 'app-store' }
  )
)
