export type User = {
  id: string;
  email: string;
  created: string;
};

export type Post = {
  id: string;
  userId: string;
  title: string;
  body: string | null;
  createdAt: string;
  updatedAt: string;
};
