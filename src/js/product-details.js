
$( document ).ready(function() {
    const sku = getQuery()["sku"] || 1;

    api('GET', `/product`, { sku }, (item) => {
        $('#productName').text(item.name);
        $('#productPrice').text(`${item.currency.sign}${item.price}`);
        $('#productDescription').text(item.description);
        $('#productSKU').text(`SKU: ${item.sku}`);
        $('#productCategories').text(`Categories: ${item.category.name}`);
        item.images.forEach((image) => {
            $('#productSlide').append(
                "<div class=\"item-slick3\" data-thumb=\"" + image.url + "\">" +
                "<div class=\"wrap-pic-w\">" +
                "<img src=\"" + image.url + "\" alt=\"IMG-PRODUCT\">" +
                "</div>" +
                "</div>");
        });
        $('.slick3').slick('unslick');
        initSlick3();
        $('#addToCartBtn').on('click', function(){
            swal(item.name, "is added to cart !", "success");
            addToCart(item.sku, parseInt($('#quantity').val()));
            recommendationRecord('ADD_CART_FROM_DETAIL', { pid: item.sku });
        });

    });
});