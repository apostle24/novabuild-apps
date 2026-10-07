export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIGenerationRequest = {
  prompt: string;
  files?: {
    path: string;
    content: string;
  }[];
};

export type AIGenerationResponse = {
  success: boolean;
  files?: {
    path: string;
    content: string;
  }[];
  error?: string;
};
