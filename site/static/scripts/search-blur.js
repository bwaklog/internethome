var search_toggle = document.getElementById("search-toggle");
const search_header = document.getElementById("search-header");
const bodyElements = document.getElementById("container-zoom");
const searchInput = document.getElementById("searchSiteInput");
const beepSound = document.getElementById("chime");

search_toggle.addEventListener("click", function () {
    if (search_toggle.className === "search-closed") {
        search_toggle.className = "search-open";
        console.log("opening menu");

        search_header.style.zIndex = "900";
        search_header.style.backdropFilter = "blur(15px)";
        search_header.style.webkitBackdropFilter = "blur(15px)"
        bodyElements.style.scale = "0.95";

        searchInput.style.zIndex = "9999";
        searchInput.style.opacity = "1";

        searchInput.focus();
    } else {
        search_toggle.className = "search-closed";
        console.log("closing menu");

        searchInput.value = "";
        search_header.style.zIndex = "-1";
        search_header.style.backdropFilter = "none";
        bodyElements.style.scale = "1";

        searchInput.innerHTML = "";
        document.getElementById("site_search_result").innerHTML = "";
        searchInput.style.zIndex = "-1";
        searchInput.style.opacity = "0";

    }
});

document.addEventListener("keydown", function (event) {
    if (event.metaKey && event.key === "k") {
        if (search_toggle.className === "search-closed") {
            search_toggle.className = "search-open";

            beepSound.volume = 0.5;
            beepSound.play();

            search_header.style.zIndex = "900";
            search_header.style.backdropFilter = "blur(20px)";
            search_header.style.webkitBackdropFilter = "blur(20px)"
            bodyElements.style.scale = "0.9";

            searchInput.style.zIndex = "9999";
            searchInput.style.opacity = "1";

            searchInput.focus();
        } else {
            search_toggle.className = "search-closed";

            search_header.style.zIndex = "-1";
            search_header.style.backdropFilter = "none";
            bodyElements.style.scale = "1";

            searchInput.innerHTML = "";
            searchInput.style.zIndex = "-1";
            searchInput.style.opacity = "0";
            searchInput.value = "";
            document.getElementById("site_search_result").innerHTML = "";
        }
    }
});

// search_toggle.addEventListener("mouseover", function () {
//     if (search_toggle.className === "search-closed") {
//         search_toggle.className = "search-open";
//         console.log("opening menu");

//         search_header.style.zIndex = "900";
//         search_header.style.backdropFilter = "blur(20px)";

//     }
// })

// search_toggle.addEventListener("mouseleave", function () {
//     if (search_toggle.className === "search-open") {
//         search_toggle.className = "search-closed";
//         console.log("opening menu");

//         search_header.style.zIndex = "-1";
//         search_header.style.backdropFilter = "none";

//     }
// })
