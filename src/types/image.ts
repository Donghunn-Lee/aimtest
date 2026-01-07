/**
 * 해상도 및 화면 비율 설정
 */
export interface Resolution {
  name: string; // 표기명 (예: "16 : 9")
  width: number;
  height: number;
  ratio: number; // 종횡비 (width / height)
}

/**
 * 리소스(이미지, 사운드 등) 로딩 상태
 */
export type LoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';
