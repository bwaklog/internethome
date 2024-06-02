// function that makes page-nav-expand visible on hover of
// "page-nav-element expand"

$(function () {
    // on click
    $(".page-nav-element.expand").hover(function () {
        console.log("clicked");
        // if display is none show
        if ($(".page-nav-expand").css("display") === "none") {
            $(".page-nav-expand").css("display", "block");
        }

        // set to none if mouse leaves page-nave-element.expand
        // and page-nav-expand

        $(".page-nav-element.expand").mouseleave(function () {
            // if mouse isnt inside the page-nav-expand div
            // hide
            if ($(".page-nav-expand").css("display") === "block") {
                $(".page-nav-expand").css("display", "none");
            }
        })
    })
});
