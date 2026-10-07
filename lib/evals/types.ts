/** Forma de evals/results/latest.json, el fichero que escribe el banco de evals en Python. */
export type PRF = { precision: number; recall: number; f1: number };

export type EvalRun = {
  label: string;
  model: string;
  thinking: string;
  documents: number;
  entities: PRF;
  entityTypeAccuracy: number;
  relationsLenient: PRF;
  relationsStrict: PRF;
  /** Proporción de citas que aparecen literalmente en el texto. */
  grounding: number;
  /** Proporción de salidas que cumplen el esquema. */
  schemaValid: number;
  medianLatencyMs: number | null;
};

export type EvalResults = {
  status: 'pendiente' | 'ok';
  generatedAt: string | null;
  /** false mientras el conjunto de referencia no lo haya revisado una persona. */
  goldReviewed: boolean;
  documents: number;
  runs: EvalRun[];
};
