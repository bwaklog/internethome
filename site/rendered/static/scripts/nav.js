$(function () {
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();

        if (scroll >= 10) {
            // $("nav").css("filter", "drop-shadow(0 0 .5rem var(--color-text-dim)");
            $("nav").css("backdrop-filter", "blur(15px) brightness(0.8)");
            $("nav").css("padding", ".6rem");
            $("nav").css("width", "19rem");
            $("nav").css("background-color", "var(--color-background-low)");
        } else if (scroll >= 50) {
            $("nav").css("backdrop-filter", "blur(15px) brightness(0.8)");
            $("nav").css("padding", ".8rem");
            $("nav").css("width", "19rem");
            $("nav").css("background-color", "var(--color-background-low)");
        } else {
            $("nav").css("backdrop-filter", "none");
            $("nav").css("width", "32rem");
            // if media width is less than 800px
            if ($(window).width() < 900) {
                $("nav").css("width", "90%");
            }
            $("nav").css("padding", "0");
            $("nav").css("background-color", "transparent");
        }
    });
});
