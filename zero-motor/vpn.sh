#!/usr/bin/env bash
# GUARDIANA · la VPN en este servidor (2 Nov 2026; dueño, 10:40: «Utilizamos el de Helsinki. Conéctalo ya»).
# La llama instalar.sh en el servidor de Helsinki (o donde exista /etc/guardiana/vpn), como root. Idempotente: se puede volver
# a ejecutar; no toca la llave del servidor si ya existe, ni quita los equipos conectados si el túnel ya está levantado.
#
# - WireGuard del núcleo: wg0, UDP 51820, red 10.66.0.0/16; el servidor y su resolutor en 10.66.0.1. La llave privada se
#   genera aquí la primera vez y no sale de esta máquina.
# - El alta de GUARDIANA (crates/tunel-servidor del programa, compilado aquí desde el commit fijado abajo, del repositorio
#   público): escucha solo en 127.0.0.1:8793, detrás de Caddy en https://vpn.guardianagroup.com/vpn/alta. Sin registros: los
#   equipos viven en la memoria del núcleo y se quitan tras 24 horas sin uso; el servicio no escribe nada en disco.
# - Unbound en 10.66.0.1, solo para la red del túnel: DNSSEC y sin registro de consultas.
# - Salida a internet con NAT. Puerto 25 cerrado (contra el spam). Desde el túnel no se llega a redes privadas ni a los
#   servicios de este servidor (salvo su resolutor), un equipo no ve a otro, y hay un tope de conexiones nuevas por equipo.
set -euo pipefail

NOMBRE="${VPN_NOMBRE:-vpn.guardianagroup.com}"
REPO_PROG="https://github.com/guardianagroup/guardiana.git"
# el programa del servidor: este commit exacto de la rama antivirus-vpn (docs/VPN.md del programa)
COMMIT="55cb598aae78b3a8fd986e24337d7c56c3bc6f49"
VB=/opt/guardiana-vpn
BIN=/usr/local/bin/guardiana-tunel-servidor
LLAVE=/etc/guardiana/vpn/servidor.key

rojo() { printf '\033[31m%s\033[0m\n' "$*" >&2; }
paso() { printf '  · %s\n' "$*"; }

[ "$(id -u)" = 0 ] || { rojo "vpn.sh: hace falta root"; exit 1; }

paso "Paquetes: WireGuard, Unbound, nftables y lo necesario para compilar"
DEBIAN_FRONTEND=noninteractive apt-get install -y -q wireguard-tools unbound nftables build-essential pkg-config git curl \
  ca-certificates >/var/log/guardiana-vpn-paquetes.log 2>&1

paso "El programa del alta (commit ${COMMIT:0:7}), compilado por un usuario sin privilegios"
id gvpn >/dev/null 2>&1 || useradd --system --create-home --home-dir "$VB" --shell /usr/sbin/nologin gvpn
install -d -o gvpn -g gvpn -m 755 "$VB"
hecho="$VB/compilado-$COMMIT"
if [ ! -x "$BIN" ] || [ ! -f "$hecho" ]; then
  sudo -u gvpn -H bash -euo pipefail -c '
    cd "$HOME"
    if [ ! -x "$HOME/.cargo/bin/cargo" ]; then
      curl -sSf --proto "=https" --tlsv1.2 https://sh.rustup.rs -o rustup-init.sh
      sh rustup-init.sh -y -q --profile minimal --default-toolchain stable --no-modify-path
      rm -f rustup-init.sh
    fi
    rm -rf src && mkdir src && cd src
    git init -q
    git fetch -q --depth 1 "'"$REPO_PROG"'" "'"$COMMIT"'"
    git checkout -q FETCH_HEAD
    [ "$(git rev-parse HEAD)" = "'"$COMMIT"'" ] || { echo "el commit no es el fijado" >&2; exit 1; }
    CARGO_TARGET_DIR="$HOME/target" "$HOME/.cargo/bin/cargo" build -q --release --locked -j 2 \
      -p guardiana-tunel-servidor --bin guardiana-tunel-servidor
  ' >/var/log/guardiana-vpn-compilacion.log 2>&1 || { rojo "vpn.sh: no se pudo compilar (/var/log/guardiana-vpn-compilacion.log)"; exit 1; }
  install -m 755 "$VB/target/release/guardiana-tunel-servidor" "$BIN"
  rm -f "$VB"/compilado-*
  touch "$hecho"
fi

paso "La llave del servidor (se queda en esta máquina)"
install -d -m 700 /etc/guardiana/vpn
if [ ! -s "$LLAVE" ]; then (umask 077; wg genkey > "$LLAVE"); fi
chmod 600 "$LLAVE"

paso "El túnel: wg0, UDP 51820, 10.66.0.1/16"
cat > /etc/systemd/system/guardiana-wg0.service <<EOF
[Unit]
Description=GUARDIANA · VPN: la interfaz WireGuard (wg0)
After=network-online.target
Wants=network-online.target
Before=unbound.service guardiana-vpn-alta.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/sh -c 'ip link show wg0 >/dev/null 2>&1 || ip link add wg0 type wireguard; wg set wg0 private-key $LLAVE listen-port 51820; ip addr replace 10.66.0.1/16 dev wg0; ip link set wg0 up'
ExecStop=/bin/sh -c 'ip link del wg0 2>/dev/null || true'

