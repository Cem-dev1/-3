export interface User {
  id: string
  full_name: string
  avatar_url?: string
  created_at: string
}

export interface Couple {
  id: string
  user1_id: string
  user2_id: string
  started_at: string
  coins_balance: number
  created_at: string
}

export interface Coupon {
  id: string
  couple_id: string
  creator_id?: string
  title: string
  cost: number
  is_custom: boolean
  status: 'available' | 'redeemed' | 'approved'
  expires_at?: string
  created_at: string
}

export interface WidgetStatus {
  id: string
  couple_id: string
  sender_id?: string
  message: string
  created_at: string
}

export interface RoomItem {
  id: string
  couple_id: string
  item_type: 'wallpaper' | 'furniture' | 'pet' | 'music_box' | 'frame'
  item_name: string
  created_at: string
}