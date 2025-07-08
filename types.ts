export interface Visualization {
  id: string;
  name: string;
  url: string;
}

export interface AnalysisResult {
  summary: string;
  key_insights: string[];
  recommendations: string[];
}

export interface Insight extends AnalysisResult {
  id: string;
  visualization_id: string;
  created_at: string;
}