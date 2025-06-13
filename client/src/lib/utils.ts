import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, subDays } from 'date-fns';
import type { Post } from '@shared/schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}

export function formatReadTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return `Today, ${d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  } else if (diffInHours < 48) {
    return `Yesterday, ${d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  } else {
    return d.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric'
    });
  }
}

export function calculateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return Math.max(1, Math.ceil(words.length / 200));
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function getExcerpt(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function calculateWritingStreak(posts: Post[]): number {
  const today = format(new Date(), 'yyyy-MM-dd');

  const dateSet = new Set(
    posts
      .filter((p) => !!p.createdAt)
      .map((post) => format(new Date(post.createdAt), 'yyyy-MM-dd'))
  );

  let streak = 0;
  for (let i = 0; ; i++) {
    const dateToCheck = format(subDays(new Date(), i), 'yyyy-MM-dd');
    if (dateSet.has(dateToCheck)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}