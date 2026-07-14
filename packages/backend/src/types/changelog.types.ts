export interface ReleaseData {
  version: string;
  date: string | null;
  author: string;
  markdownBody: string;
  source: 'changelog' | 'github';
  commits: Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>;
}
