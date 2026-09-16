"""BELENT CAD data bank.

A dependency-free (stdlib only) SQLite bank of architectural materials,
norms and furniture blocks, seeded from seed.json and queryable in
PT / ES / EN.

Usage:
    python bank.py build                 # (re)build belent_cad.db from seed.json
    python bank.py search parquet        # full-text search across PT/ES/EN
    python bank.py norms ES              # list norms for a domain (ES/BR/INTL)
    python bank.py export rules.json     # dump the bank to JSON
"""

from __future__ import annotations

import json
import sqlite3
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SEED = HERE / "seed.json"
DB = HERE / "belent_cad.db"

LANGS = ("pt", "es", "en")
TABLES = ("materials", "standards", "blocks", "render_styles")


def load_seed() -> dict:
    with SEED.open(encoding="utf-8") as fh:
        return json.load(fh)


def build() -> Path:
    """Create the SQLite bank from seed.json."""
    data = load_seed()
    con = sqlite3.connect(DB)
    cur = con.cursor()

    for table in TABLES:
        cur.execute(f'DROP TABLE IF EXISTS "{table}"')
        rows = data.get(table, [])
        cols = sorted({k for row in rows for k in row})
        col_defs = ", ".join(f'"{c}" TEXT' for c in cols)
        cur.execute(f'CREATE TABLE "{table}" ({col_defs})')
        if rows:
            placeholders = ", ".join("?" for _ in cols)
            cur.executemany(
                f'INSERT INTO "{table}" ({", ".join(chr(34) + c + chr(34) for c in cols)}) '
                f"VALUES ({placeholders})",
                [[_as_text(row.get(c)) for c in cols] for row in rows],
            )
            # searchable text column keeps the bank simple and offline-friendly
            cur.execute(f'ALTER TABLE "{table}" ADD COLUMN search_text TEXT')
            cur.execute(
                f'UPDATE "{table}" SET search_text = '
                + " || ' ' || ".join(f'COALESCE("{c}", "")' for c in cols)
            )

    con.commit()
    con.close()
    return DB


def _as_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def search(term: str, limit: int = 20) -> list[dict]:
    if not DB.exists():
        build()
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    like = f"%{term.lower()}%"
    out: list[dict] = []
    for table in TABLES:
        try:
            cur.execute(
                f'SELECT * FROM "{table}" WHERE LOWER(search_text) LIKE ? LIMIT ?',
                (like, limit),
            )
            out.extend({"table": table, **dict(r)} for r in cur.fetchall())
        except sqlite3.OperationalError:
            continue
    con.close()
    return out[:limit]


def norms(domain: str | None = None) -> list[dict]:
    if not DB.exists():
        build()
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    if domain:
        cur.execute(
            "SELECT * FROM standards WHERE UPPER(domain) = ? ORDER BY code",
            (domain.upper(),),
        )
    else:
        cur.execute("SELECT * FROM standards ORDER BY domain, code")
    rows = [dict(r) for r in cur.fetchall()]
    con.close()
    return rows


def export_json(path: str) -> None:
    data = load_seed()
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _main(argv: list[str]) -> int:
    if not argv or argv[0] == "build":
        print(f"Built {build()}")
        return 0
    if argv[0] == "search":
        if len(argv) < 2:
            print("usage: bank.py search <term>")
            return 2
        for row in search(argv[1]):
            label = row.get("pt") or row.get("es") or row.get("en") or row.get("code")
            print(f"[{row['table']}] {label}")
        return 0
    if argv[0] == "norms":
        for row in norms(argv[1] if len(argv) > 1 else None):
            print(f"{row['code']} ({row['domain']}): {row.get('pt')}")
        return 0
    if argv[0] == "export":
        export_json(argv[1] if len(argv) > 1 else "bank.json")
        return 0
    print(__doc__)
    return 1


if __name__ == "__main__":
    raise SystemExit(_main(sys.argv[1:]))
