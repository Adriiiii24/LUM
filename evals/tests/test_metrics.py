from nc_evals.align import align, name_similarity, normalize
from nc_evals.metrics import aggregate, score_document
from nc_evals.models import GoldDoc, RunRecord

TEXT = "Marie Curie nació en Varsovia. Curie descubrió el polonio en París."

GOLD = GoldDoc.model_validate(
    {
        "id": "curie",
        "reviewed": True,
        "text": TEXT,
        "entities": [
            {"name": "Marie Curie", "type": "persona", "aliases": ["Curie"]},
            {"name": "Varsovia", "type": "lugar"},
            {"name": "polonio", "type": "concepto"},
            {"name": "París", "type": "lugar"},
        ],
        "relations": [
            {"source": "Marie Curie", "target": "Varsovia", "predicate": "nació en"},
            {"source": "Marie Curie", "target": "polonio", "predicate": "descubrió"},
        ],
    }
)


def run(entities, relations, ok=True):
    return RunRecord.model_validate(
        {
            "docId": "curie",
            "model": "test",
            "thinking": "low",
            "latencyMs": 1200,
            "ok": ok,
            "error": None if ok else "salida_invalida",
            "text": TEXT,
            "graph": {"entities": entities, "relations": relations} if ok else None,
        }
    )


def ent(id, name, type, aliases=(), evidence=(0, 4)):
    return {"id": id, "name": name, "type": type, "aliases": list(aliases), "evidence": {"start": evidence[0], "end": evidence[1]} if evidence else None}


def rel(id, s, t, p, evidence=(0, 4)):
    return {"id": id, "source": s, "target": t, "predicate": p, "evidence": {"start": evidence[0], "end": evidence[1]} if evidence else None}


def test_normalize_quita_diacriticos_y_comillas():
    assert normalize("Edwin «Buzz» Aldrin") == "edwin buzz aldrin"
    assert normalize("París") == "paris"


def test_alias_cuenta_para_alinear():
    assert name_similarity(["Curie"], ["Marie Curie", "Curie"]) == 100.0


def test_alineacion_uno_a_uno():
    matches = align([["Marie Curie"], ["Curie"]], [["Marie Curie", "Curie"]])
    assert len(matches) == 1, "una entidad de referencia no puede emparejarse dos veces"


def test_extraccion_perfecta():
    r = run(
        [ent("n1", "Marie Curie", "persona"), ent("n2", "Varsovia", "lugar"), ent("n3", "polonio", "concepto"), ent("n4", "París", "lugar")],
        [rel("e1", "n1", "n2", "nació en"), rel("e2", "n1", "n3", "descubrió")],
    )
    s = score_document(GOLD, r)
    assert (s.entities.tp, s.entities.predicted, s.entities.gold) == (4, 4, 4)
    assert s.relations_strict.tp == 2
    assert s.grounded == s.evidence_total == 6


def test_relacion_invertida_es_laxa_pero_no_estricta():
    r = run([ent("n1", "Marie Curie", "persona"), ent("n2", "Varsovia", "lugar")], [rel("e1", "n2", "n1", "nació en")])
    s = score_document(GOLD, r)
    assert s.relations_lenient.tp == 1
    assert s.relations_strict.tp == 0


def test_tipo_equivocado_baja_la_exactitud_de_tipo():
    r = run([ent("n1", "Marie Curie", "organizacion"), ent("n2", "Varsovia", "lugar")], [])
    s = score_document(GOLD, r)
    assert (s.type_hits, s.type_total) == (1, 2)


def test_cita_sin_anclaje_no_cuenta():
    r = run([ent("n1", "Marie Curie", "persona", evidence=None), ent("n2", "Varsovia", "lugar")], [])
    s = score_document(GOLD, r)
    assert (s.grounded, s.evidence_total) == (1, 2)


def test_ejecucion_fallida_cuenta_como_cero_y_baja_el_esquema():
    good = run([ent("n1", "Marie Curie", "persona")], [])
    bad = run([], [], ok=False)
    result = aggregate("prueba", [(GOLD, good), (GOLD, bad)])
    assert result["schemaValid"] == 0.5
    assert result["entities"]["recall"] == round(1 / 8, 4)
