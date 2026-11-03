#!/usr/bin/env python3
"""fotos_de_log.py <run_id> <dir>: saca las fotos (líneas FOTO|id|n|base64) y los pasos de cada trabajo de una ejecución."""
import base64, json, os, re, subprocess, sys
run, out = sys.argv[1], sys.argv[2]
repo = "guardianagroup/guardiana"
jobs = json.loads(subprocess.check_output(["gh", "api", f"repos/{repo}/actions/runs/{run}/jobs", "--jq", "[.jobs[] | {id, name, conclusion}]"]))
for j in jobs:
    nombre = re.sub(r"[^a-z0-9]+", "-", j["name"].lower()).strip("-")
    d = os.path.join(out, nombre); os.makedirs(d, exist_ok=True)
    log = subprocess.run(["gh", "api", f"repos/{repo}/actions/jobs/{j['id']}/logs"], capture_output=True).stdout.decode("utf-8", "replace")
    open(os.path.join(d, "registro.txt"), "w").write(log)
    trozos = {}
    pasos = []
    en_pasos = False
    for linea in log.splitlines():
        cuerpo = re.sub(r"^\S+Z ", "", linea)
        if cuerpo.startswith("FOTO|"):
            _, fid, n, datos = cuerpo.split("|", 3)
            trozos.setdefault(fid, {})[int(n)] = datos.strip()
        elif cuerpo.startswith("##[group]ventanas y pasos"):
            en_pasos = True
        elif cuerpo.startswith("##[endgroup]"):
            en_pasos = False
        elif en_pasos:
            pasos.append(cuerpo)
    for fid, partes in trozos.items():
        b = "".join(partes[i] for i in sorted(partes))
        open(os.path.join(d, fid + ".jpg"), "wb").write(base64.b64decode(b))
    open(os.path.join(d, "pasos.txt"), "w").write("\n".join(pasos))
    print(f"{j['name']} ({j['conclusion']}): {len(trozos)} fotos, {len(pasos)} pasos -> {d}")
