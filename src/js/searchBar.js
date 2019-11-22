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

    const toggleOnSmall =
        '<button class="flex-c-m color1 color0-hov trans-0-4 float-right" id="toggleSearchButton">' +
        '<i class="fs-20 fa fa-toggle-on m-l-3 m-r-3" aria-hidden="true" />' +
        '<span class="fs-15">Disable Delvify AI Search</span>' +
        '</button>';

    const toggleOff =
        '<button class="flex-c-m colorwhite color0-hov trans-0-4 float-right" id="toggleSearchButton">' +
        '<i class="fs-30 fa fa-toggle-off m-l-3 m-r-3" aria-hidden="true" />' +
        '<span class="fs-20">Enable Delvify AI Search</span>' +
        '</button>';

    const toggleOffSmall =
        '<button class="flex-c-m color1 color0-hov trans-0-4 float-right" id="toggleSearchButton">' +
        '<i class="fs-20 fa fa-toggle-off m-l-3 m-r-3" aria-hidden="true" />' +
        '<span class="fs-15">Enable Delvify AI Search</span>' +
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

    $('#searchBarSmall').append(
        '<div class="search-product of-hidden bg-white">' +
        '<form id="searchForm" class="d-flex flex-row align-items-center">' +
        '<input class="fs-15 size4 p-l-25 p-r-25" type="text" name="search-product" id="searchProduct" placeholder="Search Products...">' +
        '<button class="flex-c-m size8 color2 color0-hov trans-0-4" id="searchButton">' +
        '<i class="fs-15 fa fa-search" aria-hidden="true" />' +
        '</button>' +
        '</form>' +
        '</div>'
    );

    if (enabledAI) {
        $('#searchBar').append(toggleOn);
        $('#searchBarSmall').append(toggleOnSmall);
    } else {
        $('#searchBar').append(toggleOff);
        $('#searchBarSmall').append(toggleOffSmall);
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
});