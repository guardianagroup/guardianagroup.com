#!/usr/bin/env python3
"""Relieve bajo los cables (owner, 22 Oct 2026, 15:23: «la profundidad a la que está el cable submarino, y también el de
tierra»): para cada tramo de cable submarino, la profundidad máxima y media del fondo por donde pasa, la parte del
recorrido en plataforma continental (menos de 200 m, donde el cable va enterrado) y un perfil de 24 muestras; para cada
tramo de fibra terrestre, la altitud máxima y media y su perfil.

Fuente: ETOPO 2022 (NOAA NCEI), relieve global a 60 segundos de arco (≈ 1,8 km), dominio público. Se descarga una vez
(se guarda en caché en el runner) y se consulta en memoria.

Salida: orbita/datos/cables-relieve.json y orbita/datos/fibra-relieve.json, cada tramo bajo una clave calculada de sus
propias coordenadas (número de puntos y suma de lon·1000 + lat·1000 redondeados), la misma que calcula capas.js, para
que el dato sobreviva a cualquier regeneración de cables.json que no cambie la geometría.
"""
import json, math, os, sys, time, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
DATOS = os.path.join(RAIZ, 'orbita', 'datos')
CACHE = os.path.join(os.path.expanduser('~'), '.cache', 'etopo')
URL = os.environ.get('ETOPO_URL') or 'https://www.ngdc.noaa.gov/thredds/fileServer/global/ETOPO2022/60s/60s_surface_elev_netcdf/ETOPO_2022_v1_60s_N90W180_surface.nc'
PASO_KM = 4.0      # sampling step along each line
PERFIL = 24        # samples kept for the little profile


def clave(l):
    """The same key capas.js computes: n points + sum of rounded lon/lat ×1000 (as integers)."""
    s = 0
    for lon, lat in l:
        s += int(round(lon * 1000)) + int(round(lat * 1000))
    return '%d:%d' % (len(l), s)


def descarga():
    os.makedirs(CACHE, exist_ok=True)
    f = os.path.join(CACHE, os.path.basename(URL))
    if os.path.exists(f) and os.path.getsize(f) > 100_000_000:
        print('ETOPO en caché:', f, os.path.getsize(f) // 1_000_000, 'MB'); return f
    print('descargando ETOPO 2022 60s…', URL)
    t0 = time.time()
    urllib.request.urlretrieve(URL, f + '.parte')
    os.replace(f + '.parte', f)
    print('descargado en %.0f s: %d MB' % (time.time() - t0, os.path.getsize(f) // 1_000_000))
    return f


def carga(f):
    import numpy as np
    from netCDF4 import Dataset
    ds = Dataset(f)
    v = ds.variables['z']
    lat = ds.variables['lat'][:]; lon = ds.variables['lon'][:]
    print('rejilla', v.shape, 'lat', float(lat[0]), float(lat[-1]), 'lon', float(lon[0]), float(lon[-1]))
    z = np.asarray(v[:], dtype=np.int16)   # metres, ±32 km is plenty
    return z, float(lat[0]), float(lat[-1]), float(lon[0]), float(lon[-1])


class Relieve:
    def __init__(self, z, lat0, lat1, lon0, lon1):
        import numpy as np
        self.np = np; self.z = z
        self.nlat, self.nlon = z.shape
        self.lat0, self.lat1, self.lon0, self.lon1 = lat0, lat1, lon0, lon1

    def muestra(self, lons, lats):
        np = self.np
        la = np.clip(((np.asarray(lats) - self.lat0) / (self.lat1 - self.lat0) * (self.nlat - 1)).round().astype(int), 0, self.nlat - 1)
        lo = ((np.asarray(lons) - self.lon0) / (self.lon1 - self.lon0) * (self.nlon - 1)).round().astype(int) % self.nlon
        return self.z[la, lo]


def densifica(l):
    """Points every PASO_KM along the polyline (great circle between vertices), as (lons, lats)."""
    lons, lats = [], []
    R = 6371.0
    for i in range(len(l)):
        lon, lat = l[i]
        if i == 0:
            lons.append(lon); lats.append(lat); continue
        plon, plat = l[i - 1]
        f1, f2 = math.radians(plat), math.radians(lat); dl = math.radians(lon - plon)
        h = math.sin((f2 - f1) / 2) ** 2 + math.cos(f1) * math.cos(f2) * math.sin(dl / 2) ** 2
        d = 2 * R * math.asin(min(1, math.sqrt(h)))
        n = max(1, int(d / PASO_KM))
        for k in range(1, n + 1):
            t = k / n
            lons.append(plon + (lon - plon) * t); lats.append(plat + (lat - plat) * t)
    return lons, lats


def perfil(vals, n):
    import numpy as np
    if len(vals) <= n: return [int(v) for v in vals]
    idx = np.linspace(0, len(vals) - 1, n).round().astype(int)
    return [int(vals[i]) for i in idx]


def cables(rel):
    p = os.path.join(DATOS, 'cables.json')
    c = json.load(open(p, encoding='utf-8'))
    out, n = {}, 0
    for s in c.get('cables', []):
        l = s.get('l') or []
        if len(l) < 2: continue
        lons, lats = densifica(l)
        z = rel.muestra(lons, lats)
        mar = z[z < 0]
        if len(mar) == 0: continue
        prof = -mar
        out[clave(l)] = {
            'max': int(prof.max()), 'med': int(prof.mean()),
            'plataforma': int(round(100 * (prof < 200).sum() / len(z))),   # % of the route shallower than 200 m
            'abisal': int(round(100 * (prof > 4000).sum() / len(z))),       # % deeper than 4000 m
            'perfil': perfil([-v if v < 0 else 0 for v in z], PERFIL),
        }
        n += 1
    salida = {'fuente': 'ETOPO 2022 (NOAA NCEI), 60 segundos de arco, dominio público', 'generado': time.strftime('%Y-%m-%dT%H:%MZ', time.gmtime()), 'paso_km': PASO_KM, 'tramos': out}
    json.dump(salida, open(os.path.join(DATOS, 'cables-relieve.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('cables con relieve:', n)


def fibra(rel):
    p = os.path.join(DATOS, 'fibra-tierra.json')
    if not os.path.exists(p): print('sin fibra-tierra.json'); return
    f = json.load(open(p, encoding='utf-8'))
    out, n = {}, 0
    for s in f.get('lineas', []):
        l = s.get('l') or []
        if len(l) < 2: continue
        lons, lats = densifica(l)
        z = rel.muestra(lons, lats)
        tierra = z[z > -1]
        if len(tierra) == 0: continue
        out[clave(l)] = {'max': int(tierra.max()), 'med': int(tierra.mean()), 'min': int(max(0, tierra.min())), 'perfil': perfil([int(v) if v > 0 else 0 for v in z], PERFIL)}
        n += 1
    salida = {'fuente': 'ETOPO 2022 (NOAA NCEI), 60 segundos de arco, dominio público', 'generado': time.strftime('%Y-%m-%dT%H:%MZ', time.gmtime()), 'paso_km': PASO_KM, 'tramos': out}
    json.dump(salida, open(os.path.join(DATOS, 'fibra-relieve.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('tramos de fibra con relieve:', n)


def main():
    f = descarga()
    rel = Relieve(*carga(f))
    cables(rel); fibra(rel)


if __name__ == '__main__':
    main()
