function lightScheme() {
    // change the tags
    // document.documentElement.style.setProperty("--color-text", "#282828");
    document.documentElement.style.setProperty("--color-heading", "#000000");
    document.documentElement.style.setProperty("--color-text", "#585858");
    document.documentElement.style.setProperty("--color-text-dim", "#2828285a");
    // document.documentElement.style.setProperty("--color-text-dim", "#0000005a");
    document.documentElement.style.setProperty("--color-background", "#FEFAF6");
    document.documentElement.style.setProperty(
        "--color-background-dim",
        "#dadada",
    );
    document.documentElement.style.setProperty(
        "--color-background-low",
        "#dadada7a",
    );
    document.documentElement.style.setProperty("--inline-code-bg", "#d1d1d17d");
    document.documentElement.style.setProperty("--color-background-contrast", "#e8e8e8");
}

function darkScheme() {
    document.documentElement.style.setProperty("--color-heading", "#ffffff");
    // document.documentElement.style.setProperty("--color-text", "#585858");
    document.documentElement.style.setProperty("--color-text", "#c0c0c0");
    document.documentElement.style.setProperty("--color-text-dim", "#d8d8d85a");
    // document.documentElement.style.setProperty("--color-background", "#0f0f0f");
    document.documentElement.style.setProperty("--color-background", "#0f1011");
    // document.documentElement.style.setProperty("--color-background", "#000000");
    document.documentElement.style.setProperty(
        "--color-background-dim",
        "#2a2a2a",
    );
    document.documentElement.style.setProperty(
        "--color-background-low",
        "#2a2a2a7a",
    );
    document.documentElement.style.setProperty("--inline-code-bg", "#1d1f21");
    document.documentElement.style.setProperty("--color-background-contrast", "#1a1a1a");
}

// store user toggle preference in local storage. Site must remember what theme was last used
// and apply it when the user returns to the site.

function ThemeSwitch() {
    // on click of button with class toggle-theme, store theme in local and switch
    var theme = localStorage.getItem("theme");
    if (theme === "light") {
        localStorage.setItem("theme", "dark");
        darkScheme();
    } else {
        localStorage.setItem("theme", "light");
        lightScheme();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.onload = function () {
        const toggle = document.getElementById("theme-toggle");
        toggle.onclick = function () {
            toggle.style.transition = "transform .5s cubic-bezier(1,0,0,1)";
            if (toggle.style.transform === "rotate(1080deg)") {
                toggle.style.transform = "rotate(0deg)";
            } else {
                toggle.style.transform = "rotate(1080deg)";
            }
            ThemeSwitch();
        };
    };
    // check local storage for theme
    const theme = localStorage.getItem("theme");
    // if no theme exists
    if (!theme) {
        lightScheme();
    }
    if (theme === "light") {
        lightScheme();
    } else {
        darkScheme();
    }
});
