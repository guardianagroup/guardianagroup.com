# La VPN de GUARDIANA en Núremberg y en Miami

Cada servidor es una salida real en su país, con su propio nombre (la tabla del programa está en
`crates/tunel/src/salidas.rs` del repositorio `guardianagroup/guardiana`):

| Salida | Servidor | Su motor | Nombre de la VPN | IP |
| --- | --- | --- | --- | --- |
| Helsinki (Finlandia) | Hetzner | motor-hel.guardianagroup.com | vpn.guardianagroup.com | 62.238.17.121 |
| Núremberg (Alemania) | Hetzner | motor.guardianagroup.com | vpn-nbg.guardianagroup.com | 168.119.225.147 |
| Miami (Estados Unidos) | Vultr | motor-am.guardianagroup.com | vpn-mia.guardianagroup.com | 144.202.36.32 |

Helsinki ya la tiene y no cambia.

## 1. Los dos registros DNS (Porkbun)

Antes de nada, en Porkbun, dominio guardianagroup.com, dos registros nuevos de tipo **A**:

- **vpn-nbg** → 168.119.225.147
- **vpn-mia** → 144.202.36.32

Sin ellos el servidor no puede sacar el certificado de su nombre y el programa no puede conectar. Están puestos desde el
5 Nov 2026.

## 2. La instalación en cada servidor: sola

Desde el 5 Nov 2026 no hace falta entrar en la consola: con los registros DNS puestos, Núremberg y Miami montan su VPN
solos, con su nombre, en la actualización automática (cada 15 minutos, desde la rama `main`) en la que llega este
cambio del instalador. Es la misma instalación que la de las órdenes de abajo. Se intenta esa vez: si falla, no se
reintenta sola hasta el siguiente cambio de `instalar.sh` (uno de `vpn.sh` solo la relanza si el servidor ya llegó a
crear `/etc/guardiana/vpn`), así que se comprueba desde fuera que
`https://vpn-nbg.guardianagroup.com/vpn/alta` y `https://vpn-mia.guardianagroup.com/vpn/alta` contestan
`{"v":1,"ip":…}`. Después, cada servidor sigue con el nombre que guardó.

Las órdenes sirven para hacerlo al momento, sin esperar a la actualización (en la consola de cada servidor, como root).
No se pegan mientras la instalación automática está en marcha: las dos se estorbarían.

Núremberg (Hetzner):

```
curl -fsSL https://raw.githubusercontent.com/guardianagroup/guardianagroup.com/main/zero-motor/instalar.sh | VPN_NOMBRE=vpn-nbg.guardianagroup.com bash -s -- motor.guardianagroup.com
```

Miami (Vultr):

```
curl -fsSL https://raw.githubusercontent.com/guardianagroup/guardianagroup.com/main/zero-motor/instalar.sh | VPN_NOMBRE=vpn-mia.guardianagroup.com bash -s -- motor-am.guardianagroup.com
```

Tarda: la primera vez compila el programa del alta (hasta unos 40 minutos en un servidor pequeño). El motor y las
llamadas siguen funcionando mientras compila; se cortan un momento al empezar y al terminar, cuando el instalador
reinicia sus servicios. Al final dice «La VPN responde en https://vpn-…/vpn/alta».

Si la orden se pega en el servidor equivocado, se para al empezar y dice qué servidor es: no cambia nada.

## Qué deja en el servidor

- WireGuard (`wg0`, UDP 51820), su resolutor (Unbound, solo para el túnel) y el alta de GUARDIANA, que solo escucha en
  la propia máquina, detrás de Caddy. Sin registros: ni quién se conecta ni a dónde va.
- El nombre de la VPN guardado en `/etc/guardiana/vpn/nombre`: con él, la actualización automática de cada 15 minutos
  vuelve a montar la misma VPN.
- Puerto 25 cerrado desde el túnel, un equipo no ve a otro, y un tope de conexiones nuevas por equipo.

Lo prueba de verdad, antes de llegar a los servidores: `.github/workflows/vpn-servidor.yml`
(`zero-motor/pruebas/vpn-servidor.sh`).
