$( document ).ready(function() {
    api('GET', '/category/featured', { limit: 5 }, (response) => {
        let content = '';
        for (let i = 0; i < 5; i++) {
            const category = response[i];
            let list = '';
            if (i % 2 === 0) {
                list += "<div class='col-sm-10 col-md-8 col-lg-4 m-l-r-auto'>";
            }
            list += "<div class='block1 hov-img-zoom pos-relative m-b-30'>" +
                "<img src='" + category.products[0].image_url + "'/>" +

                "<div class=\"block1-wrapbtn w-size2\">" +
                "<a href=\"product.html?category=" + category.id + "\" class=\"flex-c-m size2 m-text2 bg3 hov1 trans-0-4 t-center p-r-5 p-l-5\">" +
                category.name +
                "</a>" +
                "</div>" +
                "</div>";
            if (i === 4) {
                list += "<div class=\"block2 wrap-pic-w pos-relative m-b-30\">" +
                    "<img src=\"../images/icons/bg-01.jpg\" alt=\"IMG\">" +
                    "<div class=\"block2-content sizefull ab-t-l flex-col-c-m\">" +
                    "<h4 class=\"m-text4 t-center w-size3 p-b-8\">" +
                    "Sign up & get 20% off" +
                    "</h4>" +
                    "<p class=\"t-center w-size4\">" +
                    "Be the frist to know about the latest fashion news and get exclu-sive offers" +
                    "</p>" +
                    "<div class=\"w-size2 p-t-25\">" +
                    "<a href=\"#\" class=\"flex-c-m size2 bg4 bo-rad-23 hov1 m-text3 trans-0-4\">" +
                    "Sign Up" +
                    "</a>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>";
            }
            if (i % 2 !== 0) {
                list += "</div>";
            }
            content += list;
        }
        $('#newProducts').append(content);
    });
});

$(".selection-1").select2({
    minimumResultsForSearch: 20,
    dropdownParent: $('#dropDownSelect1')
});