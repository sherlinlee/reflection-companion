export type Child = {
  id: string;
  educator_id: string;
  name: string;
  age: number | null;
  class_name: string | null;
  created_at: string;
};

export type Observation = {
  id: string;
  child_id: string;
  observation_text: string;
  /** Supabase Storage object path (not a public URL). */
  image_url: string | null;
  /** Supabase Storage object path (not a public URL). */
  audio_url: string | null;
  observed_at: string;
  created_at: string;
};

export type Reflection = {
  id: string;
  observation_id: string;
  patterns: string[];
  questions: string[];
  connections: string[];
  created_at: string;
};

export type ReggioReflectionPayload = {
  patterns: string[];
  questions: string[];
  connections: string[];
};

export type ChildReflection = {
  id: string;
  child_id: string;
  patterns: string[];
  questions: string[];
  connections: string[];
  observation_count: number;
  created_at: string;
};

export type ChildSummary = {
  id: string;
  child_id: string;
  summary_text: string;
  observation_count: number;
  created_at: string;
};
