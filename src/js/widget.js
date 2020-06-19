const CONFIG_API = process.env.CONFIG_API;
const ML_SERVER_API = process.env.ML_SERVER_API;
const GET_PRODUCTS_API = process.env.GET_PRODUCTS_API;
const ENGAGEMENT_API = process.env.ENGAGEMENT_API;
const userID = 'b5a08a5a-6542-406e-aee2-1ad48fcdc97d';
const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;
let uid = '';
let geo_location = '';
let device = '';
let config = {
    heading: { enabled: false },
    productName: { enable: false },
    price: { enabled: false },
    overlay: { enabled: false, computerVision: false },
    widgets: [],
}, widgets = [], currentProduct = null;

const eventMapper = (event) => {
    return ({
        impression: 'IMPRESSION',
            click: 'CLICK',
        add_to_cart: 'ADD_TO_CART',
        remove_from_cart: 'REMOVE_FROM_CART',
        purchase: 'PURCHASE',
    })[event];
};
const orderProductMapper = (product) => {
    const formatted = {
        SKU: product.sku,
        Price: product.price,
        Currency: product.currency,
        quantity: product.quantity,
    }
    return formatted;
};

function initSlick2(parent) {
    /*[ Slick2 ]
        ===========================================================*/
    $(`#${parent} .slick2`).slick({
        slidesToShow: 4,
        slidesToScroll: 4,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 6000,
        arrows: true,
        appendArrows: $(`#${parent} .wrap-slick2`),
        prevArrow:'<button class="arrow-slick2 prev-slick2"><div class="icon-left-arrow" aria-hidden="true"></div></button>',
        nextArrow:'<button class="arrow-slick2 next-slick2"><div class="icon-right-arrow" aria-hidden="true"></div></button>',
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4
                }
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
};

function getQuery()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function addQuery(url, queries = {})
{
    let newUrl = url;
    const exist = url.includes('?');
    newUrl += exist ? '&' : '?';
    Object.keys(queries).forEach(function (key, index) {
        newUrl += key + '=' + queries[key];
        if (index < Object.keys(queries).length - 1) {
            newUrl += '&';
        }
    });
    return newUrl.startsWith('/') ? newUrl.slice(1) : newUrl;
}

function setSession(key, value) {
    sessionStorage.setItem(key, value);
}

function getSession(key) {
    return sessionStorage.getItem(key);
}

function recordEngagement(type, options = {}) {
    const data = {
        SKU: options.SKU,
        products: options.products,
        geo_location,
        uid,
        device,
        location: options.location || getQuery()['delvifyrecolocation'],
        source: options.source || getQuery()['delvifyrecosource'],
        computerVision: !!options.computerVision,
    };
    switch (type) {
        case 'WIDGET_IMPRESSION':
        case 'IMPRESSION':
        case 'SHOW_OVERLAY':
        case 'CLICK':
        case 'ADD_CART':
        case 'PURCHASE':
            return request('POST', `${ENGAGEMENT_API}/${userID}`, {
                data: {
                    type,
                    location: data.location,
                    source: data.source,
                    device: data.device,
                    sessionID: data.uid,
                    SKU: data.SKU,
                    products: data.products,
                    computerVision: data.computerVision,
                }
            });
            break;
    }
}

function initWidget(widget) {
    const { location, type: source, heading: title, tagId, noOfItems } = widget;
    const { heading, productName, price, overlay } = config;
    const placeholder = document.getElementById(tagId);
    let getItems = null;
    let url = {
        TRENDING: '/recommendation/trending',
        SIMILAR: `${ML_SERVER_API}`,
        BEST_SELLING: '/recommendation/bestselling',
        INVENTORY: '/recommendation/inventory',
    }[source];
    if (source === 'SIMILAR') {
        getItems = () => { return request('POST', ML_SERVER_API, {
            data: {
                endpoint: 'getSimilarSkus',
                userID: userID,
                data: { sku: currentProduct.sku },
            },
        })
            .then((res) => {
                const skus = JSON.parse(res)['skus'].slice(0, noOfItems);
                return request('GET', addQuery(`${GET_PRODUCTS_API}/${userID}`, { sku: skus.join(',') }));
            })};
    } else {
        const orderBy = {
            TRENDING: 'CLICK',
            BEST_SELLING: 'PURCHASE',
            INVENTORY: 'PURCHASE',
        }[source];
        const order = {
            TRENDING: 'DESC',
            BEST_SELLING: 'DESC',
            INVENTORY: 'ASC',
        }[source];
        getItems = () => { return request('GET', addQuery(`${ENGAGEMENT_API}/${userID}`, {
            orderBy,
            order,
            limit: noOfItems,
        }))
            .then((res) => {
                const skus = res.map((item) => item.SKU);
                return request('GET', addQuery(`${GET_PRODUCTS_API}/${userID}`, { sku: skus.join(',') }));
            })};
    }
    if (placeholder) {
        getItems()
            .then(items => {
                recordEngagement('WIDGET_IMPRESSION', { location: location, source: source });

                $(`#${tagId}`).addClass("real-recommendation")
                .addClass("animated")
                .append(
                    styles +
                    "<section style=\"background-color: #f7f7f7; padding-top: 45px; padding-bottom: 105px\">" +
                    "  <div class=\"container\">" +
                    `    <div style="padding-bottom: 30px; ${ heading.enabled ? "" : "dis-none" }">` +
                    `      <h3 class=\"m-text5 t-center\" style='${ heading.fontSize ? `font-size: ${heading.fontSize}pt;` : ""} ${ heading.family && heading.family !== 'Default' ? `font-family: ${heading.family};` : "" } ${ heading.color ? `color: ${heading.color};` : "" }'>` + title + "</h3>" +
                    "    </div>" +
                    "    <!-- Slide2-->" +
                    "    <div class=\"wrap-slick2\">" +
                    "      <div class=\"slick2\" id=\"recommendedProducts\"></div>" +
                    "      <div class=\"recommended-details trans-0-5 w-size-0 op-0-0 shadow1 dis-none\" id=\"recommendedDetails\">" +
                    "        <div class=\"recommended-details-image wrap-pic-w p-t-30 p-b-30 p-l-15 p-r-15\" style=\"max-height: 400px\">" +
                    "           <a id='recommendedDetailsImageUrl'>" +
                    "           <img style=\"height: 100%\" id=\"recommendedDetailsImage\"/>" +
                    "           </a>" +
                    "        </div>" +
                    "        <div class=\"recommended-details-content p-t-30 p-b-30 p-l-15 p-r-15\" id=\"recommendedDetailsContent\">" +
                    "          <h4 class=\"product-detail-name m-text16 p-b-13\" id=\"recommendedDetailsName\"></h4>" +
                    "          <span class=\"m-text17\" id=\"recommendedDetailsPrice\" hidden></span>" +
                    "          <p class=\"s-text8 p-t-10\" id=\"recommendedDetailsDescription\"></p>" +
                    "          <div class=\"btn-recommended-addcart size9 trans-0-4 m-t-10 m-b-10\" id=\"btn-recommended-addcart\">" +
                    "          </div>" +
                    "        </div>" +
                    `        <div class='recommended-computer-vision ${ overlay.computerVision ? '' : 'dis-none' }'>` +
                    "           <div class='recommended-computer-vision-row'>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\" width='100%' height='100%'/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\"/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\"/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "           </div>" +
                    "           <div class='recommended-computer-vision-row'>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\"/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\"/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\"/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "           </div>" +
                    "           <div class='recommended-computer-vision-label'>Similar Looks powered by Delvify</div>" +

                    "        </div>" +
                    "        <div class=\"recommended-details-close\" id=\"recommendedDetailsClose\"><div class=\"icon-close\"></div></div>" +
                    "      </div>" +
                    "    </div>" +
                    "  </div>" +
                    "</section>"
                );

                initSlick2();
                items.forEach((item, index) => {
                    item.source = source;
                    recordEngagement('IMPRESSION', { SKU: item.SKU, location: location, source: source });

                    $(`#${tagId} #recommendedProducts`).append(
                        "<div class=\"item-slick2 p-l-15 p-r-15\">" +
                        "<div class=\"block2\">" +
                        "<div class=\"block2-img wrap-pic-w of-hidden pos-relative\">" +
                        "<a href=\"" + addQuery(item.OriginalUrl, { delvifyreco: true, delvifyrecolocation: location, delvifyrecosource: source }) + "\" class=\"recommended-product-image\" data-sku=\"" + item.SKU + "\" data-source=\"" + item.source +"\">" +
                        "<img src=\"" + item.Image + "\" alt=\"IMG-PRODUCT\">" +
                        "</a>" +
                        `<a href=\"javascript:void(0);\" class=\"block2-btn-more ${ overlay.enabled ? "" : "dis-none" }\">` +
                        "<div class=\"btn-more-ctn flex-c-m shadow1\" data-sku=\"" + item.SKU + "\" data-name=\"" + item.Name + "\" data-price=\"" + item.Price + "\" data-description=\"" + item.Description + "\" data-image=\"" + item.Image + "\" data-url=\"" + item.OriginalUrl + "\" >" +
                        `<div style='width: 16px; height: 16px;' class='${ overlay.computerVision ? 'icon-cv' : 'icon-bars' }' />` +
                        "</div>" +
                        "</a>" +
                        "</div>" +
                        "<div class='d-flex justify-content-between mt-1'>" +
                        `<div class='mr-1 ${ productName.enabled ? "" : "dis-none" }' style='${productName.fontSize ? `font-size: ${productName.fontSize}pt;` : ""} ${productName.family && productName.family !== 'Default' ? `font-family: ${productName.family};` : "" } ${productName.color ? `color: ${productName.color};` : "" }'>` + item.Name + "</div>" +
                        `<div hidden class='${ price.enabled ? "" : "dis-none" }' style='${productName.fontSize ? `font-size: ${productName.fontSize}pt;` : ""} ${productName.family && productName.family !== 'Default' ? `font-family: ${productName.family};` : "" } ${productName.color ? `color: ${productName.color};` : "" }'>` + item.Price + "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>");
                });

                $(`#${tagId}>.slick2`).slick('unslick');
                initSlick2(tagId);

                //On Detail Click
                const moreBtns = placeholder.getElementsByClassName('btn-more-ctn');
                Array.from(moreBtns).forEach((button) => {
                    button.onclick = (e) => {
                        const sku = button.getAttribute('data-sku');
                        const name = button.getAttribute('data-name');
                        const price = button.getAttribute('data-price');
                        const description = button.getAttribute('data-description');
                        const image = button.getAttribute('data-image');
                        const originalUrl = button.getAttribute('data-url');

                        recordEngagement('SHOW_OVERLAY', { SKU: sku, location: location, source: source });

                        resetCVBlocks();

                        $(`#${tagId} #recommendedDetailsName`).text(name);
                        $(`#${tagId} #recommendedDetailsPrice`).text(`$${price}`);
                        $(`#${tagId} #recommendedDetailsDescription`).text(description);
                        $(`#${tagId} #recommendedDetailsImageUrl`).attr('href', addQuery(originalUrl, { delvifyreco: true, delvifyrecolocation: location, delvifyrecosource: source }));
                        $(`#${tagId} #recommendedDetailsImageUrl`).attr('data-sku', sku);
                        $(`#${tagId} #recommendedDetailsImage`).attr('src', image);
                        $(`#${tagId} #recommendedDetails`).removeClass('dis-none');
                        setTimeout(function () {
                            $(`#${tagId} #recommendedDetails`).addClass('flex-row').removeClass('w-size-0').removeClass('op-0-0').addClass('w-size-full');
                        }, 500);

                        request('POST', ML_SERVER_API, {
                            data: {
                                endpoint: 'imageSearchBySKU',
                                userID: userID,
                                data: { sku: sku }
                            }
                        })
                        .then((res) => {
                            const skus = JSON.parse(res)['skus'].slice(0, 6);
                            return request('GET', addQuery(`${GET_PRODUCTS_API}/${userID}`, { sku: skus.join(',') }));
                        })
                        .then((cvItems) => {
                            const cvBlocks = document.getElementsByClassName("recommended-computer-vision-block");
                            Array.from(cvBlocks).forEach((block, index) => {
                                let loading = null;
                                let imageWrapper = null;
                                let image = null;
                                let more = null;
                                let moreBtn = null;
                                const childNodes = block.childNodes;
                                for (let i = 0; i < childNodes.length; i++) {
                                    const classList = childNodes[i].classList ? Array.from(childNodes[i].classList) : [];
                                    if (classList.includes('recommended-computer-vision-loading')) {
                                        loading = childNodes[i];
                                    }
                                    if (classList.includes('recommended-computer-vision-image-wrapper')) {
                                        imageWrapper = childNodes[i];
                                        const imageWrapperChildNodes = imageWrapper.childNodes;
                                        for (let j = 0; j < imageWrapperChildNodes.length; j++) {
                                            if (Array.from(imageWrapperChildNodes[j].classList || []).includes('recommended-computer-vision-image')) {
                                                image = imageWrapperChildNodes[j];
                                            }
                                        }
                                    }
                                    if (classList.includes('block2-btn-more')) {
                                        more = childNodes[i];
                                        const moreChildNodes = more.childNodes;
                                        for (let k = 0; k < moreChildNodes.length; k++) {
                                            if (Array.from(moreChildNodes[k].classList || []).includes('btn-more-ctn')) {
                                                moreBtn = moreChildNodes[k];
                                            }
                                        }
                                    }
                                }
                                loading.classList.add('dis-none');
                                if (cvItems[index]) {
                                    moreBtn.setAttribute('data-sku', cvItems[index].SKU);
                                    moreBtn.setAttribute('data-name', cvItems[index].Name);
                                    moreBtn.setAttribute('data-description', cvItems[index].Description);
                                    moreBtn.setAttribute('data-price', cvItems[index].Price);
                                    moreBtn.setAttribute('data-image', cvItems[index].Image);
                                    moreBtn.setAttribute('data-url', cvItems[index].OriginalUrl);
                                    imageWrapper.setAttribute('href', addQuery(cvItems[index].OriginalUrl, { delvifyreco: true, delvifyrecolocation: location, delvifyrecosource: source }));
                                    imageWrapper.setAttribute('data-sku', cvItems[index].SKU);
                                    imageWrapper.setAttribute('data-name', cvItems[index].Name);
                                    imageWrapper.setAttribute('data-description', cvItems[index].Description);
                                    imageWrapper.setAttribute('data-price', cvItems[index].Price);
                                    imageWrapper.setAttribute('data-image', cvItems[index].Image);
                                    image.src = cvItems[index].Image;
                                    more.classList.remove('dis-none');
                                    imageWrapper.classList.remove('dis-none');
                                }
                            });
                        });
                    }
                });

                $(`#${tagId} #recommendedDetailsClose`).click(function () {
                    $(`#${tagId} #recommendedDetails`).removeClass('w-size-full').addClass('op-0-0').addClass('w-size-0').removeClass('flex-row');
                    setTimeout(function () {
                        $(`#${tagId} #recommendedDetails`).addClass('dis-none');
                        resetCVBlocks();
                    }, 500);
                });

                //On Product Click
                const productsImages = document.getElementsByClassName('recommended-product-image');
                const cvProductsImages = document.getElementsByClassName('recommended-computer-vision-image-wrapper');
                const detailProductImage = document.getElementById('recommendedDetailsImageUrl');
                Array.from(productsImages).forEach((productsImage) => {
                    productsImage.onclick = function (e){
                        const sku = productsImage.getAttribute('data-sku');
                        e.preventDefault();
                        recordEngagement("CLICK", { SKU: sku, location: location, source: source })
                            .finally(() => {
                                productsImage.onclick = undefined;
                                productsImage.click();
                            });
                    }
                });
                Array.from(cvProductsImages).forEach((cvProductsImage) => {
                    cvProductsImage.onclick = function (e){
                        const sku = cvProductsImage.getAttribute('data-sku');
                        e.preventDefault();
                        recordEngagement("CLICK", { SKU: sku, location: location, source: source, computerVision: true })
                            .finally(() => {
                                cvProductsImage.onclick = undefined;
                                cvProductsImage.click();
                            });
                    }
                });
                detailProductImage.onclick = function (e){
                    const sku = detailProductImage.getAttribute('data-sku');
                    e.preventDefault();
                    recordEngagement("CLICK", { SKU: sku, location: location, source: source })
                        .finally(() => {
                            detailProductImage.onclick = undefined;
                            detailProductImage.click();
                        });
                }
            })
    };
}

const resetCVBlocks = () => {
    const cvBlocks = document.getElementsByClassName("recommended-computer-vision-block");
    Array.from(cvBlocks).forEach((block, index) => {
        let loading = null;
        let imageWrapper = null;
        let image = null;
        let more = null;
        let moreBtn = null;
        const childNodes = block.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const classList = childNodes[i].classList ? Array.from(childNodes[i].classList) : [];
            if (classList.includes('recommended-computer-vision-loading')) {
                loading = childNodes[i];
            }
            if (classList.includes('recommended-computer-vision-image-wrapper')) {
                imageWrapper = childNodes[i];
                const imageWrapperChildNodes = imageWrapper.childNodes;
                for (let j = 0; j < imageWrapperChildNodes.length; j++) {
                    if (Array.from(imageWrapperChildNodes[j].classList || []).includes('recommended-computer-vision-image')) {
                        image = imageWrapperChildNodes[j];
                    }
                }
            }
            if (classList.includes('block2-btn-more')) {
                more = childNodes[i];
                const moreChildNodes = more.childNodes;
                for (let k = 0; k < moreChildNodes.length; k++) {
                    if (Array.from(moreChildNodes[k].classList || []).includes('btn-more-ctn')) {
                        moreBtn = moreChildNodes[k];
                    }
                }
            }
        }
        loading.classList.remove('dis-none');
        moreBtn.removeAttribute('data-sku');
        moreBtn.removeAttribute('data-name');
        moreBtn.removeAttribute('data-description');
        moreBtn.removeAttribute('data-price');
        moreBtn.removeAttribute('data-image');
        moreBtn.removeAttribute('data-url');
        more.classList.add('dis-none');
        image.src = "";
        imageWrapper.removeAttribute('href');
        imageWrapper.removeAttribute('data-sku');
        imageWrapper.removeAttribute('data-name');
        imageWrapper.removeAttribute('data-description');
        imageWrapper.removeAttribute('data-price');
        imageWrapper.removeAttribute('data-image');
        imageWrapper.classList.add('dis-none');
    });
}

