$(".selection-1").select2({
    minimumResultsForSearch: 20,
    dropdownParent: $('#dropDownSelect1')
});

$(".selection-2").select2({
    minimumResultsForSearch: 20,
    dropdownParent: $('#dropDownSelect2')
});

var skipValues = [
    document.getElementById('value-lower'),
    document.getElementById('value-upper')
];

function displayItem(item) {
    return (
        "<div class=\"col-sm-12 col-md-6 col-lg-4 p-b-50\">" +
        "<div class=\"block2\">" +
        "<div class=\"block2-img wrap-pic-w of-hidden pos-relative\">" +
        "<img src=\""+ item.images[0].url +"\" alt=\"IMG-PRODUCT\">" +
        "<div class=\"block2-overlay trans-0-4\">" +
        "<a href=\"#\" class=\"block2-btn-addwishlist hov-pointer trans-0-4\">" +
        "<i class=\"icon-wishlist icon_heart_alt\" aria-hidden=\"true\"></i>" +
        "<i class=\"icon-wishlist icon_heart dis-none\" aria-hidden=\"true\"></i>" +
        "</a>" +
        "<div class=\"block2-btn-addcart-ctn trans-0-4\">" +
        "<div class=\"block2-btn-addcart w-size1 trans-0-4\" data-pid=\"" + item.sku + "\">" +
        "<button class=\"flex-c-m size1 bg4 bo-rad-23 hov1 s-text1 trans-0-4\">" +
        "Add to Cart" +
        "</button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<div class=\"block2-txt p-t-20\">" +
        "<a href=\"product-details.html?sku=" + item.sku + "\" class=\"block2-name dis-block s-text3 p-b-5\">" +
        item.name +
        "</a>" +
        "<span class=\"block2-price m-text6 p-r-5\">" +
        `${item.currency.sign}${item.price}` +
        "</span>" +
        "</div>" +
        "</div>" +
        "</div>"
    )
}


$( document ).ready(function() {

    const limit = 15;
    const page = getQuery()['p'] || 1;
    const categoryId = getQuery()['category'] || null;
    const keyword = getQuery()['keyword'] || null;
    const param = { limit, offset: (page - 1)* limit };
    const searchItems = {};
    if (categoryId) {
        param['categoryId'] = categoryId;
    }
    if (keyword) {
        $('#searchProduct').val(keyword);
        $.get("http://13.67.88.182:8085/computeSimilarity", { text: keyword })
            .then((result) => {
                const skus = result.skus || [];
                skus.forEach((sku, index) => {
                    searchItems[sku] = index;
                });
                return $.get(`${process.env.API_HOST}/product`, { skus: result.skus || [] })
            })
            .then((products) => {
                products.sort((a, b) => searchItems[a.sku] - searchItems[b.sku]);
                for(let i = 0; i < products.length; i++) {
                    const item = products[i];
                    $('#productList').append(displayItem(item));
                }
                addListener('wishlist');
                $('.block2-btn-addcart').on('click', function(){
                    const pid = $(this).data('pid');
                    const item = products.find((t) => t.sku == pid);
                    swal(item.name, "is added to cart !", "success");
                    addToCart(item.sku, 1);
                });
            }).catch(console.log);

        return false;
    } else {
        api('GET', "/product", param).done((response) => {
            const pages = Math.ceil(response.count / limit);
            const products = response.rows;
            for(let i = 0; i < products.length; i++) {
                const item = products[i];
                $('#productList').append(displayItem(item));
            }
            for(let i = 1; i <= pages; i++) {
                const category = categoryId ? `category=${categoryId}&` : "";
                const href = (page == i) ? "javascript:void(0);" : ("product.html?" + category + "p=" + i);
                $('#pagination').append(
                    "<a href=\"" + href + "\" class=\"item-pagination flex-c-m trans-0-4" + ((page == i) ? " active-pagination\"" : "\"") + ">" + i +"</a>"
                )
            }
            addListener('wishlist');

            $('.block2-btn-addcart').on('click', function(){
                const pid = $(this).data('pid');
                const item = products.find((t) => t.sku == pid);
                swal(item.name, "is added to cart !", "success");
                addToCart(item.sku, 1);
            });
        });
    }

});
