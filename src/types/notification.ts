export interface Notification {
  id: number
  message: string
  relatedEntityId: number | null
  read: boolean
  createdByName: string | null
  createdAt: string
}
