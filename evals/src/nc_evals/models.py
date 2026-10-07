"""Formatos de entrada: textos de referencia anotados a mano y ejecuciones grabadas del pipeline."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

EntityType = Literal["persona", "organizacion", "lugar", "artefacto", "concepto", "evento", "otro"]


class GoldEntity(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    type: EntityType
    aliases: list[str] = Field(default_factory=list)


class GoldRelation(BaseModel):
    """Relación de referencia. source y target son nombres de entidades del mismo documento."""

    model_config = ConfigDict(extra="forbid")
    source: str
    target: str
    predicate: str


class GoldDoc(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    reviewed: bool = Field(description="true solo cuando una persona ha revisado la anotación entera")
    text: str
    entities: list[GoldEntity]
    relations: list[GoldRelation]


class Span(BaseModel):
    start: int
    end: int


class RunEntity(BaseModel):
    id: str
    name: str
    type: EntityType
    aliases: list[str]
    evidence: Span | None


class RunRelation(BaseModel):
    id: str
    source: str
    target: str
    predicate: str
    evidence: Span | None


class RunGraph(BaseModel):
    """El mismo grafo que devuelve /api/extract (lib/graph/schema.ts), con los campos que se evalúan."""

    entities: list[RunEntity]
    relations: list[RunRelation]


class RunRecord(BaseModel):
    """Una extracción grabada por scripts/export-eval-runs.ts."""

    docId: str
    model: str | None
    thinking: str
    latencyMs: int
    ok: bool
    error: str | None
    text: str | None
    graph: RunGraph | None
