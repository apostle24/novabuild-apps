export type DeploymentStatus =
  | "idle"
  | "building"
  | "deploying"
  | "deployed"
  | "failed";

export type Deployment = {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  url?: string;
  createdAt: string;
};
