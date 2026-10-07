export type ProjectFile = {
  path: string;
  content: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectStatus =
  | "draft"
  | "building"
  | "ready"
  | "deploying"
  | "deployed"
  | "error";
