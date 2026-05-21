#!/usr/bin/env bash
set -euo pipefail

CF_PAGES="${CF_PAGES:-0}"
# echo "is CF_PAGES = $CF_PAGES"

if [ "$CF_PAGES" = "1" ]; then
    echo "INFO: in CF env, installing anna for arch"
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
else
    echo "INFO: checking if anna is in PATH"
    if ! command -v anna &> /dev/null; then
        echo "Error: anna could not be found in PATH" >&2
        exit 1
    fi
fi

COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "local")
COMMIT_FULL_HASH=$(git rev-parse HEAD 2>/dev/null || echo "local")
COMMIT_DATE=$(git log -1 --format=%cd --date=format:'%a %b %d %Y' 2>/dev/null || date '+%a %b %d %Y')
COMMIT_MESSAGE=$(git log -1 --format=%s 2>/dev/null || echo "Local build")

# Use Perl for cross-platform compatible text replacement
perl -i -pe "
    s|href=\"https://github.com/bwaklog/internethome/tree/[a-f0-9]*\"|href=\"https://github.com/bwaklog/internethome/tree/${COMMIT_FULL_HASH}\"|g;
    s|>[a-f0-9]{7}</a|>${COMMIT_HASH}</a|g;
    s|<span id=\"commit-date\">[^<]*</span>|<span id=\"commit-date\">${COMMIT_DATE}</span>|g;
    s|<span id=\"commit-message\">[^<]*</span>|<span id=\"commit-message\">${COMMIT_MESSAGE}</span>|g;
" site/layout/partials/footer.html

if [ "$CF_PAGES" = "1" ]; then
    echo "INFO: in CF env, only building"
    ./anna

    RENDER_DIR="./site/rendered"

    if [ -d "$RENDER_DIR" ]; then
        echo "Found: $RENDER_DIR"
        ls -lah $RENDER_DIR
    else
        echo "Error: $RENDER_DIR does not exist" >&2
        exit 1
    fi

    if [ -f "./site/_headers" ]; then
        cp "./site/_headers" "$RENDER_DIR/_headers"
        echo "Copied _headers into $RENDER_DIR"
    fi
else
    echo "INFO: not in CF env, serving locally"
    anna -s
fi
