
export function api(method = 'GET', url = '', param = {}, onSuccess) {
    const { id, verbal = false, ...params } = param;
    url = process.env.API_HOST + url;
    if (id) {
        url = url + `/${id}`;
    }
    $.ajax({
        type: method,
        url: url,
        data: params,
        success: onSuccess,
        headers:{
            merchantid: 'db2',
        }
    });
}

export function readFile(file, options = { type: 'text', onSuccess: () => {} }) {
    $.ajax(file, {
        dataType: options.type,
        complete: function (xhr, status) {
            if (status === 'success') {
                let response = options.type === 'text' ? xhr.responseText : xhr.responseJSON;
                options.onSuccess(response);
            }
        }
    });
}

function getQuery()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = unescape(hash[1]);
    }
    return vars;
}

function addToCart(sku, quantity) {
    const cart = JSON.parse(sessionStorage.getItem( "delvify_cart" )) || { items: [] };
    let item = cart.items.find(function (t) {
        return t.sku == sku;
    });
    if (item) {
        item.quantity += parseInt(quantity);
    } else {
        item = { sku, quantity };
        cart.items.push(item);
    }
    $('.header-icons-noti').text(cart.items.reduce((acc, item) => item.quantity + acc, 0));
    sessionStorage.setItem("delvify_cart", JSON.stringify(cart));
}

function addListener(type, callback = () => {}) {
    switch (type) {
        case 'wishlist':
            $('.block2-btn-addwishlist').each(function(){
                var nameProduct = $(this).parent().parent().parent().find('.block2-name').html();
                $(this).on('click', function(){
                    swal(nameProduct, "is added to wishlist !", "success");
                });
            });
            break;
        case 'addCart':
            $('.block2-btn-addcart').each(function(){
                var nameProduct = $(this).parent().parent().parent().parent().find('.block2-name').html();
                $(this).on('click', function(){
                    swal(nameProduct, "is added to cart !", "success");
                });
            });
            break;
        case 'addCartDetails':
            $('.btn-addcart-product-detail').each(function(){
                var nameProduct = $('#productName').html();
                $(this).on('click', function(){
                    swal(nameProduct, "is added to cart !", "success");
                });
            });
            break;
        case 'addCartRelatedDetails':
            $('.btn-addcart-product-related-detail').each(function(){
                var nameProduct = $('#relatedDetailsName').html();
                $(this).on('click', function(){
                    swal(nameProduct, "is added to cart !", "success");
                });
            });
            break;
        case 'more':
            $('.btn-more').click(function () {
                callback($(this).data('pid'));
            });
            break;
    }
}

window.api = api;
window.readFile = readFile;
window.getQuery = getQuery;
window.addListener = addListener;
window.addToCart = addToCart;