"""BELENT CAD MCP server.

Exposes the BELENT CAD data bank and the deterministic parametric
floor-plan engine to any MCP-capable agent (Claude, OpenCode, Cursor...).

Run:
    pip install -r requirements.txt
    python belent_cad_mcp.py

Transport: stdio (default for MCP).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Make the stdlib bank importable without packaging.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "python"))

from belent_bank import bank  # noqa: E402  (path inserted above)

from mcp.server.fastmcp import FastMCP  # noqa: E402

mcp = FastMCP("belent-cad")


@mcp.tool()
def bank_search(term: str, limit: int = 20) -> str:
    """Search architectural materials, norms, blocks and render styles.

    Multilingual (PT/ES/EN). Returns JSON rows matching the term.
    """
    return json.dumps(bank.search(term, limit), ensure_ascii=False, indent=2)


@mcp.tool()
def list_norms(domain: str = "") -> str:
    """List building norms. Optional domain filter: ES, BR or INTL."""
    return json.dumps(bank.norms(domain or None), ensure_ascii=False, indent=2)


@mcp.tool()
def generate_floorplan(width_m: float = 12.0, depth_m: float = 9.5, rooms: int = 4) -> str:
    """Generate a deterministic orthogonal floor plan (walls, openings, rooms).

    Returns the same CAD model shape the web editor consumes:
    {name, scale, walls[], openings[], rooms[], dimensions[]}.
    """
    w, d = max(4.0, width_m), max(4.0, depth_m)
    walls = [
        {"id": "w1", "x1": 0, "y1": 0, "x2": w, "y2": 0, "thickness": 0.25, "height": 2.8, "layer": "A-WALL", "isExterior": True},
        {"id": "w2", "x1": w, "y1": 0, "x2": w, "y2": d, "thickness": 0.25, "height": 2.8, "layer": "A-WALL", "isExterior": True},
        {"id": "w3", "x1": w, "y1": d, "x2": 0, "y2": d, "thickness": 0.25, "height": 2.8, "layer": "A-WALL", "isExterior": True},
        {"id": "w4", "x1": 0, "y1": d, "x2": 0, "y2": 0, "thickness": 0.25, "height": 2.8, "layer": "A-WALL", "isExterior": True},
    ]
    split = w / 2
    walls.append({"id": "w5", "x1": split, "y1": 0, "x2": split, "y2": d, "thickness": 0.15, "height": 2.8, "layer": "A-WALL"})
    if rooms >= 3:
        mid = d / 2
        walls.append({"id": "w6", "x1": 0, "y1": mid, "x2": split, "y2": mid, "thickness": 0.15, "height": 2.8, "layer": "A-WALL"})

    openings = [
        {"id": "d1", "type": "door", "x": 1.2, "y": 0, "width": 0.9, "height": 2.1, "sillHeight": 0, "label": "Entrada"},
        {"id": "v1", "type": "window", "x": 2.0, "y": d, "width": 1.6, "height": 1.4, "sillHeight": 0.9, "label": "Ventana"},
    ]

    half = split - 0.5
    mid = d / 2
    cad_rooms = [
        {"id": "r1", "name": "Sala", "type": "living", "x": 0.25, "y": 0.25, "width": half, "height": mid - 0.5,
         "areaSqM": round(half * (mid - 0.5), 1), "floorMaterial": "parquet", "color": "#38bdf8"},
        {"id": "r2", "name": "Dormitório", "type": "bedroom", "x": 0.25, "y": mid, "width": half, "height": mid - 0.5,
         "areaSqM": round(half * (mid - 0.5), 1), "floorMaterial": "parquet", "color": "#818cf8"},
        {"id": "r3", "name": "Cozinha", "type": "kitchen", "x": split, "y": 0.25, "width": half, "height": d - 0.5,
         "areaSqM": round(half * (d - 0.5), 1), "floorMaterial": "tile", "color": "#f59e0b"},
    ]

    plan = {
        "name": f"Plano paramétrico {w:.1f}×{d:.1f} m",
        "scale": "1:50",
        "totalAreaSqM": round(w * d, 1),
        "confidence": 1.0,
        "walls": walls,
        "openings": openings,
        "rooms": cad_rooms[: max(1, rooms)],
        "dimensions": [
            {"id": "dim1", "x1": 0, "y1": -0.6, "x2": w, "y2": -0.6, "offset": -0.6, "value": w, "text": f"{w:.2f} m"},
            {"id": "dim2", "x1": -0.6, "y1": 0, "x2": -0.6, "y2": d, "offset": -0.6, "value": d, "text": f"{d:.2f} m"},
        ],
    }
    return json.dumps(plan, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    mcp.run()
