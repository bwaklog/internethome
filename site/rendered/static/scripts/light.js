function lightScheme() {
  // change the tags
  // document.documentElement.style.setProperty("--color-text", "#282828");
  document.documentElement.style.setProperty("--color-heading", "#000000");
  document.documentElement.style.setProperty("--color-subheading", "#606060");
  document.documentElement.style.setProperty("--color-text", "#10100ed0");
  document.documentElement.style.setProperty("--color-text-dim", "#58585870");
  // document.documentElement.style.setProperty("--color-background", "#FEFAF6");
  document.documentElement.style.setProperty("--color-background", "#ffffff");
  // document.documentElement.style.setProperty("--color-background", "#fbfaf2");
  // document.documentElement.style.setProperty("--color-background", "hsla(0, 43%, 97%, 1)");
  document.documentElement.style.setProperty(
    "--color-background-dim",
    "#ffffff7a",
  );
  document.documentElement.style.setProperty(
    "--color-background-low",
    "#ffffff50",
  );
  document.documentElement.style.setProperty("--inline-code-bg", "#d1d1d17d");
  document.documentElement.style.setProperty(
    "--color-background-contrast",
    "#e8e8e8",
  );
}

function darkScheme() {
  document.documentElement.style.setProperty("--color-heading", "#ffffff");
  document.documentElement.style.setProperty("--color-subheading", "#a0a0a0");
  // document.documentElement.style.setProperty("--color-text", "#585858");
  document.documentElement.style.setProperty("--color-text", "#ffffffb0");
  document.documentElement.style.setProperty("--color-text-dim", "#ffffff5a");
  // document.documentElement.style.setProperty("--color-background", "#0f0f0f");
  // document.documentElement.style.setProperty("--color-background", "#0b1215");
  document.documentElement.style.setProperty("--color-background", "#0c0c0c");
  // document.documentElement.style.setProperty("--color-background", "#121616");
  // document.documentElement.style.setProperty("--color-background", "hsla(0, 41%, 2%, 1)");
  document.documentElement.style.setProperty(
    "--color-background-dim",
    "#10100e7a",
  );
  document.documentElement.style.setProperty(
    "--color-background-low",
    "#10100e50",
  );
  document.documentElement.style.setProperty("--inline-code-bg", "#1d1f21");
  document.documentElement.style.setProperty(
    "--color-background-contrast",
    "#1a1a1a",
  );
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
      // toggle.style.transition = "transform .5s cubic-bezier(1,0,0,1)";
      // if (toggle.style.transform === "rotate(1080deg)") {
      //     toggle.style.transform = "rotate(0deg)";
      // } else {
      //     toggle.style.transform = "rotate(1080deg)";
      // }
      toggle.style.scale = "scale .5s cubic-bezier(1,0,0,1)";
      toggle.style.scale = "scale(.95)";
      toggle.style.scale = "scale(1)";
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
