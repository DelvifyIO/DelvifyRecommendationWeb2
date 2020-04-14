
$( document ).ready(function() {
    const cart = JSON.parse(sessionStorage.getItem('delvify_cart')) || { items: [] };
    let total = 0;
    let currencySign = '$';
    let promises = [];
    if (cart.items.length > 0) {
        promises = cart.items.map(function ({ sku, quantity }) {
            return new Promise((resolve, reject) => {
                api('GET', '/product', { sku }, (item) => {
                    $('#table').append(
                        "<tr class=\"table-row\" id=\"table-row-" + sku + "\">" +
                        "<td class=\"column-1\">" +
                        "<div class=\"cart-img-product b-rad-4 o-f-hidden\" data-pid=\"" + item.sku + "\">" +
                        "<img src=\"" + item.image_url + "\" alt=\"IMG-PRODUCT\">" +
                        "</div>" +
                        "</td>" +
                        "<td class=\"column-2\">" + item.name + "</td>" +
                        "<td class=\"column-3\"><span>$</span><span class='item-price'>" + item.price + "</span></td>" +
                        "<td class=\"column-4 t-center\">" + quantity + "</td>" +
                        "<td class=\"column-5\"><span>$</span><span class='item-total-price'>" + item.price * quantity + "</span></td>" +
                        "</tr>");
                    total += item.price * quantity;
                    currencySign = "$";
                    resolve();
                });
            });
        });
    } else {
        $('#emptyContainer').append(
            "<div class=\"flex-c p-t-25 p-b-25 bo9 p-l-35 p-r-60 p-lr-15-sm\">" +
            "  <h3 class=\"m-text15 t-center\">Empty Cart</h3>" +
            "</div>");
    }

    Promise.all(promises).then(() => {
        $('.cart-img-product').on('click', function(){
            removeFromCart($(this).data('pid'));
        });
        $('.currency').text(currencySign);
        $('#subTotal').text(total);
        $('#total').text(total);
    });

    $('#btn-checkout').on('click', function () {
        const cart = JSON.parse(sessionStorage.getItem('delvify_cart')) || { items: [] };
        const items = [];
        const getItems = cart.items.map(function ({ sku, quantity }) {
            return new Promise((resolve, reject) => {
                api('GET', '/product', { sku }, (item) => {
                    items.push({ pid: item.sku, quantity, currency: item.currency, price: item.price });
                    resolve();
                });
            });
        });
        Promise.all(getItems).then((results) => {
            if (getItems.length > 0) {
                swal('Success', "order placed", "success");
                const oid = `${Math.floor(Math.random() * 2147483647)}.${Date.now()}`;
                recommendationRecord('PURCHASE', { oid, order: items });
                sessionStorage.removeItem('delvify_cart');
                $('#table .table-row').remove();
                $('.header-icons-noti').text(0);
                $('#subTotal').text(0);
                $('#total').text(0);
                const emptyContainer = $('#emptyContainer');
                if (emptyContainer.length <= 0) {
                    emptyContainer.append(
                        "<div class=\"flex-c p-t-25 p-b-25 bo9 p-l-35 p-r-60 p-lr-15-sm\">" +
                        "  <h3 class=\"m-text15 t-center\">Empty Cart</h3>" +
                        "</div>");
                }
            }
        });
    })

});

function removeFromCart(sku) {
    const cart = JSON.parse(sessionStorage.getItem('delvify_cart')) || { items: [] };
    const index = cart.items.findIndex(function (item) {
        return item.sku == sku;
    });
    const subTotalElement =  $('#subTotal');
    const itemTotal = parseFloat($(`#table #table-row-${sku} .item-total-price`).text());
    const total = parseFloat(subTotalElement.text()) - itemTotal;

    if (index >= 0) {
        cart.items.splice(index, 1);
        $(`#table #table-row-${sku}`).remove();
    }
    sessionStorage.setItem('delvify_cart', JSON.stringify(cart));
    $('.header-icons-noti').text(cart.items.reduce((acc, item) => item.quantity + acc, 0));
    if (cart.items.length <= 0) {
        $('#emptyContainer').append(
            "<div class=\"flex-c p-t-25 p-b-25 bo9 p-l-35 p-r-60 p-lr-15-sm\">" +
            "  <h3 class=\"m-text15 t-center\">Empty Cart</h3>" +
            "</div>");
    }
    subTotalElement.text(total);
    $('#total').text(total);
}