const deviceDetector = (function ()
{
    var ua = navigator.userAgent.toLowerCase();
    var detect = (function(s)
    {
        if(s===undefined)s=ua;
        else ua = s.toLowerCase();
        if(/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua))
            return 'TABLET';
        else
        if(/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/.test(ua))
            return 'MOBILE';
        else return 'DESKTOP';
    });
    return{
        device:detect(),
        detect:detect,
        isMobile:((detect()!='desktop')?true:false),
        userAgent:ua
    };
}());

function request(method = 'GET', url = '', settings = {}) {
    const { id, verbal = false, params, data, responseType, ...setting } = settings;
    const parsedUrl = params ? addQuery(url, params) : url;
    return new Promise(function (resolve, reject) {
        const xhttp = new XMLHttpRequest();
        if (responseType === 'blob') {
            xhttp.responseType = 'blob';
        }
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const response = verbal ? this.responseText : responseType === 'blob' ? this.response : JSON.parse(this.responseText);
                console.log(`Request success: ${parsedUrl}`, data, response);
                return resolve(response);
            }
        };
        xhttp.onerror = function () {
            console.log(`Request failed: ${parsedUrl}`);
            return reject(new Error(`Request failed: ${parsedUrl}`));
        };
        xhttp.open(method, parsedUrl);
        xhttp.setRequestHeader("Content-Type", data instanceof FormData ? "multipart/form-data" : "application/json");
        xhttp.send(data ? data instanceof FormData ? data : JSON.stringify(data) : null);
    });
}

