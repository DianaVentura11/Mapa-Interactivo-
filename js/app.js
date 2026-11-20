
console.log("Iniciando mapa...");

// Crear el mapa
const mapa = L.map('mapa').setView([23.6345, -102.5528], 5);

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(mapa);

// Elementos HTML
const selector = document.getElementById('indicador');
const leyenda = document.getElementById('contenido-leyenda');

// Colores
const colores = [
    '#eff6ff',
    '#bfdbfe',
    '#60a5fa',
    '#2563eb',
    '#1e3a8a'
];

// Variables
let capaEstados;
let datosEstados;
let indicadorActual = 'pob';

// Nombres de indicadores
function obtenerNombreIndicador(indicador) {

    const nombres = {
        pob: 'Población total (2020)',
        pob_fem: 'Población femenina (2020)',
        pob_mas: 'Población masculina (2020)',
        viv: 'Viviendas (2020)',
        pobreza: 'Población en pobreza (2022)',
        escolaridad: 'Grado promedio de escolaridad (2020)'
    };

    return nombres[indicador] || indicador;
}

// Obtener valores disponibles
function obtenerValores() {

    if (!datosEstados) return [];

    return datosEstados.features
        .map(feature => Number(feature.properties[indicadorActual]))
        .filter(valor => Number.isFinite(valor))
        .sort((a, b) => a - b);

}

// Obtener color
function obtenerColor(valor, valores) {

    if (valores.length === 0 || !Number.isFinite(valor)) {
        return '#d1d5db';
    }

    const limites = [0.2, 0.4, 0.6, 0.8];

    let nivel = limites.filter(porcentaje => {

        const posicion = Math.floor(
            porcentaje * (valores.length - 1)
        );

        return valor > valores[posicion];

    }).length;

    return colores[nivel];

}

// Estilo de los estados
function estiloEstado(feature) {

    const valor = Number(feature.properties[indicadorActual]);
    const valores = obtenerValores();

    return {
        fillColor: obtenerColor(valor, valores),
        color: '#ffffff',
        weight: 1.5,
        fillOpacity: 0.8
    };

}

// Actualizar leyenda
function actualizarLeyenda() {

    const valores = obtenerValores();

    if (valores.length === 0) {

        leyenda.innerHTML = `
            <p>No hay datos disponibles para este indicador.</p>
        `;

        return;
    }

    const minimo = valores[0];
    const maximo = valores[valores.length - 1];

    const esPorcentaje = indicadorActual === 'pobreza';

    leyenda.innerHTML = `
        <p><strong>${obtenerNombreIndicador(indicadorActual)}</strong></p>

        <div style="display:flex; gap:5px; margin:10px 0;">
            ${colores.map(color => `
                <div style="
                    background:${color};
                    height:22px;
                    flex:1;
                    border-radius:3px;
                "></div>
            `).join('')}
        </div>

        <div style="display:flex; justify-content:space-between;">
            <small>
                ${minimo.toLocaleString('es-MX')}${esPorcentaje ? '%' : ''}
            </small>

            <small>
                ${maximo.toLocaleString('es-MX')}${esPorcentaje ? '%' : ''}
            </small>
        </div>

        <small>De menor a mayor valor</small>
    `;

}

// Actualizar mapa
function actualizarMapa() {

    if (!capaEstados) return;

    capaEstados.setStyle(estiloEstado);

    actualizarLeyenda();

}

// Mostrar información del estado
function mostrarDetalle(feature) {

    const nombre = feature.properties.nom_agee;
    const clave = feature.properties.cve_agee;

    const valor = Number(feature.properties[indicadorActual]);

    const formato = Number.isFinite(valor)
        ? valor.toLocaleString('es-MX') +
          (indicadorActual === 'pobreza' ? '%' : '')
        : 'Sin información';

    document.getElementById('panel').innerHTML = `
        <h2>${nombre}</h2>

        <p><strong>Clave:</strong> ${clave}</p>

        <p><strong>${obtenerNombreIndicador(indicadorActual)}:</strong></p>

        <p>${formato}</p>
    `;

}

// Cargar los dos archivos
Promise.all([

    fetch('data/estados.geojson').then(respuesta => {

        if (!respuesta.ok) {
            throw new Error('No se encontró estados.geojson');
        }

        return respuesta.json();

    }),

    fetch('data/indicadores.json').then(respuesta => {

        if (!respuesta.ok) {
            throw new Error('No se encontró indicadores.json');
        }

        return respuesta.json();

    })

])

