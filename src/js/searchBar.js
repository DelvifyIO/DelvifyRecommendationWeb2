$( document ).ready(function() {
    const submitForm = function(e) {
        e.preventDefault();
        const keyword = $('#searchProduct').val();
        if (keyword) {
            window.location.href = "product.html?keyword=" + keyword;
        }
        return false;
    };

    $('#searchBar').append(
        '<div class="search-product pos-absolute bo4 of-hidden">' +
        '<form id="searchForm">' +
        '<input class="s-text7 size6 p-l-23 p-r-50" type="text" name="search-product" id="searchProduct" placeholder="Search Products...">' +
        '<button class="flex-c-m size5 ab-r-m color2 color0-hov trans-0-4" id="searchButton">' +
        '<i class="fs-12 fa fa-search" aria-hidden="true" />' +
        '</button>' +
        '</form>' +
        '</div>');

    $('#searchBarMobile').append(
        '<div class="search-product-mobile pos-relative of-hidden">' +
        '<form id="searchFormMobile">' +
        '<input class="s-text7 size6 p-l-23 p-r-50" type="text" name="search-product" id="searchProductMobile" placeholder="Search Products...">' +
        '<button class="flex-c-m size5 ab-r-m color2 color0-hov trans-0-4" id="searchButtonMobile">' +
        '<i class="fs-12 fa fa-search" aria-hidden="true" />' +
        '</button>' +
        '</form>' +
        '</div>');

    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const keyword = $('#searchProduct').val();
        if (keyword) {
            api('POST', `/query`, { query: keyword }, (result) => {
                window.location.href = "product.html?keyword=" + keyword;
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