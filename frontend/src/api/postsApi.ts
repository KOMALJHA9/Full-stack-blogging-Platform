import axios from 'axios';
import { Post, Comment, PostFilters, PostListResponse } from '../types';

const BASE = '/api';

// ── Posts ─────────────────────────────────────────────────

export const fetchPosts = async (filters: PostFilters = {}): Promise<PostListResponse> => {
  const params: Record<string, string | number> = {};
  if (filters.tag)      params.tag      = filters.tag;
  if (filters.author)   params.author   = filters.author;
  if (filters.search)   params.search   = filters.search;
  if (filters.sort)     params.sort     = filters.sort;
  if (filters.page)     params.page     = filters.page;
  if (filters.pageSize) params.pageSize = filters.pageSize;
  if (filters.ids)      params.ids      = filters.ids.join(',');
  const res = await axios.get(`${BASE}/posts`, { params });
  return res.data;
};

export const fetchPostById = async (id: number): Promise<Post> => {
  const res = await axios.get(`${BASE}/posts/${id}`);
  return res.data;
};

export const createPost = async (data: {
  title: string; content: string; author: string; tag: string;
}): Promise<Post> => {
  const res = await axios.post(`${BASE}/posts`, data);
  return res.data;
};

export const updatePost = async (id: number, data: {
  title: string; content: string; tag: string;
}): Promise<Post> => {
  const res = await axios.put(`${BASE}/posts/${id}`, data);
  return res.data;
};

export const togglePublish = async (id: number): Promise<Post> => {
  const res = await axios.patch(`${BASE}/posts/${id}/publish`);
  return res.data;
};

export const setPostLike = async (id: number, clientId: string, liked: boolean): Promise<{ postId: number; liked: boolean }> => {
  const res = await axios.patch(`${BASE}/posts/${id}/like`, { clientId, liked });
  return res.data;
};

export const deletePost = async (id: number): Promise<void> => {
  await axios.delete(`${BASE}/posts/${id}`);
};

// ── Comments ──────────────────────────────────────────────

export const fetchComments = async (postId: number): Promise<Comment[]> => {
  const res = await axios.get(`${BASE}/posts/${postId}/comments`);
  return res.data.comments;
};

export const addComment = async (postId: number, data: {
  body: string; author: string;
}): Promise<Comment> => {
  const res = await axios.post(`${BASE}/posts/${postId}/comments`, data);
  return res.data;
};

export const deleteComment = async (id: number): Promise<void> => {
  await axios.delete(`${BASE}/comments/${id}`);
};
