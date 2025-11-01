export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  following?: string[];
  followers?: string[];
  followingCount?: number;
  followersCount?: number;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  description: string;
  city: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: any; // Allow for Firebase ServerValue.TIMESTAMP
  likes: number;
  likedBy: string[];
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  timestamp: string;
}

export interface FilterOptions {
  startDate: string | null;
  endDate: string | null;
  mediaType: 'all' | 'image' | 'video';
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: string;
  duration?: number; // Duration in seconds for images
}

export interface UserStory {
  userId: string;
  stories: Story[];
}

export type SortBy = 'recent' | 'popular' | 'nearby';

export interface TopContributor {
  user: User;
  score: number;
}

export interface TrendingLocation {
  city: string;
  postCount: number;
}

export type LegalContentType = 'Aviso Legal' | 'Política de Privacidad' | 'Política de Cookies';

export type GeolocationStatus = 'requesting' | 'loading' | 'denied' | 'error' | null;

export interface FiestaEvent {
  name: string;
  city: string;
  dates: string;
  description: string;
  type: string;
}

export interface Credentials {
    email: string;
    password: any;
    username?: string;
}

export interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  order: number;
}