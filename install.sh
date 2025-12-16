#!/usr/bin/env bash
set -euo pipefail

ARCH="${ARCH_OVERRIDE:-$(uname -m)}"
RELEASE="4.0.0-rc-1"

case "$ARCH" in
    x86_64|amd64)
        ANNA_TGZ="anna_Linux_x86_64.tar.gz"   
        ;;
    arm64|aarch64)
        ANNA_TGZ="anna_Linux_arm64.tar.gz"   
        ;;
    *) 
        echo "Usupported arch: $ARCH"
        ;;
esac

curl -L "https://github.com/anna-ssg/anna/releases/download/$RELEASE/$ANNA_TGZ" -o anna.tar.gz

tar -xzf anna.tar.gz
chmod +x anna

./anna

RENDER_DIR="./site/rendered"

if [ -d "$RENDER_DIR" ]; then
    echo "Found: $RENDER_DIR"
    ls -lah $RENDER_DIR
else
    echo "Error: $RENDER_DIR does not exist" >&2
    exit 1
fi
