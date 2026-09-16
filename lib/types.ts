export type Role = 'student' | 'teacher' | 'admin';

export type Priority = 'normal' | 'important' | 'urgent';

export type Category = 'General' | 'Exams' | 'Events' | 'Sports' | 'Holidays' | 'Clubs';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  color: string;
  subject?: string;
  createdAt: number;
}

export interface DesignSpec {
  bg: string;                    // key of GRADIENTS
  font: 'sans' | 'serif' | 'mono';
  align: 'left' | 'center';
  size: 'S' | 'M' | 'L';
  titleColor: string;
  bodyColor: string;
  highlight: string | null;      // background highlight behind the title
  sticker: string | null;        // emoji sticker
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  category: Category;
  priority: Priority;
  images: string[];
  design: DesignSpec | null;
  authorId: string;
  authorName: string;
  authorRole: Role;
  createdAt: number;
  pinned: boolean;
  likes: string[];   // user ids
  views: string[];   // user ids
}

export interface Draft {
  id: string;
  title: string;
  body: string;
  category: Category;
  priority: Priority;
  images: string[];
  design: DesignSpec | null;
  updatedAt: number;
}

export const DEFAULT_DESIGN: DesignSpec = {
  bg: 'indigo',
  font: 'serif',
  align: 'center',
  size: 'M',
  titleColor: '#FFFFFF',
  bodyColor: 'rgba(255,255,255,0.92)',
  highlight: null,
  sticker: null,
};