const push = function (data) {
    console.log('push', data);
    const { event, product, products } = data;
    window.delvifyDataLayer = window.delvifyDataLayer.concat(data);
    currentProduct = product;
    switch (event) {
        case 'init':
            widgets.forEach( function (widget) {
                if (!widget.inited) {
                    widget.inited = true;
                    initWidget(widget);
                }
            });
            break;
        case 'impression':
        case 'click':
        case 'add_to_cart':
        case 'remove_from_cart':
            recordEngagement(eventMapper(event), {
                SKU: product.sku
            });
            break;
        case 'purchase':
            recordEngagement('PURCHASE', {
                products: products.map(orderProductMapper),
            });
            break;
    }
};

window.recommendationRecord = recordEngagement;

(function () {
    window.delvifyDataLayer['push'] = push;
    const rra = getSession('rra');
    if (!rra) {
        const rand = Math.floor(Math.random() * 2147483647);
        uid = `rra.${rand}.${Date.now()}`;
        setSession('rra', uid);
    } else {
        uid = rra;
    };
    device = deviceDetector.device;
    const tempDataLayer = window.delvifyDataLayer.slice(0, window.delvifyDataLayer.length);
    tempDataLayer.forEach((data, index) => {
        const temp = data;
        window.delvifyDataLayer.splice(index, 1);
        push(temp);
    });
    request('GET', 'http://ip-api.com/json')
        .then((res) => {
            geo_location = res.country;
        })
        .finally(() => {
            request('GET', `${CONFIG_API}/${userID}`)
                .then((result) => {
                    if (!result || result.length <= 0) {
                        console.log('No configurations');
                    } else {
                        config = {...config, ...result[0]};
                        widgets = config.widgets;
                        widgets.forEach( function (widget) {
                            if (currentProduct || widget.type !== 'SIMILAR') {
                                widget.inited = true;
                                initWidget(widget);
                            }
                        })
                    }
                });
        })
})();

