// Common API response shape
export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

// Generic list response
export interface ListResponse<T> {
  items: T[]
  meta: PaginationMeta
}

// Base entity fields
export interface Entity {
  id: string
  createdAt: string
  updatedAt: string
}

// User
export interface User extends Entity {
  name: string
  email: string
  avatarUrl?: string
  role: 'admin' | 'user' | 'guest'
}
