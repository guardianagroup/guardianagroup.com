#!/usr/bin/env python3
"""Conectividad por país para la ficha de Órbita (ronda 94 de la agencia; el dueño, 17 nov 2026: «ok»).

Solo dos fuentes, con su licencia comprobada en su propia página (herramientas/agencia-rondas/ronda94/claude.md):

- Banco Mundial, IT.NET.USER.ZS: porcentaje de personas que usan internet, dato de la UIT. CC BY 4.0, citando a la UIT.
  https://data.worldbank.org/indicator/IT.NET.USER.ZS
- M-Lab, «Monthly Stats»: medianas mensuales por país de las pruebas NDT (bajada, subida, latencia mínima, pérdida de
  paquetes), el mes cerrado más reciente. CC0 1.0. https://www.measurementlab.net/data
  Miden a quien hace la prueba, no a todo el país: un país con menos de MIN_PRUEBAS pruebas en el mes no sale.

Escribe orbita/datos/conectividad.json. Si una fuente falla, se queda lo que ya había de ella: un fallo nunca borra un
dato. Corre en GitHub (.github/workflows/conectividad.yml); el navegador del visitante no pide nada a nadie.
"""
import datetime
import io
import json
import math
import os
import sys
import urllib.error
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'orbita', 'datos', 'conectividad.json')
PAISES = os.path.join(RAIZ, 'orbita', 'datos', 'paises.json')
CABECERAS = {'User-Agent': 'GUARDIANA-datos/1.0 (+https://guardianagroup.com)'}
MIN_PRUEBAS = 300

BM_URL = 'https://api.worldbank.org/v2/country/all/indicator/IT.NET.USER.ZS?format=json&per_page=20000&mrnev=1'
MLAB_BASE = 'https://storage.googleapis.com/mlab-sandbox-iqb-us-central1/cache/v1'


def baja(url, tiempo=90):
    req = urllib.request.Request(url, headers=CABECERAS)
    with urllib.request.urlopen(req, timeout=tiempo) as r:
        return r.read()


def banco_mundial(validos):
    """{CC: [porcentaje, año]} con el último año que tiene dato de cada país."""
    cuerpo = json.loads(baja(BM_URL))
    if not isinstance(cuerpo, list) or len(cuerpo) < 2 or not isinstance(cuerpo[1], list):
        raise RuntimeError('Banco Mundial: respuesta inesperada')
    out = {}
    for f in cuerpo[1]:
        pais = (f.get('country') or {}).get('id') or ''
        cc = pais.upper() if len(pais) == 2 else ''
        v, anio = f.get('value'), str(f.get('date') or '')
        if cc in validos and isinstance(v, (int, float)) and anio.isdigit() and 0 <= v <= 100:
            out[cc] = [round(float(v), 1), int(anio)]
    if len(out) < 100:
        raise RuntimeError(f'Banco Mundial: solo {len(out)} países (¿cambió el formato?)')
    return out


