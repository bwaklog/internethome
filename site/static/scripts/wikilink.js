const WIKILINK_PATTERN = /\[\[([^|\]]+?)(?:\|([^\]]*?))?\]\]/g;
const SKIPPED_ELEMENTS = "a, code, pre, script, style, textarea";

function normalizePath(path) {
    return decodeURIComponent(path)
        .replace(/^\/+/, "")
        .replace(/\.md$/, "")
        .replace(/\.html$/, "");
}

function pageName(path) {
    return path.slice(path.lastIndexOf("/") + 1).replace(/\.html$/, "");
}

function makeCandidates(index) {
    return Object.entries(index).map(([path, page]) => ({
        path,
        normalizedPath: normalizePath(path),
        name: pageName(path),
        title: page?.Frontmatter?.Title || "",
    }));
}

function resolveLink(target, pages) {
    const normalizedTarget = normalizePath(target.trim());
    if (!normalizedTarget) {
        return null;
    }

    const exact = pages.find((page) => page.normalizedPath === normalizedTarget);
    if (exact) {
        return exact.path;
    }

    const currentPath = normalizePath(location.pathname);
    const currentDirectory = currentPath.includes("/")
        ? currentPath.slice(0, currentPath.lastIndexOf("/") + 1)
        : "";
    const relative = pages.find(
        (page) => page.normalizedPath === currentDirectory + normalizedTarget,
    );
    if (relative) {
        return relative.path;
    }

    const matchingNames = pages.filter(
        (page) =>
            page.name === normalizedTarget ||
            page.title.toLowerCase() === normalizedTarget.toLowerCase(),
    );
    return matchingNames.length === 1 ? matchingNames[0].path : null;
}

function replaceWikilinks(root, pages) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;

    while ((node = walker.nextNode())) {
        if (
            !node.parentElement ||
            !node.parentElement.closest(SKIPPED_ELEMENTS)
        ) {
            textNodes.push(node);
        }
    }

    for (const textNode of textNodes) {
        if (!WIKILINK_PATTERN.test(textNode.nodeValue)) {
            WIKILINK_PATTERN.lastIndex = 0;
            continue;
        }

        WIKILINK_PATTERN.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;

        while ((match = WIKILINK_PATTERN.exec(textNode.nodeValue))) {
            fragment.append(textNode.nodeValue.slice(lastIndex, match.index));
            const destination = resolveLink(match[1], pages);

            if (!destination) {
                fragment.append(match[0]);
            } else {
                const link = document.createElement("a");
                link.href = `/${destination}`;
                link.textContent = match[2] || match[1].trim();
                fragment.append(link);
            }
            lastIndex = WIKILINK_PATTERN.lastIndex;
        }

        fragment.append(textNode.nodeValue.slice(lastIndex));
        textNode.replaceWith(fragment);
    }
}

async function initialize() {
    try {
        const response = await fetch("/static/index.json");
        if (!response.ok) {
            throw new Error(`Unable to load wikilink index (${response.status})`);
        }
        const index = await response.json();
        replaceWikilinks(document.body, makeCandidates(index));
    } catch (error) {
        console.error("Wikilinks could not be initialized:", error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
    initialize();
}