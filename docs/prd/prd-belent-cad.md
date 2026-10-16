# PRD -- belent-cad
Fecha: 2026-09-25 | Estado: Draft (auditoria automatica, requiere revision humana) | Autor: auditoria belentani7 (NOIACORE)

## 1. Problema

**Ferramenta CAD de código aberto para arquitetos — digitalização de esboços em papel para modelos 3D, renders fotorrealistas e banco de normas.**

## 2. Usuarios objetivo

- **Primario**: usuario final que necesita resolver el caso de uso de belent-cad.
- **Secundario**: equipo/persona que mantiene y despliega el proyecto.
- **Terciario**: agentes CLI que operan sobre el repositorio.

## 3. Features (MoSCoW)

| ID | Feature | MoSCoW |
|---|---|---|
| F1 | Editor CAD 2D com camadas, orto, snap, cotas e bloco de símbolos. | Must |
| F2 | Maqueta 3D interativa (Three.js) com corte, óptica de câmera e iluminação fotométrica. | Must |
| F3 | Boceto → 3D: digitaliza desenhos em papel (canvas/branco ou upload) e os converte em planta vetorial. | Must |
| F4 | Estúdio fotorrealista com presets de luz, materiais e comparação antes/depois. | Must |
| F5 | Lâminas ISO 5457 / NBR 6492 com carimbo, quadro de áreas e exportação SVG/PDF. | Must |
| F6 | Auditoria CTE / NBR: verificação de ventilação, acessibilidade e clash detection (BIM health score). | Must |
| F7 | Exportadores: DXF (AC1015), IFC (Open BIM 2x3), OBJ, SVG. | Must |
| F8 | Banco de normas e ferramentas open source curado. | Must |
| F90 | Checklist de produccion (build, tests, deploy, seguridad) | Should |
| F91 | Documentacion viva (esta cadena) | Must |

## 4. Criterios de aceptacion (GWT)

### F1 -- Editor CAD 2D com camadas, orto, snap, cotas e bloco de símb
- Given el usuario en el contexto de belent-cad / When usa Editor CAD 2D com camadas, orto, snap, cotas e blo / Then obtiene el resultado esperado sin error.
- Given entrada invalida / When la envia / Then recibe un error generico y el detalle queda en logs.

### F2 -- Maqueta 3D interativa (Three.js) com corte, óptica de câmera
- Given el usuario en el contexto de belent-cad / When usa Maqueta 3D interativa (Three.js) com corte, óptica / Then obtiene el resultado esperado sin error.
- Given entrada invalida / When la envia / Then recibe un error generico y el detalle queda en logs.

### F3 -- Boceto → 3D: digitaliza desenhos em papel (canvas/branco ou 
- Given el usuario en el contexto de belent-cad / When usa Boceto → 3D: digitaliza desenhos em papel (canvas/ / Then obtiene el resultado esperado sin error.
- Given entrada invalida / When la envia / Then recibe un error generico y el detalle queda en logs.

### F4 -- Estúdio fotorrealista com presets de luz, materiais e compar
- Given el usuario en el contexto de belent-cad / When usa Estúdio fotorrealista com presets de luz, materiai / Then obtiene el resultado esperado sin error.
- Given entrada invalida / When la envia / Then recibe un error generico y el detalle queda en logs.


## 5. Metricas de exito

- Build reproducible en un comando.
- CI verde en cada PR.
- Cero secretos en el repositorio.
- Documentacion actualizada en el mismo PR que el codigo.

## 6. Out of scope

- Funcionalidad no descrita en el README vigente.
- Cambios que rompan compatibilidad sin ADR que lo justifique.
