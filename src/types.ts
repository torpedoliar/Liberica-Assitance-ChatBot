export type Mode = 'troubleshoot' | 'brainstorm' | 'market' | 'chat' | 'news';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  data?: any; // For rich responses
  fileName?: string;
  fileContent?: string;
}

export interface AppState {
  troubleshoot: {
    step: 'idle' | 'clarifying' | 'solving';
    context: {
      originalProblem: string;
      originalImage?: string;
      clarifications: string;
      failedAttempts: string[];
    };
  };
}