const styles =
    "<style>" +
    "" +
    "button {" +
    "outline: none !important;" +
    "border: none;" +
    "background: transparent;" +
    "}" +
    "" +
    "button:hover {" +
    "cursor: pointer;" +
    "}" +
    ".real-recommendation .of-hidden {overflow: hidden;}" +
    ".real-recommendation .pos-relative {position: relative;}" +
    ".real-recommendation a {" +
    "  font-weight: 400;" +
    "font-size: 15px;" +
    "line-height: 1.7;" +
    "color: #666666;" +
    "margin: 0px;" +
    "transition: all 0.4s;" +
    "-webkit-transition: all 0.4s;" +
    "  -o-transition: all 0.4s;" +
    "  -moz-transition: all 0.4s;" +
    "}" +
    "" +
    ".real-recommendation a:focus {" +
    "outline: none !important;" +
    "}" +
    "" +
    ".real-recommendation a:hover {" +
    "text-decoration: none;" +
    "color: #e65540;" +
    "}" +
    ".real-recommendation .animated {" +
    "  animation-duration: 1s;" +
    "  animation-fill-mode: both;" +
    "}" +
    ".real-recommendation .slick-slider" +
    "{" +
    "    position: relative;" +
    "    display: block;" +
    "    box-sizing: border-box;" +
    "    -webkit-user-select: none;" +
    "       -moz-user-select: none;" +
    "        -ms-user-select: none;" +
    "            user-select: none;" +
    "    -webkit-touch-callout: none;" +
    "    -khtml-user-select: none;" +
    "    -ms-touch-action: pan-y;" +
    "        touch-action: pan-y;" +
    "    -webkit-tap-highlight-color: transparent;" +
    "    outline: none !important;" +
    "}" +
    ".real-recommendation .slick-list" +
    "{" +
    "    position: relative;" +
    "    display: block;" +
    "    overflow: hidden;" +
    "    margin: 0;" +
    "    padding: 0;" +
    "}" +
    ".real-recommendation .slick-list:focus" +
    "{" +
    "    outline: none;" +
    "}" +
    ".real-recommendation .slick-list.dragging" +
    "{" +
    "    cursor: pointer;" +
    "    cursor: hand;" +
    "}" +
    ".real-recommendation .slick-slider .slick-track," +
    ".real-recommendation .slick-slider .slick-list" +
    "{" +
    "    -webkit-transform: translate3d(0, 0, 0);" +
    "       -moz-transform: translate3d(0, 0, 0);" +
    "        -ms-transform: translate3d(0, 0, 0);" +
    "         -o-transform: translate3d(0, 0, 0);" +
    "            transform: translate3d(0, 0, 0);" +
    "}" +
    ".real-recommendation .slick-track" +
    "{" +
    "    position: relative;" +
    "    top: 0;" +
    "    left: 0;" +
    "    display: block;" +
    "    margin-left: auto;" +
    "    margin-right: auto;" +
    "}" +
    ".real-recommendation .slick-track:before," +
    ".real-recommendation .slick-track:after" +
    "{" +
    "    display: table;" +
    "    content: '';" +
    "}" +
    ".real-recommendation .slick-track:after" +
    "{" +
    "    clear: both;" +
    "}" +
    ".real-recommendation .slick-loading .slick-track" +
    "{" +
    "    visibility: hidden;" +
    "}" +
    ".real-recommendation .slick-slide" +
    "{" +
    "    display: none;" +
    "    float: left;" +
    "" +
    "    height: 100%;" +
    "    min-height: 1px;" +
    "}" +
    ".real-recommendation [dir='rtl'] .slick-slide" +
    "{" +
    "    float: right;" +
    "}" +
    ".real-recommendation .slick-slide img" +
    "{" +
    "    display: block;" +
    "}" +
    ".real-recommendation .slick-slide.slick-loading img" +
    "{" +
    "    display: none;" +
    "}" +
    ".real-recommendation .slick-slide.dragging img" +
    "{" +
    "    pointer-events: none;" +
    "}" +
    ".real-recommendation .slick-initialized .slick-slide" +
    "{" +
    "    display: block;" +
    "}" +
    ".real-recommendation .slick-loading .slick-slide" +
    "{" +
    "    visibility: hidden;" +
    "}" +
    ".real-recommendation .slick-vertical .slick-slide" +
    "{" +
    "    display: block;" +
    "" +
    "    height: auto;" +
    "" +
    "    border: 1px solid transparent;" +
    "}" +
    ".real-recommendation .slick-arrow.slick-hidden {" +
    "    display: none;" +
    "}" +
    ".real-recommendation .wrap-slick2 {" +
    "  position: relative;" +
    "  margin-right: -15px;" +
    "  margin-left: -15px;" +
    "}" +
    "" +
    "/* ------------------------------------ */" +
    ".real-recommendation .arrow-slick2 {" +
    "  position: absolute;" +
    "  z-index: 100;" +
    "  top: calc((100% - 70px) / 2);" +
    "  -webkit-transform: translateY(-50%);" +
    "  -moz-transform: translateY(-50%);" +
    "  -ms-transform: translateY(-50%);" +
    "  -o-transform: translateY(-50%);" +
    "  transform: translateY(-50%);" +
    "  font-size: 39px;" +
    "  color: #cccccc;" +
    "" +
    "  -webkit-transition: all 0.4s;" +
    "  -o-transition: all 0.4s;" +
    "  -moz-transition: all 0.4s;" +
    "  transition: all 0.4s;" +
    "}" +
    "" +
    ".real-recommendation .arrow-slick2:hover {" +
    "  color: #666666;" +
    "}" +
    "" +
    ".real-recommendation .next-slick2 {" +
    "  right: -30px;" +
    "}" +
    "" +
    ".real-recommendation .prev-slick2 {" +
    "  left: -30px;" +
    "}" +
    "" +
    "@media (max-width: 1280px) {" +
    "  .real-recommendation .next-slick2 {" +
    "    right: 0px;" +
    "  }" +
    "" +
    "  .real-recommendation .prev-slick2 {" +
    "    left: 0px;" +
    "  }" +
    "}" +
    "" +
    "@media (max-width: 1610px) {" +
    "  .real-recommendation .rs1-slick2 .next-slick2 {" +
    "    right: 0px;" +
    "  }" +
    "" +
    "  .real-recommendation .rs1-slick2 .prev-slick2 {" +
    "    left: 0px;" +
    "  }" +
    "}" +
    ".real-recommendation .recommended-details {" +
    "    background-color: white;" +
    "    top: 0;" +
    "    position: absolute;" +
    "    justify-content: center;" +
    "    z-index: 101;" +
    "    flex-wrap: wrap;" +
    "    padding-left: 46px;" +
    "}" +
    "" +
    ".real-recommendation .recommended-details-close {" +
    "    position: absolute;" +
    "    top: 0;" +
    "    left: 0;" +
    "    margin: 15px;" +
    "    cursor: pointer;" +
    "}" +
    "" +
    ".real-recommendation .btn-more-ctn {" +
    "    border-radius: 50px;" +
    "    background-color: white;" +
    "    position: absolute;" +
    "    bottom: 0;" +
    "    right: 0;" +
    "    width: 34px;" +
    "    height: 34px;" +
    "    margin: 10px;" +
    "}" +
    "" +
    ".real-recommendation .recommended-details-image {" +
    "    width: 35%;" +
    "    flex: 1 1;" +
    "    min-width: 200px;" +
    "}" +
    "" +
    ".real-recommendation .recommended-details-image img {" +
    "    object-fit: contain;" +
    "}" +
    "" +
    ".real-recommendation .recommended-details-content {" +
    "    flex: 1;" +
    "}" +
    ".real-recommendation .trans-0-4 {" +
    "-webkit-transition: all 0.4s;" +
    "    -o-transition: all 0.4s;" +
    "    -moz-transition: all 0.4s;" +
    "    transition: all 0.4s;" +
    "}" +
    ".real-recommendation .trans-0-5 {" +
    "-webkit-transition: all 0.5s;" +
    "    -o-transition: all 0.5s;" +
    "    -moz-transition: all 0.5s;" +
    "    transition: all 0.5s;" +
    "}" +
    ".real-recommendation .p-t-45 {padding-top: 45px;}" +
    ".real-recommendation .p-b-50 {padding-bottom: 50px;}" +
    ".real-recommendation .container {" +
    "   max-width: 1200px;" +
    "}" +
    ".real-recommendation .p-b-60 {padding-bottom: 60px;}" +
    "" +
    ".real-recommendation .m-text5 {" +
    "font-size: 30px;" +
    "color: #222222;" +
    "line-height: 1.2;" +
    "text-transform: uppercase;" +
    "}" +
    "" +
    ".real-recommendation .t-center {text-align: center;}"+
    "" +
    ".real-recommendation .w-size-0 {" +
    "    width: 0;" +
    "}" +
    "" +
    ".real-recommendation .op-0-0 {opacity: 0;}" +
    "" +
    ".real-recommendation .wrap-pic-w img {width: 100%;}" +
    "" +
    ".real-recommendation .p-t-30 {padding-top: 30px;}" +
    "" +
    ".real-recommendation .p-b-30 {padding-bottom: 30px;}" +
    "" +
    ".real-recommendation .p-l-15 {padding-left: 15px;}" +
    "" +
    ".real-recommendation .p-r-15 {padding-right: 15px;}" +
    ".real-recommendation .p-r-50 {padding-right: 50px;}" +
    ".real-recommendation .m-text16 {" +
    "font-size: 24px;" +
    "color: #222222;" +
    "line-height: 1.5;" +
    "}" +
    "" +
    ".real-recommendation [hidden] {" +
    "    display: none!important;" +
    "}" +
    ".real-recommendation .p-b-13 {padding-bottom: 13px;}" +
    "" +
    ".real-recommendation .s-text8, .s-text8 a {" +
    "font-size: 13px;" +
    "color: #888888;" +
    "line-height: 1.8;" +
    "}" +
    "" +
    ".real-recommendation .p-t-10 {padding-top: 10px;}" +
    "" +
    ".real-recommendation .size9 {" +
    "width: 162px;" +
    "height: 45px;" +
    "}" +
    "" +
    ".real-recommendation .m-t-10 {margin-top: 10px;}" +
    "" +
    ".real-recommendation .m-b-10 {margin-bottom: 10px;}" +
    "" +
    ".real-recommendation .flex-c-m {" +
    "display: -webkit-box;" +
    "display: -webkit-flex;" +
    "display: -moz-box;" +
    "display: -ms-flexbox;" +
    "display: flex;" +
    "justify-content: center;" +
    "-ms-align-items: center;" +
    "align-items: center;" +
    "}" +
    "" +
    ".real-recommendation .sizefull {" +
    "width: 100%;" +
    "height: 100%;" +
    "}" +
    "" +
    ".real-recommendation .bg1 {background-color: #222222;}" +
    "" +
    ".real-recommendation .bo-rad-23 {border-radius: 23px;}" +
    "" +
    ".real-recommendation .hov1:hover {" +
    "    background-color: #e65540;" +
    "  color: white;" +
    "}" +
    "" +
    ".real-recommendation .s-text1 {" +
    "font-size: 15px;" +
    "color: white;" +
    "text-transform: uppercase;" +
    "}" +
    "" +
    ".real-recommendation .shadow1 {" +
    "box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.1);" +
    "-moz-box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.1);" +
    "-webkit-box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.1);" +
    "-o-box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.1);" +
    "-ms-box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.1);" +
    "}" +
    "" +
    ".real-recommendation .fs-24 {font-size: 24px;}" +
    ".real-recommendation .fs-16 {font-size: 16px;}" +
    ".real-recommendation .fs-32 {font-size: 32px;}" +
    "" +
    ".real-recommendation .flex-row {" +
    "display: -webkit-box;" +
    "display: -webkit-flex;" +
    "display: -moz-box;" +
    "display: -ms-flexbox;" +
    "display: flex;" +
    "-webkit-flex-direction: row;" +
    "-moz-flex-direction: row;" +
    "-ms-flex-direction: row;" +
    "-o-flex-direction: row;" +
    "flex-direction: row;" +
    "}" +
    ".real-recommendation .dis-none {display: none !important;}" +
    ".real-recommendation .w-size-full {" +
    "    width: 100%;" +
    "}" +
    ".real-recommendation .bgwhite {  }" +
    ".real-recommendation .icon-close { " +
    "   width: 20px;" +
    "   height: 20px;" +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 40.8 40.8' style='enable-background:new 0 0 40.8 40.8;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23707070;%7D%0A%3C/style%3E%3Cg id='Group_4' transform='translate(-738.086 -937.086)'%3E%3Cpath class='st0' d='M777.5,977.5c-0.3,0-0.5-0.1-0.7-0.3l-38-38c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l38,38c0.4,0.4,0.4,1,0,1.4 C778,977.4,777.8,977.5,777.5,977.5z'/%3E%3Cpath class='st0' d='M739.5,977.5c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l38-38c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-38,38 C740,977.4,739.8,977.5,739.5,977.5z'/%3E%3C/g%3E%3C/svg%3E%0A\");" +
    " }" +
    ".real-recommendation .icon-cv { " +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 37.9 37.9' style='enable-background:new 0 0 37.9 37.9;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23707070;%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M18.9,27.8c-4.9,0-8.9-4-8.9-8.9c0-4.9,4-8.9,8.9-8.9c4.9,0,8.9,4,8.9,8.9C27.8,23.8,23.8,27.8,18.9,27.8z M18.9,12.1c-3.8,0-6.9,3.1-6.9,6.9s3.1,6.9,6.9,6.9s6.9-3.1,6.9-6.9S22.7,12.1,18.9,12.1z'/%3E%3Cg%3E%3Cpath class='st0' d='M0.8,12.6c0.4,0,0.8-0.4,0.8-0.8V3.9c0-1.3,1.1-2.4,2.4-2.4h7.9c0.4,0,0.8-0.4,0.8-0.8S12.3,0,11.8,0H3.9 C1.8,0,0,1.8,0,3.9v7.9C0,12.3,0.4,12.6,0.8,12.6z'/%3E%3Cpath class='st0' d='M33.9,0H26c-0.4,0-0.8,0.4-0.8,0.8s0.4,0.8,0.8,0.8h7.9c1.3,0,2.4,1.1,2.4,2.4v7.9c0,0.4,0.4,0.8,0.8,0.8 c0.4,0,0.8-0.4,0.8-0.8V3.9C37.9,1.8,36.1,0,33.9,0z'/%3E%3Cpath class='st0' d='M11.8,36.3H3.9c-1.3,0-2.4-1.1-2.4-2.4V26c0-0.4-0.4-0.8-0.8-0.8S0,25.6,0,26v7.9c0,2.2,1.8,3.9,3.9,3.9h7.9 c0.4,0,0.8-0.4,0.8-0.8C12.6,36.7,12.3,36.3,11.8,36.3z'/%3E%3Cpath class='st0' d='M37.1,25.3c-0.4,0-0.8,0.4-0.8,0.8v7.9c0,1.3-1.1,2.4-2.4,2.4H26c-0.4,0-0.8,0.4-0.8,0.8 c0,0.4,0.4,0.8,0.8,0.8h7.9c2.2,0,3.9-1.8,3.9-3.9V26C37.9,25.6,37.5,25.3,37.1,25.3z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A\");" +
    " }" +
    ".real-recommendation .icon-bars { " +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 40 38' style='enable-background:new 0 0 40 38;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23707070;%7D%0A%3C/style%3E%3Cg id='Group_6' transform='translate(-249.5 -964.5)'%3E%3Cpath class='st0' d='M288.5,966.5h-38c-0.6,0-1-0.4-1-1s0.4-1,1-1h38c0.6,0,1,0.4,1,1S289.1,966.5,288.5,966.5z'/%3E%3Cpath class='st0' d='M288.5,984.5h-38c-0.6,0-1-0.4-1-1s0.4-1,1-1h38c0.6,0,1,0.4,1,1S289.1,984.5,288.5,984.5z'/%3E%3Cpath class='st0' d='M288.5,1002.5h-38c-0.6,0-1-0.4-1-1s0.4-1,1-1h38c0.6,0,1,0.4,1,1S289.1,1002.5,288.5,1002.5z'/%3E%3C/g%3E%3C/svg%3E\");" +
    "}" +
    ".real-recommendation .icon-left-arrow { " +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   width: 25px;" +
    "   height: 50px;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='angle-left' class='svg-inline--fa fa-angle-left fa-w-8' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 512'%3E%3Cpath fill='%23888888' d='M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z'%3E%3C/path%3E%3C/svg%3E\");" +
    "}" +
    ".real-recommendation .icon-right-arrow { " +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   width: 25px;" +
    "   height: 50px;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='angle-right' class='svg-inline--fa fa-angle-right fa-w-8' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 512'%3E%3Cpath fill='%23888888' d='M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z'%3E%3C/path%3E%3C/svg%3E\");" +
    "}" +
    ".real-recommendation .icon-loading { " +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   width: 25px;" +
    "   height: 25px;" +
    "   -webkit-animation:spin 4s linear infinite;" +
    "   -moz-animation:spin 4s linear infinite;" +
    "   animation:spin 4s linear infinite;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23707070;%7D%0A%3C/style%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M256.001,0c-8.284,0-15,6.716-15,15v96.4c0,8.284,6.716,15,15,15s15-6.716,15-15V15C271.001,6.716,264.285,0,256.001,0z' /%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M256.001,385.601c-8.284,0-15,6.716-15,15V497c0,8.284,6.716,15,15,15s15-6.716,15-15v-96.399 C271.001,392.316,264.285,385.601,256.001,385.601z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M196.691,123.272l-48.2-83.485c-4.142-7.175-13.316-9.633-20.49-5.49c-7.174,4.142-9.632,13.316-5.49,20.49l48.2,83.485 c2.778,4.813,7.82,7.502,13.004,7.502c2.545,0,5.124-0.648,7.486-2.012C198.375,139.62,200.833,130.446,196.691,123.272z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M389.491,457.212l-48.199-83.483c-4.142-7.175-13.316-9.633-20.49-5.49c-7.174,4.142-9.632,13.316-5.49,20.49 l48.199,83.483c2.778,4.813,7.82,7.502,13.004,7.502c2.545,0,5.124-0.648,7.486-2.012 C391.175,473.56,393.633,464.386,389.491,457.212z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M138.274,170.711L54.788,122.51c-7.176-4.144-16.348-1.685-20.49,5.49c-4.142,7.174-1.684,16.348,5.49,20.49 l83.486,48.202c2.362,1.364,4.941,2.012,7.486,2.012c5.184,0,10.226-2.69,13.004-7.503 C147.906,184.027,145.448,174.853,138.274,170.711z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M472.213,363.51l-83.484-48.199c-7.176-4.142-16.349-1.684-20.49,5.491c-4.142,7.175-1.684,16.349,5.49,20.49 l83.484,48.199c2.363,1.364,4.941,2.012,7.486,2.012c5.184,0,10.227-2.69,13.004-7.502 C481.845,376.825,479.387,367.651,472.213,363.51z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M111.401,241.002H15c-8.284,0-15,6.716-15,15s6.716,15,15,15h96.401c8.284,0,15-6.716,15-15 S119.685,241.002,111.401,241.002z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M497,241.002h-96.398c-8.284,0-15,6.716-15,15s6.716,15,15,15H497c8.284,0,15-6.716,15-15S505.284,241.002,497,241.002z' /%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M143.765,320.802c-4.142-7.175-13.314-9.633-20.49-5.49l-83.486,48.2c-7.174,4.142-9.632,13.316-5.49,20.49 c2.778,4.813,7.82,7.502,13.004,7.502c2.545,0,5.124-0.648,7.486-2.012l83.486-48.2 C145.449,337.15,147.907,327.976,143.765,320.802z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M477.702,128.003c-4.142-7.175-13.315-9.632-20.49-5.49l-83.484,48.2c-7.174,4.141-9.632,13.315-5.49,20.489 c2.778,4.813,7.82,7.503,13.004,7.503c2.544,0,5.124-0.648,7.486-2.012l83.484-48.2 C479.386,144.351,481.844,135.177,477.702,128.003z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M191.201,368.239c-7.174-4.144-16.349-1.685-20.49,5.49l-48.2,83.485c-4.142,7.174-1.684,16.348,5.49,20.49 c2.362,1.364,4.941,2.012,7.486,2.012c5.184,0,10.227-2.69,13.004-7.502l48.2-83.485 C200.833,381.555,198.375,372.381,191.201,368.239z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath class='st0' d='M384.001,34.3c-7.175-4.144-16.349-1.685-20.49,5.49l-48.199,83.483c-4.143,7.174-1.685,16.348,5.49,20.49 c2.362,1.364,4.941,2.012,7.486,2.012c5.184,0,10.226-2.69,13.004-7.502l48.199-83.483 C393.633,47.616,391.175,38.442,384.001,34.3z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A\");" +
    "}" +
    ".real-recommendation .mr-1 {" +
    "  margin-right: 0.25rem !important;" +
    "}" +
    ".real-recommendation .mt-1 {" +
    "  margin-top: 0.25rem !important;" +
    "}" +
    ".real-recommendation .justify-content-between {" +
    "  -ms-flex-pack: justify !important;" +
    "  justify-content: space-between !important;" +
    "}" +
    ".real-recommendation .d-flex {" +
    "  display: -ms-flexbox !important;" +
    "  display: flex !important;" +
    "}" +
    ".real-recommendation .color1 { color: #888888 }" +
    ".real-recommendation .m-text17 {" +
    "   font-family: Montserrat-Regular;" +
    "   font-size: 30px;" +
    "   color: #555555;" +
    "   line-height: 1.2;" +
    "}" +
    ".real-recommendation .recommended-computer-vision {" +
    "   display: flex;" +
    "   flex-direction: column;" +
    "   flex: 1 1 15%;" +
    "   padding: 10px;" +
    "}" +
    ".real-recommendation .recommended-computer-vision-row {" +
    "   display: flex;" +
    "   max-height: 250px;" +
    "   justify-content: space-between;" +
    "}" +
    ".real-recommendation .recommended-computer-vision .recommended-computer-vision-block {" +
    "    flex: 0 0 27%;" +
    "    position: relative;" +
    "    width: 10%;" +
    "    margin: 10px;" +
    "    height: 100%;" +
    // "    min-height: 200px;" +
    "    display: flex;" +
    "    align-items: center;" +
    "    justify-content: center;" +
    "}" +
    ".real-recommendation .recommended-computer-vision .recommended-computer-vision-image-wrapper {" +
    "    width: 100%;" +
    "    height: 100%;" +
    "}" +
    ".real-recommendation .recommended-computer-vision img {" +
    "    width: 100%;" +
    "    object-fit: cover;" +
    "    height: 100%;" +
    "}" +
    ".real-recommendation .recommended-computer-vision-label {" +
    "   font-family: sans-serif;" +
    "   font-size: 10pt;" +
    "   margin: -5px 10px 5px 0;" +
    "   color: #bcbcbc;" +
    "   font-weight: bold;" +
    "   text-align: right;" +
    "}" +
    "@-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }" +
    "@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }" +
    "@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }" +
    "</style>";