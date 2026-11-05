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

Sin ellos el servidor no puede sacar el certificado de su nombre y el programa no puede conectar.

## 2. Una orden en la consola de cada servidor (como root)

Núremberg (Hetzner):

```
curl -fsSL https://raw.githubusercontent.com/guardianagroup/guardianagroup.com/main/zero-motor/instalar.sh | VPN_NOMBRE=vpn-nbg.guardianagroup.com bash -s -- motor.guardianagroup.com
```

Miami (Vultr):

```
curl -fsSL https://raw.githubusercontent.com/guardianagroup/guardianagroup.com/main/zero-motor/instalar.sh | VPN_NOMBRE=vpn-mia.guardianagroup.com bash -s -- motor-am.guardianagroup.com
```

Tarda: la primera vez compila el programa del alta (hasta unos 40 minutos en un servidor pequeño). El motor y las
llamadas siguen funcionando mientras tanto. Al final dice «La VPN responde en https://vpn-…/vpn/alta».

Si la orden se pega en el servidor equivocado, se para al empezar y dice qué servidor es: no cambia nada.

## Qué deja en el servidor

- WireGuard (`wg0`, UDP 51820), su resolutor (Unbound, solo para el túnel) y el alta de GUARDIANA, que solo escucha en
  la propia máquina, detrás de Caddy. Sin registros: ni quién se conecta ni a dónde va.
- El nombre de la VPN guardado en `/etc/guardiana/vpn/nombre`: con él, la actualización automática de cada 15 minutos
  vuelve a montar la misma VPN.
- Puerto 25 cerrado desde el túnel, un equipo no ve a otro, y un tope de conexiones nuevas por equipo.

Lo prueba de verdad, antes de llegar a los servidores: `.github/workflows/vpn-servidor.yml`
(`zero-motor/pruebas/vpn-servidor.sh`).
