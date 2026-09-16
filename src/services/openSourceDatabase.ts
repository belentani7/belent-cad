import { OpenSourceTool } from '../types/cad';

export const OPEN_SOURCE_TOOLS: OpenSourceTool[] = [
  {
    id: 'blueprint3d',
    name: 'Blueprint3D (Deep Learning Pipeline)',
    category: '2d-to-3d',
    badge: 'Pipeline 2D → 3D',
    repoUrl: 'https://github.com/ashnomad/Blueprint3D',
    license: 'MIT',
    techStack: ['Python', 'PyTorch', 'OpenCV', 'PyVista'],
    stars: '2.4k',
    description: {
      es: 'Pipeline completo de deep learning que convierte imágenes de planos en modelos 3D interactivos. Contiene módulos especializados: SplitFloor (segmenta muros, puertas y ventanas), SemaFloor (clasifica estancias) y ForgeFloor (extruye el modelo volumétrico 3D).',
      pt: 'Pipeline completo de deep learning que converte plantas baixas em modelos 3D interativos. Possui 3 módulos: SplitFloor (detecta paredes, portas, janelas), SemaFloor (detecta cômodos) e ForgeFloor (extrude o modelo 3D).',
      en: 'Complete deep learning pipeline converting blueprint images into interactive 3D models with wall and room segmentation.'
    },
    keyFeatures: {
      es: [
        'Segmentación semántica de muros maestros y tabiquerías',
        'Detección automática de puertas abatibles y correderas',
        'Extrusión de mallas poligonales limpias con exportación OBJ',
        'Compatible con escaneos de papel y bocetos dibujados a mano'
      ],
      pt: [
        'Segmentação semântica de paredes estruturais e divisórias',
        'Detecção de portas e janelas com aberturas precisas',
        'Extrusão direta em malhas 3D para visualizadores web',
        'Compatível com croquis manuais e fotos de prancheta'
      ],
      en: [
        'Deep semantic segmentation of architectural drawings',
        'Vector polygon extraction and 3D extrusion',
        'Open dataset integration and clean topology'
      ]
    },
    commandExample: 'git clone https://github.com/ashnomad/Blueprint3D && pip install -r requirements.txt && python ForgeFloor/extruder.py'
  },
  {
    id: 'floorplan-to-3d',
    name: 'Floorplan-to-3D (CubiCasa5K)',
    category: '2d-to-3d',
    badge: 'ResNet-UNet + Three.js',
    repoUrl: 'https://github.com/Yytsi/floorplan-to-3d',
    license: 'Apache 2.0',
    techStack: ['Python', 'Three.js', 'ResNet-UNet', 'SVG'],
    stars: '1.8k',
    description: {
      es: 'Modelo basado en ResNet-UNet entrenado con el dataset de más de 5.000 planos arquitectónicos CubiCasa5K. Segmenta planos vectoriales y los extruye dinámicamente en Three.js en el navegador.',
      pt: 'ResNet-UNet treinado com o dataset CubiCasa5K com mais de 5.000 plantas. Segmenta plantas e as extrude para 3D diretamente com Three.js.',
      en: 'ResNet-UNet trained on CubiCasa5K dataset, extruding 2D floorplans into interactive Three.js scenes.'
    },
    keyFeatures: {
      es: [
        'Entrenado sobre 5.000 planos reales residenciales',
        'Reconocimiento de cotas y etiquetas de superficies',
        'Renderizado interactivo WebGL en tiempo real',
        'Exportación nativa a SVG y Three.js JSON'
      ],
      pt: [
        'Treinado sobre mais de 5.000 plantas residenciais reais',
        'Reconhecimento de ambientes e áreas úteis',
        'Renderização WebGL fluida e exportação vetorial'
      ],
      en: [
        'Trained on 5,000 architectural floorplans',
        'Real-time WebGL extrusion and interactive orbit'
      ]
    },
    commandExample: 'git clone https://github.com/Yytsi/floorplan-to-3d && pip install -e ".[serve]" && ./dev.sh'
  },
  {
    id: 'bim-livre',
    name: 'BIM Livre (Yorik van Havre)',
    category: 'cad-bim',
    badge: 'BIM Aberto em Português',
    repoUrl: 'https://github.com/yorikvanhavre/bimlivre',
    license: 'LGPL-2.1',
    techStack: ['FreeCAD', 'Python', 'LibreCAD', 'IFC'],
    stars: '1.2k',
    description: {
      es: 'Iniciativa pionera en idioma portugués y español liderada por Yorik van Havre (creador del módulo Arch de FreeCAD) para promover flujos de trabajo 100% de código abierto en oficinas de arquitectura.',
      pt: 'Iniciativa pioneira em português liderada por Yorik van Havre (desenvolvedor do módulo Arch do FreeCAD) para promover fluxos 100% livres de arquitetura e engenharia.',
      en: 'Open source BIM initiative for Latin America & Iberia combining FreeCAD, LibreCAD, and open IFC workflows.'
    },
    keyFeatures: {
      es: [
        'Integración completa de FreeCAD Arch/BIM y LibreCAD',
        'Plantillas adaptadas a normativas iberoamericanas',
        'Manuales y bibliotecas paramétricas de carpinterías y muros',
        'Exportación nativa a IFC 2x3 e IFC 4'
      ],
      pt: [
        'Fluxo integrado FreeCAD Arch/BIM e LibreCAD',
        'Modelagem paramétrica em conformidade com NBR 6492',
        'Bibliotecas de blocos 2D/3D gratuitas em português',
        'Intercâmbio puro via arquivos abertos IFC e DXF'
      ],
      en: [
        'Full FreeCAD Arch & LibreCAD open pipeline',
        'Native IFC2x3 / IFC4 interoperability'
      ]
    },
    commandExample: 'sudo apt install freecad librecad && git clone https://github.com/yorikvanhavre/bimlivre'
  },
  {
    id: 'freecad-arch',
    name: 'FreeCAD Architecture & BIM Workbench',
    category: 'cad-bim',
    badge: 'Modelador Paramétrico 3D',
    repoUrl: 'https://github.com/FreeCAD/FreeCAD',
    license: 'LGPL-2.0+',
    techStack: ['C++', 'Python', 'Open CASCADE', 'Qt'],
    stars: '21.5k',
    description: {
      es: 'El estándar de la vieja usanza para diseño paramétrico libre. Permite modelar con precisión mecánica y arquitectónica, generar cortes, alzados y planos acotados sin licencias comerciales.',
      pt: 'O grande padrão para desenho paramétrico de código aberto. Permite modelar com precisão milimétrica, gerar cortes e pranchas completas de arquitetura.',
      en: 'Parametric 3D modeler with dedicated Architectural and BIM workbench based on Open CASCADE.'
    },
    keyFeatures: {
      es: [
        'Muros paramétricos con capas de aislamiento y acabado',
        'Generación de planos técnicos 2D mediante TechDraw',
        'Compatibilidad con formatos STEP, IGES, DXF, SVG e IFC',
        'Comandos de consola Python para automatización de tareas'
      ],
      pt: [
        'Paredes paramétricas com camadas e espessuras reais',
        'Geração de pranchas 2D com cotas pelo TechDraw',
        'Leitura e escrita de arquivos STEP, DXF, SVG e IFC',
        'Scripting Python para projetos generativos'
      ],
      en: [
        'Parametric architectural modeling',
        'TechDraw 2D documentation with dimensions'
      ]
    },
    commandExample: 'flatpak install flathub org.freecad.FreeCAD'
  },
  {
    id: 'librecad',
    name: 'LibreCAD 2D Drafting',
    category: 'cad-bim',
    badge: 'CAD 2D Clásico',
    repoUrl: 'https://github.com/LibreCAD/LibreCAD',
    license: 'GPL-2.0',
    techStack: ['C++', 'Qt', 'libdxfrw'],
    stars: '5.9k',
    description: {
      es: 'El sucesor de código abierto del CAD clásico de mesa de dibujo. Interfaz nostálgica y eficiente con soporte total para capas, cotas, bloques DXF y entrada rápida de comandos por teclado.',
      pt: 'O autêntico software CAD clássico 2D para arquitetura. Interface focada em produtividade com suporte a camadas, cotas associativas e comandos por teclado.',
      en: 'Community-driven 2D-CAD application with full DXF support and classic line-command drafting.'
    },
    keyFeatures: {
      es: [
        'Soporte nativo para lectura y escritura de DXF R12 a R2007',
        'Snaps magnéticos a extremos, centros, intersecciones y cuadrantes',
        'Línea de comandos de alta velocidad (comandos L, C, REC, MOVE)',
        'Cero telemetría y ejecución ultra ligera'
      ],
      pt: [
        'Compatibilidade nativa com arquivos DXF do AutoCAD',
        'Snaps precisos para extremidades, pontos médios e interseções',
        'Linha de comando rápida para desenhistas experientes',
        'Consumo mínimo de memória e CPU'
      ],
      en: [
        'Native DXF support',
        'Precision snaps, layers, and keyboard command line'
      ]
    },
    commandExample: 'sudo apt install librecad'
  },
  {
    id: 'arch-ia',
    name: 'ARCH-IA (Hispanoamérica)',
    category: '2d-to-3d',
    badge: 'DXF 3D Automatizado',
    repoUrl: 'https://github.com/candelalcaide22/mi-arch-ia',
    license: 'MIT',
    techStack: ['Python', 'Streamlit', 'ezdxf', 'NumPy'],
    stars: '340',
    description: {
      es: 'Herramienta desarrollada en español que convierte coordenadas de bocetos y planos .xyz en estructuras volumétricas 3D dentro de archivos .dxf compatibles con AutoCAD y LibreCAD.',
      pt: 'Ferramenta desenvolvida em espanhol que converte dados de croquis e plantas em estruturas 3D exportáveis para arquivos .dxf padrão.',
      en: 'Converts architectural coordinate sketches into 3D DXF volumetric models.'
    },
    keyFeatures: {
      es: ['Extrusión automática de polígonos a formato DXF 3D', 'Interfaz accesible en español'],
      pt: ['Conversão de planos em DXF tridimensional', 'Pronto para LibreCAD e FreeCAD'],
      en: ['Direct 3D DXF generation from coordinates']
    },
    commandExample: 'git clone https://github.com/candelalcaide22/mi-arch-ia && pip install -r requirements.txt && streamlit run app.py'
  },
  {
    id: 'sweet-home-3d',
    name: 'Sweet Home 3D',
    category: 'cad-bim',
    badge: 'Interiorismo & Planta 2D/3D',
    repoUrl: 'https://sourceforge.net/projects/sweethome3d/',
    license: 'GPL-2.0+',
    techStack: ['Java', 'Java3D', 'WebGL'],
    stars: '3.1k',
    description: {
      es: 'Aplicación libre veterana de diseño de planos 2D con visualización 3D simultánea. Disponible en español y portugués con un catálogo de más de 1.500 modelos de mobiliario, sanitarios y carpinterías.',
      pt: 'Aplicativo livre veterano de desenho de plantas 2D com visualização 3D simultânea. Traduzido para português e espanhol com milhares de objetos 3D gratuitos.',
      en: 'Interior design application that helps you draw the plan of your house, arrange furniture and visit the results in 3D.'
    },
    keyFeatures: {
      es: [
        'Dibujo simultáneo de muros en 2D con render 3D en tiempo real',
        'Fotocomposición con luces solares y puntos de luz interior',
        'Importación de texturas y modelos OBJ, 3DS, DAE y LWS'
      ],
      pt: [
        'Desenho simultâneo de paredes 2D com renderização 3D instantânea',
        'Configuração de iluminação solar e lâmpadas artificiais',
        'Amplo acervo de móveis brasileiros e ibéricos'
      ],
      en: [
        'Simultaneous 2D and 3D navigation',
        'Extensive open library of furniture models'
      ]
    },
    commandExample: 'flatpak install flathub com.sweethome3d.SweetHome3D'
  },
  {
    id: 'neuro-arch-ai',
    name: 'NeuroArchAI Platform',
    category: 'ai-generative',
    badge: 'IA Generativa de Plantas',
    repoUrl: 'https://github.com/drrawal/NeuroArchAI-Platform',
    license: 'MIT',
    techStack: ['Python', 'LangGraph', 'CrewAI', 'FastAPI'],
    stars: '890',
    description: {
      es: 'Plataforma que genera diseños residenciales completos: planos 2D + modelos 3D interactivos a partir de descripciones en lenguaje natural. Utiliza agentes especializados y modelos de lenguaje abiertos.',
      pt: 'Plataforma que gera projetos residenciais completos: plantas 2D + modelos 3D interativos a partir de prompts em texto com agentes inteligentes.',
      en: 'Complete residential layout generator with 2D plan and 3D model outputs from natural language descriptions.'
    },
    keyFeatures: {
      es: [
        'Generación de distribuciones residenciales por texto',
        'Verificación de circulaciones y asoleamiento',
        'Mapeo de requerimientos de programa de necesidades'
      ],
      pt: [
        'Geração de layouts a partir de especificações de programa',
        'Validação de fluxos e iluminação natural',
        'Exportação direta para Three.js'
      ],
      en: ['Generative spatial layouts', 'Multi-agent architectural design']
    },
    commandExample: 'git clone https://github.com/drrawal/NeuroArchAI-Platform && pip install -r requirements.txt'
  },
  {
    id: 'ifc-web',
    name: 'That Open Platform (IFC.js / web-ifc)',
    category: 'formats-standards',
    badge: 'BIM en Navegador Web',
    repoUrl: 'https://github.com/ThatOpen/engine_components',
    license: 'Mozilla Public License 2.0',
    techStack: ['TypeScript', 'WebAssembly', 'C++', 'Three.js'],
    stars: '4.6k',
    description: {
      es: 'El motor WebAssembly más rápido del mundo para leer, manipular y exportar archivos BIM IFC (Industry Foundation Classes) directamente en el navegador con Three.js.',
      pt: 'O motor WebAssembly mais veloz para ler, modificar e renderizar arquivos IFC diretamente no navegador web sem plugins.',
      en: 'High-performance WebAssembly engine to load, navigate, and modify IFC BIM models directly in the web browser.'
    },
    keyFeatures: {
      es: [
        'Carga instantánea de archivos IFC de cientos de megabytes',
        'Acceso a propiedades de elementos constructivos (IfcWall, IfcDoor, IfcSpace)',
        'Extracción de metadatos térmicos y de materiales',
        'Renderizado acelerado por GPU con Three.js'
      ],
      pt: [
        'Carregamento ultra-rápido de modelos BIM IFC complexos',
        'Acesso total à hierarquia IFC (materiais, camadas, volumes)',
        'Filtragem por disciplinas: arquitetura, estrutura, instalações'
      ],
      en: ['Fast IFC loading with WebAssembly', 'Full building data extraction']
    },
    commandExample: 'npm install @thatopen/components three'
  }
];