[Install]
WantedBy=multi-user.target
EOF

paso "Reenvío de paquetes"
echo "net.ipv4.ip_forward = 1" > /etc/sysctl.d/91-guardiana-vpn.conf
sysctl -q -p /etc/sysctl.d/91-guardiana-vpn.conf

paso "Reglas de red del túnel (nftables, tabla propia)"
SALIDA=$(ip route show default | awk '{print $5; exit}')
[ -n "$SALIDA" ] || { rojo "vpn.sh: no encuentro la interfaz de salida"; exit 1; }
cat > /etc/guardiana/vpn/red.nft <<'EOF'
# GUARDIANA · VPN (zero-motor/vpn.sh). Solo la red del túnel; no toca nada más del servidor.
table inet guardiana_vpn
delete table inet guardiana_vpn
table inet guardiana_vpn {
	set privadas {
		type ipv4_addr
		flags interval
		elements = { 0.0.0.0/8, 10.0.0.0/8, 100.64.0.0/10, 127.0.0.0/8, 169.254.0.0/16, 172.16.0.0/12,
		             192.0.0.0/24, 192.168.0.0/16, 198.18.0.0/15, 224.0.0.0/4, 240.0.0.0/4 }
	}
	set nuevas {
		type ipv4_addr
		flags dynamic
		timeout 1m
	}
	chain entrada {
		type filter hook input priority filter - 5; policy accept;
		iifname "wg0" ip daddr 10.66.0.1 udp dport 53 accept
		iifname "wg0" ip daddr 10.66.0.1 tcp dport 53 accept
		iifname "wg0" ip daddr 10.66.0.1 icmp type echo-request limit rate 5/second accept
		iifname "wg0" drop
	}
	chain paso {
		type filter hook forward priority filter - 5; policy accept;
		iifname "wg0" oifname "wg0" drop
		iifname "wg0" ip daddr @privadas drop
		iifname "wg0" tcp dport 25 drop
		iifname "wg0" ct state new add @nuevas { ip saddr limit rate over 60/second burst 200 packets } drop
		iifname "wg0" accept
		oifname "wg0" ct state established,related accept
		oifname "wg0" drop
	}
	chain salida_nat {
		type nat hook postrouting priority srcnat; policy accept;
		ip saddr 10.66.0.0/16 oifname != "wg0" masquerade
	}
}
EOF
cat > /etc/systemd/system/guardiana-vpn-red.service <<EOF
[Unit]
Description=GUARDIANA · VPN: reglas de red del túnel
After=guardiana-wg0.service
Requires=guardiana-wg0.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/sbin/nft -f /etc/guardiana/vpn/red.nft
ExecStop=/usr/sbin/nft delete table inet guardiana_vpn

[Install]
WantedBy=multi-user.target
EOF

paso "El resolutor del túnel (Unbound en 10.66.0.1)"
cat > /etc/unbound/unbound.conf.d/guardiana-vpn.conf <<'EOF'
# GUARDIANA · VPN (zero-motor/vpn.sh): solo para la red del túnel. Sin registro de consultas.
server:
	interface: 10.66.0.1
	ip-freebind: yes
	access-control: 0.0.0.0/0 refuse
	access-control: 10.66.0.0/16 allow
	do-ip6: no
	hide-identity: yes
	hide-version: yes
	qname-minimisation: yes
	harden-glue: yes
	harden-dnssec-stripped: yes
	prefetch: yes
	verbosity: 0
	log-queries: no
	log-replies: no
	log-local-actions: no
	log-servfail: no
EOF
unbound-checkconf >/dev/null

paso "El servicio del alta (solo en 127.0.0.1:8793; sin registros)"
cat > /etc/systemd/system/guardiana-vpn-alta.service <<EOF
[Unit]
Description=GUARDIANA · VPN: el alta de los equipos
After=network-online.target guardiana-wg0.service
Requires=guardiana-wg0.service

[Service]
ExecStart=$BIN --punto $NOMBRE:51820 --interfaz wg0 --escucha 127.0.0.1:8793 --dns 10.66.0.1
DynamicUser=yes
AmbientCapabilities=CAP_NET_ADMIN
CapabilityBoundingSet=CAP_NET_ADMIN
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
ProtectKernelModules=yes
ProtectControlGroups=yes
RestrictAddressFamilies=AF_INET AF_INET6 AF_NETLINK AF_UNIX
StandardOutput=null
StandardError=journal
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable -q guardiana-wg0 guardiana-vpn-red guardiana-vpn-alta unbound
systemctl start guardiana-wg0
systemctl restart guardiana-vpn-red
systemctl restart unbound
systemctl restart guardiana-vpn-alta

paso "Cortafuegos del sistema (si ufw está activo): UDP 51820, el resolutor y la salida del túnel"
if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
  ufw allow 51820/udp >/dev/null
  ufw allow in on wg0 to 10.66.0.1 port 53 >/dev/null
  ufw route allow in on wg0 out on "$SALIDA" >/dev/null
fi

for i in $(seq 1 20); do
  if curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' http://127.0.0.1:8793/vpn/alta | grep -qE '^(400|422)$'; then
    paso "El alta responde en 127.0.0.1:8793"
    exit 0
  fi
  sleep 1
done
rojo "vpn.sh: el alta no responde (journalctl -u guardiana-vpn-alta -n 50)"
exit 1
