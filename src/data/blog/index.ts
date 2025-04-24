
import { BlogPost } from './types';
import { plgPosts } from './plg-posts';
import { croPosts } from './cro-posts';
import { martechPosts } from './martech-posts';
import { otherPosts } from './other-posts';

export * from './types';

// Combine all posts and export them
export const blogPosts: BlogPost[] = [
  ...plgPosts,
  ...croPosts,
  ...martechPosts,
  ...otherPosts
];
