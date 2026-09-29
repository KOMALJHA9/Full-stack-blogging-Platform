export interface Comment {
  id:        number;
  body:      string;
  author:    string;
  postId:    number;
  createdAt: string;
}

export interface Post {
  id:        number;
  title:     string;
  content:   string;
  author:    string;
  tag:       string;
  published: boolean;
  comments:  Comment[];
  createdAt: string;
  updatedAt: string;
}

// Filters used in query key arrays
export interface PostFilters {
  tag?:      string;
  author?:   string;
  search?:   string;
  sort?:     'newest' | 'oldest' | 'title-asc' | 'title-desc';
  page?:     number;
  pageSize?: number;
  ids?:      number[];
}

export interface PostListResponse {
  posts:      Post[];
  count:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
}
