#  Mapa Interactivo de México

## Descripción

Este proyecto consiste en un mapa interactivo de México que permite visualizar información sociodemográfica de las 32 entidades federativas, así como la ubicación de diferentes hospitales en el territorio nacional.

El objetivo es facilitar la consulta y comparación de información mediante una representación geográfica e interactiva.

## Funcionalidades

- Visualización de los 32 estados de México.
- Consulta de diferentes indicadores mediante un selector.
- Representación de datos mediante colores en el mapa.
- Información detallada al seleccionar cada estado.
- Visualización de hospitales mediante marcadores geográficos.
- Agrupación de hospitales cercanos para facilitar su visualización.
- Opción para activar o desactivar la capa de hospitales.
- Leyenda que permite interpretar los colores y datos mostrados.

## Indicadores disponibles

- Población total (2020).
- Población femenina (2020).
- Población masculina (2020).
- Viviendas (2020).
- Población en situación de pobreza (2022).
- Grado promedio de escolaridad (2020).

## Tecnologías utilizadas

- HTML5: estructura de la página.
- CSS3: diseño y estilos visuales.
- JavaScript: funcionamiento e interacción del mapa.
- Leaflet: visualización del mapa.
- GeoJSON: almacenamiento de información geográfica.
- MarkerCluster: agrupación de hospitales cercanos.

## Estructura del proyecto

```text
MAPAS/
│
├── index.html
│
├── css/
│   └── estilos.css
│
├── js/
│   └── app.js
│
└── data/
    ├── estados.geojson
    ├── indicadores.json
    └── hospitales.geojson
```

## Visualización del proyecto

El mapa se encuentra publicado mediante GitHub Pages:

**[Abrir Mapa Interactivo de México](https://dianaventura11.github.io/Mapa-Interactivo-/)**

## Ejecución local

1. Descargar o clonar este repositorio.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Ejecutar `index.html` utilizando Live Server.
4. Explorar los indicadores y la ubicación de los hospitales.

## INTEGRANTES
Diana Isabel González Ventura
Andrea Elizabeth Orta Pedroza
