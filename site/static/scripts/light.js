function lightScheme() {
  // change the tags
  document.documentElement.style.setProperty("--color-text", "#282828");
  document.documentElement.style.setProperty("--color-text-dim", "#2828285a");
  document.documentElement.style.setProperty("--color-background", "#FAF9F6");
  document.documentElement.style.setProperty("--color-background-dim", "#dadada");
  document.documentElement.style.setProperty("--color-background-low", "#dadada7a");
  document.documentElement.style.setProperty("--inline-code-bg", "#ff4a6a28");
}

function darkScheme() {
  document.documentElement.style.setProperty("--color-text", "#d8d8d8");
  document.documentElement.style.setProperty("--color-text-dim", "#d8d8d85a");
  document.documentElement.style.setProperty("--color-background", "#131313");
  document.documentElement.style.setProperty("--color-background-dim", "#2a2a2a");
  document.documentElement.style.setProperty("--color-background-low", "#2a2a2a7a");
  document.documentElement.style.setProperty("--inline-code-bg", "#1d1f21");
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
      toggle.style.transition = "transform 1s cubic-bezier(1,0,0,1)";
      if (toggle.style.transform === "rotate(3600deg)") {
        toggle.style.transform = "rotate(0deg)";
      } else {
        toggle.style.transform = "rotate(3600deg)";
      }
      ThemeSwitch();
    };
  };
  // check local storage for theme
  const theme = localStorage.getItem("theme");
  if (theme === "light") {
    lightScheme();
  } else {
    darkScheme();
  }
});
