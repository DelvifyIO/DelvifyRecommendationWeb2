$( document ).ready(function() {
    let enabledAI = getQuery()['ai'] === 'true' || false;
    let loading = false;

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
        '<div class="fs-25 size6 p-l-25 p-r-25 p-t-5 p-b-5 d-none align-items-center w-size-auto" id="uploadedImageContainer">' +
        '<div class="p-1 h-100 d-flex align-items-center">' +
        '<img class="h-100 mr-2" id="uploadedImage" style="max-width: 100px;"/>' +
        '<span class="fs-15 w-size-max" id="uploadedImageName"></span>' +
        '</div> ' +
        '</div>' +
        '<div class="fs-25 size6 p-l-25 p-r-25 d-block w-100 d-flex align-items-center">' +
        '<input class="w-100" type="text" name="search-product" id="searchProduct" placeholder="Search Products..." />' +
        '</div>' +
        '<button class="flex-c-m size5 color2 color0-hov trans-0-4 d-flex" type="button" id="uploadButton">' +
        '<i class="fs-20 fa fa-camera" aria-hidden="true" />' +
        '</button>' +
        '<div class="flex-c-m size5 color2 trans-0-4 d-none" id="uploadSpinner">' +
        '<i class="fa fa-spinner fa-spin" aria-hidden="true" />' +
        '</div>' +
        '<input type="file" id="uploadInput" accept="image/*" hidden/>' +
        '<button class="flex-c-m size5 color2 color0-hov trans-0-4" type="submit" id="searchButton">' +
        '<i class="fs-20 fa fa-search" aria-hidden="true" />' +
        '</button>' +
        '</form>' +
        '</div>'
    );

    $('#searchBarSmall').append(
        '<div class="search-product of-hidden bg-white">' +
        '<form id="searchForm" class="d-flex flex-row align-items-center">' +
        '<input class="fs-15 size4 p-l-25 p-r-25" type="text" name="search-product" id="searchProduct" placeholder="Search Products...">' +
        '<div class="fs-25 size6 p-l-25 p-r-25 p-t-5 p-b-5 d-none align-items-center" id="uploadedImageContainer">' +
        '<div class="p-1 h-100 d-flex align-items-center">' +
        '<img class="h-100 mr-2" id="uploadedImage" style="max-width: 50px;"/>' +
        '<span class="fs-10" id="uploadedImageName"></span>' +
        '</div> ' +
        '</div>' +
        '<button class="flex-c-m size8 color2 color0-hov trans-0-4 d-flex" type="button" id="uploadButton">' +
        '<i class="fs-15 fa fa-camera" aria-hidden="true" />' +
        '</button>' +
        '<div class="flex-c-m size5 color2 trans-0-4 d-none" id="uploadSpinner">' +
        '<i class="fa fa-spinner fa-spin" aria-hidden="true" />' +
        '</div>' +
        '<input type="file" id="uploadInput" accept="image/*" hidden/>' +
        '<button class="flex-c-m size8 color2 color0-hov trans-0-4" id="searchButton">' +
        '<i class="fs-15 fa fa-search" aria-hidden="true" />' +
        '</button>' +
        '</form>' +
        '</div>'
    );

    if (enabledAI) {
        $('#searchBar').append(toggleOn);
        $('#searchBarSmall').append(toggleOnSmall);
        $('#uploadButton').removeClass('d-none').addClass('d-flex');
    } else {
        $('#searchBar').append(toggleOff);
        $('#searchBarSmall').append(toggleOffSmall);
        $('#uploadButton').removeClass('d-flex').addClass('d-none');
    }


    $('#toggleSearchButton').on('click', function(e) {
        if ($(this).find("i").hasClass("fa-toggle-on")) {
            enabledAI = false;
            $(this).find("i").removeClass("fa-toggle-on").addClass("fa-toggle-off");
            $(this).find("span").text("Enable Delvify AI Search");
            $('#uploadButton').removeClass('d-flex').addClass('d-none');
        } else {
            enabledAI = true;
            $(this).find("i").removeClass("fa-toggle-off").addClass("fa-toggle-on");
            $(this).find("span").text("Disable Delvify AI Search");
            if (!loading) {
                $('#uploadButton').removeClass('d-none').addClass('d-flex');
            }
        }
    });

    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const keyword = $('#searchProduct').val();
        if (keyword) {
            window.location.href = "product.html?" + "ai=" + enabledAI +"&keyword=" + keyword;
        }
        return false;
    });

    $('#uploadButton').on('click', function(e) {
        e.preventDefault();
        $('#uploadInput').click();
        return false;
    });

    $('#uploadInput').on('change', function(e) {
        if ($(this).prop('files').length > 0) {
            loading = true;
            $('#uploadButton').removeClass('d-flex').addClass('d-none');
            $('#searchButton').removeClass('d-flex').addClass('d-none');
            $('#uploadSpinner').removeClass('d-none').addClass('d-flex');
            $('#searchProduct').removeClass('d-block').addClass('d-none');
            $('#uploadedImageContainer').removeClass('d-none').addClass('d-flex');
            const file = $(this).prop('files')[0];
            $('#uploadedImage').prop('src', URL.createObjectURL(file));
            $('#uploadedImageName').html(`${file.name} ‧ ${(file.size/1024).toFixed(2)}KB`);


            let reader = new FileReader();
            reader.onloadend = function() {
                sessionStorage.setItem('uploadedImage', JSON.stringify({ data: reader.result, name: file.name, size: file.size }));
                window.location.href = "product.html?" + "ai=" + enabledAI +"&searchBy=image";
            };
            reader.readAsDataURL(file);
        }
    });

});