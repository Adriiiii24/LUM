"""Alineación entre entidades extraídas y entidades de referencia.

Dos entidades se corresponden si alguno de sus nombres (nombre o alias) se parece lo
bastante tras normalizar. El emparejamiento es uno a uno y voraz: primero las parejas
más parecidas. Así «Buzz Aldrin» encuentra a «Edwin «Buzz» Aldrin» y una entidad
extraída no puede contar dos veces.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

from rapidfuzz import fuzz

ENTITY_THRESHOLD = 88.0
PREDICATE_THRESHOLD = 70.0


def normalize(text: str) -> str:
    """Minúsculas, sin diacríticos, sin comillas ni signos y con espacios colapsados."""
    folded = unicodedata.normalize("NFD", text)
    folded = "".join(c for c in folded if unicodedata.category(c) != "Mn").lower()
    folded = re.sub(r"[«»\"“”'‘’()\[\]]", " ", folded)
    folded = re.sub(r"[^\w\s.]", " ", folded)
    return re.sub(r"\s+", " ", folded).strip()


def name_similarity(names_a: list[str], names_b: list[str]) -> float:
    """La mejor similitud entre cualquier par de nombres, de 0 a 100."""
    best = 0.0
    for a in names_a:
        na = normalize(a)
        for b in names_b:
            nb = normalize(b)
            if not na or not nb:
                continue
            best = max(best, 100.0 if na == nb else fuzz.token_sort_ratio(na, nb))
    return best


@dataclass(frozen=True)
class Match:
    predicted: int
    gold: int
    score: float


def align(predicted: list[list[str]], gold: list[list[str]], threshold: float = ENTITY_THRESHOLD) -> list[Match]:
    """Empareja listas de nombres (cada entidad con su nombre y alias) de forma voraz y uno a uno."""
    candidates = [
        Match(i, j, score)
        for i, names_p in enumerate(predicted)
        for j, names_g in enumerate(gold)
        if (score := name_similarity(names_p, names_g)) >= threshold
    ]
    candidates.sort(key=lambda m: (-m.score, m.predicted, m.gold))
    used_p: set[int] = set()
    used_g: set[int] = set()
    matches: list[Match] = []
    for m in candidates:
        if m.predicted in used_p or m.gold in used_g:
            continue
        used_p.add(m.predicted)
        used_g.add(m.gold)
        matches.append(m)
    return matches


def predicate_similarity(a: str, b: str) -> float:
    return fuzz.token_set_ratio(normalize(a), normalize(b))
