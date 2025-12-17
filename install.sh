#!/usr/bin/env bash
set -euo pipefail

echo "is CF_PAGES = $CF_PAGES"

if [ "$CF_PAGES" = "0" ]; then
    echo "Error: CF_PAGES is 0" >&2
    exit 1
fi

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
        echo "Unsupported arch: $ARCH" >&2
        exit 1
        ;;
esac

curl -L "https://github.com/anna-ssg/anna/releases/download/$RELEASE/$ANNA_TGZ" -o anna.tar.gz

tar -xzf anna.tar.gz
chmod +x anna

# Inject commit info directly into footer.html
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "local")
COMMIT_FULL_HASH=$(git rev-parse HEAD 2>/dev/null || echo "local")
COMMIT_DATE=$(git log -1 --format=%cd --date=format:'%a %b %d %Y' 2>/dev/null || date '+%a %b %d %Y')
COMMIT_MESSAGE=$(git log -1 --format=%s 2>/dev/null || echo "Local build")

sed -i.bak \
    -e "s|<a id=\"commit-hash\" class=\"footer-element\" href=\"[^\"]*\">[^<]*</a>|<a id=\"commit-hash\" class=\"footer-element\" href=\"https://github.com/bwaklog/internethome/tree/${COMMIT_FULL_HASH}\">${COMMIT_HASH}</a>|" \
    -e "s|<span id=\"commit-date\">[^<]*</span>|<span id=\"commit-date\">${COMMIT_DATE}</span>|" \
    -e "s|<span id=\"commit-message\">[^<]*</span>|<span id=\"commit-message\">${COMMIT_MESSAGE}</span>|" \
    site/layout/partials/footer.html

echo "✓ Injected commit info: ${COMMIT_HASH} (${COMMIT_DATE})"

./anna

RENDER_DIR="./site/rendered"

if [ -d "$RENDER_DIR" ]; then
    echo "Found: $RENDER_DIR"
    ls -lah $RENDER_DIR
else
    echo "Error: $RENDER_DIR does not exist" >&2
    exit 1
fi
