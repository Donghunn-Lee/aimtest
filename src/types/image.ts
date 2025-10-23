export interface Resolution {
  name: string;
  width: number;
  height: number;
  ratio: number;
}

export type LoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';
