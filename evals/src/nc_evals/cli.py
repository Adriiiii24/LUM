"""Línea de órdenes: puntúa las ejecuciones grabadas y escribe results/latest.json.

    uv run nc-evals score            # todas las configuraciones de runs/
    uv run nc-evals score --check    # además, falla si un documento de referencia no tiene ejecución

Cada subcarpeta de runs/ es una configuración (modelo y razonamiento) con un JSON por documento.
No llama a ningún modelo: por eso puede correr en CI.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import UTC, datetime
from pathlib import Path

from .metrics import aggregate
from .models import GoldDoc, RunRecord

ROOT = Path(__file__).resolve().parents[2]


def load_gold(directory: Path) -> dict[str, GoldDoc]:
    docs = [GoldDoc.model_validate_json(p.read_text(encoding="utf-8")) for p in sorted(directory.glob("*.json"))]
    return {d.id: d for d in docs}


def score(runs_dir: Path, gold_dir: Path, out: Path, check: bool) -> int:
    gold = load_gold(gold_dir)
    if not gold:
        print(f"No hay textos de referencia en {gold_dir}", file=sys.stderr)
        return 1

    results: list[dict[str, object]] = []
    missing: list[str] = []
    for config in sorted(p for p in runs_dir.iterdir() if p.is_dir()) if runs_dir.exists() else []:
        records = {
            r.docId: r
            for r in (RunRecord.model_validate_json(p.read_text(encoding="utf-8")) for p in sorted(config.glob("*.json")))
        }
        pairs = [(doc, records[doc_id]) for doc_id, doc in gold.items() if doc_id in records]
        missing += [f"{config.name}/{doc_id}" for doc_id in gold if doc_id not in records]
        if pairs:
            results.append(aggregate(config.name, pairs))

    reviewed = all(d.reviewed for d in gold.values())
    payload = {
        "status": "ok" if results else "pendiente",
        "generatedAt": datetime.now(UTC).isoformat(timespec="seconds"),
        "goldReviewed": reviewed,
        "documents": len(gold),
        "runs": results,
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    for r in results:
        e, rl = r["entities"], r["relationsLenient"]
        print(f"{r['label']}: entidades F1 {e['f1']:.3f} (P {e['precision']:.3f}, R {e['recall']:.3f}); "  # type: ignore[index]
              f"relaciones F1 {rl['f1']:.3f}; anclaje {r['grounding']:.3f}; esquema {r['schemaValid']:.3f}")  # type: ignore[index]
    if not reviewed:
        print("Aviso: hay textos de referencia sin revisar; la web no publicará estos números.")
    if check and missing:
        print("Faltan ejecuciones: " + ", ".join(missing), file=sys.stderr)
        return 1
    return 0


def main(argv: list[str] | None = None) -> int:
    # Las consolas de Windows no siempre usan UTF-8: los avisos llevan tildes.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(prog="nc-evals", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    s = sub.add_parser("score", help="puntúa las ejecuciones grabadas")
    s.add_argument("--runs", type=Path, default=ROOT / "runs")
    s.add_argument("--gold", type=Path, default=ROOT / "gold")
    s.add_argument("--out", type=Path, default=ROOT / "results" / "latest.json")
    s.add_argument("--check", action="store_true", help="falla si falta alguna ejecución")
    args = parser.parse_args(argv)
    if args.command == "score":
        return score(args.runs, args.gold, args.out, args.check)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
