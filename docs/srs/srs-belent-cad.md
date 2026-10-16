# SRS -- belent-cad
Fecha: 2026-09-25 | Estado: Draft | Traza a: PRD prd-belent-cad.md

## Requisitos funcionales

| ID | Requisito | Traza PRD | Prioridad |
|---|---|---|---|
| FR-001 | El sistema implementa: Editor CAD 2D com camadas, orto, snap, cotas e bloco de símbolos. | F1 | Must |
| FR-002 | El sistema implementa: Maqueta 3D interativa (Three.js) com corte, óptica de câmera e iluminação fotométrica. | F2 | Must |
| FR-003 | El sistema implementa: Boceto → 3D: digitaliza desenhos em papel (canvas/branco ou upload) e os converte em plant | F3 | Must |
| FR-004 | El sistema implementa: Estúdio fotorrealista com presets de luz, materiais e comparação antes/depois. | F4 | Must |
| FR-005 | El sistema implementa: Lâminas ISO 5457 / NBR 6492 com carimbo, quadro de áreas e exportação SVG/PDF. | F5 | Must |
| FR-006 | El sistema implementa: Auditoria CTE / NBR: verificação de ventilação, acessibilidade e clash detection (BIM heal | F6 | Must |
| FR-007 | El sistema implementa: Exportadores: DXF (AC1015), IFC (Open BIM 2x3), OBJ, SVG. | F7 | Must |
| FR-008 | El sistema implementa: Banco de normas e ferramentas open source curado. | F8 | Must |

## Requisitos no funcionales

| ID | Requisito | Metrica | Traza |
|---|---|---|---|
| NFR-001 | Build reproducible | `build` pasa en CI | todos |
| NFR-002 | Calidad estatica | lint + typecheck sin errores | todos |
| NFR-003 | Seguridad | 0 secretos; validacion de entrada | FR-001 |
| NFR-004 | Observabilidad | logs estructurados y errores claros | todos |
| NFR-005 | Accesibilidad (si hay UI) | WCAG 2.1 AA | FR-001 |
| NFR-006 | CI verde | workflow en cada PR | todos |

## Trazabilidad

`PRD -> FR/NFR -> tests -> verificacion`. Todo cambio actualiza la documentacion
en el mismo PR y debe pasar la suite antes de fusionar.