.then(([geojson, indicadores]) => {

    console.log('Estados cargados:', geojson.features.length);
    console.log('Indicadores cargados:', indicadores.length);

    // Relacionar indicadores por clave
    const datosPorEstado = {};

    indicadores.forEach(dato => {

        datosPorEstado[dato.cve_agee] = dato;

    });

    // Agregar los indicadores al GeoJSON
    geojson.features.forEach(feature => {

        const clave = feature.properties.cve_agee;

        const indicador = datosPorEstado[clave];

        if (indicador) {

            feature.properties.pobreza = indicador.pobreza;
            feature.properties.escolaridad = indicador.escolaridad;

        }

    });

    // Guardar datos completos
    datosEstados = geojson;

    console.log('Datos unidos correctamente.');
    console.log('Primer estado:', datosEstados.features[0].properties);

    // Comprobar que existan los datos
    const estadosSinDatos = datosEstados.features.filter(feature => {

        return !Number.isFinite(Number(feature.properties.pobreza)) ||
               !Number.isFinite(Number(feature.properties.escolaridad));

    });

    console.log('Estados con indicadores faltantes:', estadosSinDatos.map(f => f.properties.nom_agee));

    // Crear capa de estados
    capaEstados = L.geoJSON(datosEstados, {

        style: estiloEstado,

        onEachFeature: function(feature, layer) {

            const nombre = feature.properties.nom_agee;

            // Tooltip
            layer.bindTooltip(nombre);

            // Información al hacer clic
            layer.on('click', function() {

                mostrarDetalle(feature);

            });

            // Efecto al pasar el mouse
            layer.on('mouseover', function() {

                layer.setStyle({
                    weight: 3,
                    color: '#f59e0b',
                    fillOpacity: 1
                });

            });

            // Restaurar color
            layer.on('mouseout', function() {

                capaEstados.resetStyle(layer);

            });

        }

    }).addTo(mapa);

    // Ajustar mapa
    mapa.fitBounds(capaEstados.getBounds());

    // Crear leyenda
    actualizarLeyenda();

})

.catch(error => {

    console.error('Error al cargar los datos:', error);

});

// Cambiar indicador
selector.addEventListener('change', function() {

    indicadorActual = this.value;

    actualizarMapa();

});


// Cargar hospitales de México
fetch('data/hospitales.geojson')
    .then(respuesta => {
        if (!respuesta.ok) {
            throw new Error('No se pudo cargar hospitales.geojson');
        }

        return respuesta.json();
    })
    .then(datos => {

        // Crear grupo de marcadores agrupados
        const grupoHospitales = L.markerClusterGroup();

        // Agregar hospitales al grupo
        L.geoJSON(datos, {

            pointToLayer: function(feature, latlng) {
                return L.marker(latlng);
            },

            onEachFeature: function(feature, layer) {
                const hospital = feature.properties;

                layer.bindPopup(`
                    <h3>${hospital.nombre}</h3>
                    <p><strong>Estado:</strong> ${hospital.entidad}</p>
                    <p><strong>Municipio:</strong> ${hospital.municipio}</p>
                    <p><strong>Institución:</strong> ${hospital.institucion}</p>
                    <p><strong>Nivel:</strong> ${hospital.nivel}</p>
                    <p><strong>CLUES:</strong> ${hospital.clues}</p>
                `);
            }

        }).eachLayer(function(layer) {
            grupoHospitales.addLayer(layer);
        });

        // Obtener la casilla
        const controlHospitales = document.getElementById('mostrar-hospitales');

        // Mostrar hospitales inicialmente
        if (controlHospitales.checked) {
            mapa.addLayer(grupoHospitales);
        }

        // Activar o desactivar hospitales
        controlHospitales.addEventListener('change', function() {

            if (this.checked) {
                mapa.addLayer(grupoHospitales);
                console.log('Hospitales activados');
            } else {
                mapa.removeLayer(grupoHospitales);
                console.log('Hospitales desactivados');
            }

        });

        console.log(
            'Hospitales cargados:',
            grupoHospitales.getLayers().length
        );

    })
    .catch(error => {
        console.error('Error al cargar hospitales:', error);
    });
