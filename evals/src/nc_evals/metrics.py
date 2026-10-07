"""Métricas de una extracción frente a su referencia y agregación por configuración."""

from __future__ import annotations

from dataclasses import dataclass
from statistics import median

from .align import PREDICATE_THRESHOLD, align, predicate_similarity
from .models import GoldDoc, RunRecord


@dataclass(frozen=True)
class Counts:
    """Aciertos, total predicho y total de referencia: lo que se suma entre documentos (micro)."""

    tp: int
    predicted: int
    gold: int

    def __add__(self, other: Counts) -> Counts:
        return Counts(self.tp + other.tp, self.predicted + other.predicted, self.gold + other.gold)

    def prf(self) -> dict[str, float]:
        precision = self.tp / self.predicted if self.predicted else 0.0
        recall = self.tp / self.gold if self.gold else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        return {"precision": round(precision, 4), "recall": round(recall, 4), "f1": round(f1, 4)}


@dataclass(frozen=True)
class DocScore:
    entities: Counts
    type_hits: int
    type_total: int
    relations_lenient: Counts
    relations_strict: Counts
    grounded: int
    evidence_total: int


ZERO = Counts(0, 0, 0)


def score_document(gold: GoldDoc, run: RunRecord) -> DocScore:
    """Puntúa una extracción. Una ejecución fallida cuenta como cero aciertos con toda la referencia por recuperar."""
    if not run.ok or run.graph is None:
        return DocScore(
            entities=Counts(0, 0, len(gold.entities)),
            type_hits=0,
            type_total=0,
            relations_lenient=Counts(0, 0, len(gold.relations)),
            relations_strict=Counts(0, 0, len(gold.relations)),
            grounded=0,
            evidence_total=0,
        )

    graph = run.graph
    predicted_names = [[e.name, *e.aliases] for e in graph.entities]
    gold_names = [[e.name, *e.aliases] for e in gold.entities]
    matches = align(predicted_names, gold_names)
    to_gold = {graph.entities[m.predicted].id: m.gold for m in matches}
    type_hits = sum(1 for m in matches if graph.entities[m.predicted].type == gold.entities[m.gold].type)

    gold_index = {e.name: i for i, e in enumerate(gold.entities)}
    gold_edges = [
        (gold_index[r.source], gold_index[r.target], r.predicate)
        for r in gold.relations
        if r.source in gold_index and r.target in gold_index
    ]

    lenient_used: set[int] = set()
    strict_used: set[int] = set()
    lenient_tp = strict_tp = 0
    for rel in graph.relations:
        s, t = to_gold.get(rel.source), to_gold.get(rel.target)
        if s is None or t is None:
            continue
        for k, (gs, gt, gp) in enumerate(gold_edges):
            if k not in lenient_used and {s, t} == {gs, gt}:
                lenient_used.add(k)
                lenient_tp += 1
                break
        for k, (gs, gt, gp) in enumerate(gold_edges):
            if k not in strict_used and (s, t) == (gs, gt) and predicate_similarity(rel.predicate, gp) >= PREDICATE_THRESHOLD:
                strict_used.add(k)
                strict_tp += 1
                break

    evidences = [e.evidence for e in graph.entities] + [r.evidence for r in graph.relations]
    text_length = len(run.text or "")
    grounded = sum(1 for ev in evidences if ev is not None and 0 <= ev.start < ev.end <= text_length)

    return DocScore(
        entities=Counts(len(matches), len(graph.entities), len(gold.entities)),
        type_hits=type_hits,
        type_total=len(matches),
        relations_lenient=Counts(lenient_tp, len(graph.relations), len(gold_edges)),
        relations_strict=Counts(strict_tp, len(graph.relations), len(gold_edges)),
        grounded=grounded,
        evidence_total=len(evidences),
    )


def aggregate(label: str, pairs: list[tuple[GoldDoc, RunRecord]]) -> dict[str, object]:
    """Suma micro de todos los documentos de una configuración, en el formato de lib/evals/types.ts."""
    scores = [score_document(g, r) for g, r in pairs]
    runs = [r for _, r in pairs]
    entities = sum((s.entities for s in scores), ZERO)
    lenient = sum((s.relations_lenient for s in scores), ZERO)
    strict = sum((s.relations_strict for s in scores), ZERO)
    type_total = sum(s.type_total for s in scores)
    evidence_total = sum(s.evidence_total for s in scores)
    latencies = [r.latencyMs for r in runs if r.ok]
    first = runs[0] if runs else None
    return {
        "label": label,
        "model": (first.model if first and first.model else "desconocido"),
        "thinking": first.thinking if first else "",
        "documents": len(pairs),
        "entities": entities.prf(),
        "entityTypeAccuracy": round(sum(s.type_hits for s in scores) / type_total, 4) if type_total else 0.0,
        "relationsLenient": lenient.prf(),
        "relationsStrict": strict.prf(),
        "grounding": round(sum(s.grounded for s in scores) / evidence_total, 4) if evidence_total else 0.0,
        "schemaValid": round(sum(1 for r in runs if r.ok and r.graph is not None) / len(runs), 4) if runs else 0.0,
        "medianLatencyMs": int(median(latencies)) if latencies else None,
    }