export const NORMATIVAS_DATA = {
  es: [
    {
      code: 'CTE DB-SI',
      title: 'Seguridad en Caso de Incendio (España)',
      details: 'Evacuación de ocupantes, anchura mínima de pasos y puertas (mínimo 0.80m), recorridos de evacuación no superiores a 25m en fondo de saco.',
    },
    {
      code: 'CTE DB-SUA',
      title: 'Seguridad de Utilización y Accesibilidad (España)',
      details: 'Dimensiones mínimas de huecos de paso (0.80m x 2.00m libre), pasillos de anchura mínima 1.00m, radios de giro de 1.50m en estancias accesibles.',
    },
    {
      code: 'CTE DB-HS',
      title: 'Salubridad e Iluminación Natural (España)',
      details: 'Huecos de iluminación natural mínimos del 10% de la superficie útil de la estancia habitable. Ventilación obligatoria mínima del 5%.',
    },
    {
      code: 'ISO 5457',
      title: 'Formatos y Cuadros de Rotulación de Dibujo Técnico',
      details: 'Márgenes de planos estandarizados (20mm en margen de encuadernado izquierdo, 10mm en el resto). Carátulas con escala, autor y fecha.',
    }
  ],
  pt: [
    {
      code: 'ABNT NBR 9050',
      title: 'Acessibilidade a Edificações, Mobiliário e Espaços (Brasil)',
      details: 'Portas com vão livre mínimo de 0,80m x 2,10m. Corredores de uso comum com largura mínima de 1,20m. Raio de giro para cadeirantes de 1,50m.',
    },
    {
      code: 'ABNT NBR 6492',
      title: 'Representação de Projetos de Arquitetura (Brasil)',
      details: 'Padronização de linhas, hachuras, cotas, espessuras de pena (0.1, 0.2, 0.4, 0.6mm) e legendas para projetos executivos e legais.',
    },
    {
      code: 'ABNT NBR 15575',
      title: 'Desempenho de Edificações Habitacionais (Brasil)',
      details: 'Requisitos térmicos, acústicos e lumínicos para conforto e durabilidade de elementos estruturais e de vedação vertical.',
    },
    {
      code: 'RGEU',
      title: 'Regulamento Geral das Edificações Urbanas (Portugal)',
      details: 'Pé-direito livre regulamentar mínimo de 2,40m para habitação (2,70m para zonas principais). Área mínima de quartos e salas com ventilação natural.',
    }
  ],
  en: [
    {
      code: 'AIA CAD Guidelines',
      title: 'AIA CAD Layer Standard',
      details: 'Standard discipline naming: A-WALL (Walls), A-DOOR (Doors), A-GLAZ (Windows/Glazing), A-FLOR (Flooring), A-ANNO-DIMS (Dimensions).',
    },
    {
      code: 'IBC (International Building Code)',
      title: 'Building Standards & Means of Egress',
      details: 'Minimum clear width of exit access corridors and doors (32-36 inches), natural light and ventilation minimums.',
    }
  ]
};
