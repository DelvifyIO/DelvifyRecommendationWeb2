$( document ).ready(function() {
    let enabledAI = getQuery()['ai'] === 'true' || false;
    const submitForm = function(e) {
        e.preventDefault();
        const keyword = $('#searchProduct').val();
        if (keyword) {
            window.location.href = "product.html?keyword=" + keyword;
        }
        return false;
    };

    const toggleOn =
        '<button class="flex-c-m colorwhite color0-hov trans-0-4 float-right" id="toggleSearchButton">' +
        '<i class="fs-30 fa fa-toggle-on m-l-3 m-r-3" aria-hidden="true" />' +
        '<span class="fs-20">Disable Delvify AI Search</span>' +
        '</button>';

    const toggleOff =
        '<button class="flex-c-m colorwhite color0-hov trans-0-4 float-right" id="toggleSearchButton">' +
        '<i class="fs-30 fa fa-toggle-off m-l-3 m-r-3" aria-hidden="true" />' +
        '<span class="fs-20">Enable Delvify AI Search</span>' +
        '</button>';

    $('#searchBar').append(
        '<div class="search-product bo4 of-hidden bg-white">' +
        '<form id="searchForm" class="d-flex flex-row align-items-center">' +
        '<input class="fs-25 size6 p-l-25 p-r-25" type="text" name="search-product" id="searchProduct" placeholder="Search Products...">' +
        '<button class="flex-c-m size5 color2 color0-hov trans-0-4" id="searchButton">' +
        '<i class="fs-20 fa fa-search" aria-hidden="true" />' +
        '</button>' +
        '</form>' +
        '</div>'
    );

    $('#searchBarMobile').append(
        '<div class="search-product-mobile pos-relative of-hidden">' +
        '<form id="searchFormMobile">' +
        '<input class="s-text7 size6 p-l-23 p-r-50" type="text" name="search-product" id="searchProductMobile" placeholder="Search Products...">' +
        '<button class="flex-c-m size5 ab-r-m color2 color0-hov trans-0-4" id="searchButtonMobile">' +
        '<i class="fs-12 fa fa-search" aria-hidden="true" />' +
        '</button>' +
        '</form>' +
        '</div>');

    if (enabledAI) {
        $('#searchBar').append(toggleOn);
    } else {
        $('#searchBar').append(toggleOff);
    }


    $('#toggleSearchButton').on('click', function(e) {
        if ($(this).find("i").hasClass("fa-toggle-on")) {
            enabledAI = false;
            $(this).find("i").removeClass("fa-toggle-on").addClass("fa-toggle-off");
            $(this).find("span").text("Enable Delvify AI Search");
        } else {
            enabledAI = true;
            $(this).find("i").removeClass("fa-toggle-off").addClass("fa-toggle-on");
            $(this).find("span").text("Disable Delvify AI Search");
        }
    });

    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const keyword = $('#searchProduct').val();
        if (keyword) {
            api('POST', `/query`, { query: keyword }, (result) => {
                window.location.href = "product.html?" + "ai=" + enabledAI +"&keyword=" + keyword;
            });
        }
        return false;
    });

    $('#searchFormMobile').on('submit', function(e) {
        e.preventDefault();
        const keyword = $('#searchProductMobile').val();
        if (keyword) {
            api('POST', `/query`, { query: keyword }, (result) => {
                window.location.href = "product.html?keyword=" + keyword;
            });
        }
        return false;
    });
});