def mlab(validos):
    """(mes, {CC: {bajada, subida, latencia, perdida, pruebas}}) del mes cerrado más reciente con los dos archivos.

    Los archivos están donde los enlaza la página de M-Lab (https://measurementlab.net/data/stats):
    MLAB_BASE/{inicio}/{fin}/{downloads|uploads}_by_country/data.parquet, un mes natural cada uno. M-Lab va de 4 a 8
    semanas por detrás: se prueban los cinco meses anteriores al actual, del más reciente al más antiguo.
    """
    import pandas as pd  # solo en GitHub (pip install pandas pyarrow)

    hoy = datetime.date.today()
    mes = crudo_b = crudo_s = None
    for atras in range(1, 6):
        y, m = hoy.year, hoy.month - atras
        while m <= 0:
            m += 12
            y -= 1
        ini = f'{y:04d}{m:02d}01T000000Z'
        fin = f'{y + (m == 12):04d}{m % 12 + 1:02d}01T000000Z'
        try:
            crudo_b = baja(f'{MLAB_BASE}/{ini}/{fin}/downloads_by_country/data.parquet', 180)
            crudo_s = baja(f'{MLAB_BASE}/{ini}/{fin}/uploads_by_country/data.parquet', 180)
        except urllib.error.HTTPError as e:
            if e.code in (403, 404):
                continue
            raise
        mes = f'{y:04d}-{m:02d}'
        break
    if not mes:
        raise RuntimeError('M-Lab: ninguno de los últimos cinco meses tiene los dos archivos por país')
    bajada = pd.read_parquet(io.BytesIO(crudo_b))
    subida = pd.read_parquet(io.BytesIO(crudo_s))
    for col in ('country_code', 'download_p50', 'latency_p50', 'loss_p50', 'sample_count'):
        if col not in bajada.columns:
            raise RuntimeError(f'M-Lab: falta la columna {col} en la bajada')
    for col in ('country_code', 'upload_p50', 'sample_count'):
        if col not in subida.columns:
            raise RuntimeError(f'M-Lab: falta la columna {col} en la subida')
    sube = {str(r.country_code).upper(): (float(r.upload_p50), int(r.sample_count)) for r in subida.itertuples()}
    out = {}
    for r in bajada.itertuples():
        cc = str(r.country_code).upper()
        if cc not in validos or int(r.sample_count) < MIN_PRUEBAS:
            continue
        if not all(math.isfinite(float(x)) for x in (r.download_p50, r.latency_p50, r.loss_p50)):
            continue
        fila = {
            'bajada': round(float(r.download_p50), 1),
            'latencia': round(float(r.latency_p50)),
            'perdida': round(float(r.loss_p50) * 100, 2),
            'pruebas': int(r.sample_count),
        }
        if cc in sube and sube[cc][1] >= MIN_PRUEBAS and math.isfinite(sube[cc][0]):
            fila['subida'] = round(sube[cc][0], 1)
        out[cc] = fila
    if len(out) < 50:
        raise RuntimeError(f'M-Lab: solo {len(out)} países con {MIN_PRUEBAS} pruebas o más (¿cambió el formato?)')
    return mes, out


def main():
    validos = set(json.load(open(PAISES, encoding='utf-8')).get('paises', {}).keys())
    try:
        antes = json.load(open(SALIDA, encoding='utf-8'))
    except (OSError, ValueError):
        antes = {}
    datos = {
        'nota': 'Conectividad por país (ronda 94). Banco Mundial (dato de la UIT, CC BY 4.0) y M-Lab (CC0 1.0). '
                'M-Lab mide a quien hace la prueba, no a todo el país; un país con menos de '
                f'{MIN_PRUEBAS} pruebas en el mes no sale.',
        'fuentes': {
            'internet': {'nombre': 'Banco Mundial · UIT', 'licencia': 'CC BY 4.0',
                         'url': 'https://data.worldbank.org/indicator/IT.NET.USER.ZS'},
            'velocidad': {'nombre': 'M-Lab (NDT)', 'licencia': 'CC0 1.0', 'url': 'https://www.measurementlab.net/data'},
        },
        'internet': antes.get('internet', {}),
        'mlab_mes': antes.get('mlab_mes'),
        'velocidad': antes.get('velocidad', {}),
    }
    fallos = 0
    try:
        datos['internet'] = banco_mundial(validos)
        print('Banco Mundial:', len(datos['internet']), 'países')
    except Exception as e:  # noqa: BLE001 — una fuente que falla deja lo que había
        fallos += 1
        print('Banco Mundial: falló, se queda lo anterior:', e, file=sys.stderr)
    try:
        datos['mlab_mes'], datos['velocidad'] = mlab(validos)
        print('M-Lab:', datos['mlab_mes'], len(datos['velocidad']), 'países')
    except Exception as e:  # noqa: BLE001
        fallos += 1
        print('M-Lab: falló, se queda lo anterior:', e, file=sys.stderr)
    if fallos == 2 and not antes:
        sys.exit('Ninguna fuente respondió y no había datos: no se escribe nada')
    # the date moves only when a figure did, so a week with nothing new leaves the file as it was
    igual = {k: v for k, v in antes.items() if k != 'actualizado'} == datos
    datos['actualizado'] = antes.get('actualizado') if igual and antes.get('actualizado') else \
        datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, 'w', encoding='utf-8') as f:
        json.dump(datos, f, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
        f.write('\n')
    print('escrito', SALIDA)


if __name__ == '__main__':
    main()
