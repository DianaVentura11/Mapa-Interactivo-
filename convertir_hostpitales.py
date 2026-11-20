
import pandas as pd
import json

# Leer el archivo de Excel
df = pd.read_excel("hospitales.xlsx")

# Limpiar los nombres de las columnas
df.columns = df.columns.str.strip()

# Convertir coordenadas a números
df["LATITUD"] = pd.to_numeric(df["LATITUD"], errors="coerce")
df["LONGITUD"] = pd.to_numeric(df["LONGITUD"], errors="coerce")

# Filtrar hospitales en operación con coordenadas
hospitales = df[
    (df["NOMBRE TIPO ESTABLECIMIENTO"].str.strip().str.upper() == "DE HOSPITALIZACIÓN") &
    (df["ESTATUS DE OPERACION"].str.strip().str.upper() == "EN OPERACION") &
    (df["LATITUD"].notna()) &
    (df["LONGITUD"].notna())
].copy()

# Crear estructura GeoJSON
features = []

for _, fila in hospitales.iterrows():
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                float(fila["LONGITUD"]),
                float(fila["LATITUD"])
            ]
        },
        "properties": {
            "nombre": str(fila["NOMBRE DE LA UNIDAD"]),
            "entidad": str(fila["ENTIDAD"]),
            "municipio": str(fila["MUNICIPIO"]),
            "institucion": str(fila["NOMBRE DE LA INSTITUCION"]),
            "nivel": str(fila["NIVEL ATENCION"]),
            "clues": str(fila["CLUES"])
        }
    }

    features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

# Guardar archivo
with open("data/hospitales.geojson", "w", encoding="utf-8") as archivo:
    json.dump(geojson, archivo, ensure_ascii=False)

print("Conversión terminada")
print("Hospitales encontrados:", len(features))
