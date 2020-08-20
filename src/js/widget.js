const userID = 'b5a08a5a-6542-406e-aee2-1ad48fcdc97d';
const environment = process.env.ENVIRONMENT;
const CONFIG_API = process.env.CONFIG_API;
const ML_SERVER_API = process.env.ML_SERVER_API;
const API_HOST = process.env.API_HOST || 'http://localhost:8081/api';
const GET_PRODUCTS_API = process.env.GET_PRODUCTS_API;
const ENGAGEMENT_API = process.env.ENGAGEMENT_API;
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

if (environment !== 'dev') {
    console.log = () => {};
}

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
        prevArrow:'<button class="arrow-slick2 prev-slick2"><div class="delvify-icon-left-arrow" aria-hidden="true"></div></button>',
        nextArrow:'<button class="arrow-slick2 next-slick2"><div class="delvify-icon-right-arrow" aria-hidden="true"></div></button>',
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
    const async = {
        WIDGET_IMPRESSION: true,
        IMPRESSION: true,
        SHOW_OVERLAY: true,
        CLICK: false,
        ADD_TO_CART: false,
        REMOVE_FROM_CART: false,
        PURCHASE: false,
    };
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
        },
        async: async,
    });
}

function initWidget(widget) {
    if (widget.init) return;
    console.log('initWidget', widget);
    const { location, type: source, heading: title, tagId, noOfItems } = widget;
    const { heading, productName, price, overlay } = config;
    const placeholder = $(`#${tagId}`);
    console.log(tagId, placeholder);
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
                const tag = $(`#${tagId}`);
                tag.addClass("real-recommendation")
                .addClass("animated")
                .append(
                    styles +
                    "<section style=\"padding-bottom: 105px\">" +
                    "  <div class=\"container\" style='margin: auto'>" +
                    `    <div style="padding-bottom: 30px; ${ heading.enabled ? "" : "dis-none" }">` +
                    `      <h3 class=\"real-recommendation-text5 t-center\" style='${ heading.fontSize ? `font-size: ${heading.fontSize}pt;` : ""} ${ heading.family && heading.family !== 'Default' ? `font-family: ${heading.family};` : "" } ${ heading.color ? `color: ${heading.color};` : "" }'>` + title + "</h3>" +
                    "    </div>" +
                    "    <!-- Slide2-->" +
                    "    <div class=\"wrap-slick2\">" +
                    "      <div class=\"slick2\" id=\"recommendedProducts\"></div>" +
                    "      <div class=\"recommended-details trans-0-5 w-size-0 op-0-0 shadow1 dis-none\" id=\"recommendedDetails\">" +
                    "        <div class=\"recommended-details-image wrap-pic-w p-t-30 p-b-30 p-l-50 p-r-15\" style=\"max-height: 400px\">" +
                    "           <a id='recommendedDetailsImageUrl'>" +
                    "           <img style=\"height: 100%\" id=\"recommendedDetailsImage\"/>" +
                    "           </a>" +
                    "        </div>" +
                    "        <div class=\"recommended-details-content p-t-30 p-b-30 p-l-15 p-r-15\" id=\"recommendedDetailsContent\">" +
                    "          <h4 class=\"product-detail-name real-recommendation-text16 p-b-13\" id=\"recommendedDetailsName\"></h4>" +
                    "          <span class=\"m-text17\" id=\"recommendedDetailsPrice\" hidden></span>" +
                    "          <p class=\"real-recommendation-text8 p-t-10\" id=\"recommendedDetailsDescription\"></p>" +
                    "          <div class=\"btn-recommended-addcart size9 trans-0-4 m-t-10 m-b-10 dis-none\" id=\"btn-recommended-addcart\">" +
                    "          </div>" +
                    "        </div>" +
                    `        <div class='recommended-computer-vision ${ overlay.computerVision ? '' : 'dis-none' }'>` +
                    "           <div class='recommended-computer-vision-row'>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading delvify-icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\" width='100%' height='100%'/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='delvify-icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading delvify-icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\"/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='delvify-icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading delvify-icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\"/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='delvify-icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "           </div>" +
                    "           <div class='recommended-computer-vision-row'>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading delvify-icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\"/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='delvify-icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading delvify-icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\"/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='delvify-icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "             <div class='recommended-computer-vision-block shadow1'>" +
                    "               <div class=\"recommended-computer-vision-loading delvify-icon-loading\"></div>" +
                    "               <a class=\"recommended-computer-vision-image-wrapper dis-none\">" +
                    "                 <img class=\"recommended-computer-vision-image\"/>" +
                    "               </a>" +
                    `               <a href=\"javascript:void(0);\" class=\"block2-btn-more dis-none\">` +
                    "                  <div class=\"btn-more-ctn flex-c-m shadow1\" >" +
                    "                    <div style='width: 16px; height: 16px;' class='delvify-icon-cv' />" +
                    "                  </div>" +
                    "               </a>" +
                    "             </div>" +
                    "           </div>" +
                    "           <div class='recommended-computer-vision-label'>Similar Looks powered by Delvify</div>" +

                    "        </div>" +
                    "        <div class=\"recommended-details-close\" id=\"recommendedDetailsClose\"><div class=\"delvify-icon-close\"></div></div>" +
                    "      </div>" +
                    "    </div>" +
                    "  </div>" +
                    "</section>"
                );

                initSlick2();
                const disableOverlay = tag.attr('data-disableai');
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
                        `<a href=\"javascript:void(0);\" class=\"block2-btn-more ${ overlay.enabled && !disableOverlay ? "" : "dis-none" }\">` +
                        "<div class=\"btn-more-ctn flex-c-m shadow1\" data-sku=\"" + item.SKU + "\" data-name=\"" + item.Name + "\" data-price=\"" + item.Price + "\" data-description=\"" + item.Description + "\" data-image=\"" + item.Image + "\" data-url=\"" + item.OriginalUrl + "\" >" +
                        `<div style='width: 16px; height: 16px;' class='${ overlay.computerVision ? 'delvify-icon-cv' : 'delvify-icon-bars' }' />` +
                        "</div>" +
                        "</a>" +
                        "</div>" +
                        "<div class='d-flex justify-content-between mt-1'>" +
                        `<div class='mr-1 text-left ${ productName.enabled ? "" : "dis-none" }' style='${productName.fontSize ? `font-size: ${productName.fontSize}pt;` : ""} ${productName.family && productName.family !== 'Default' ? `font-family: ${productName.family};` : "" } ${productName.color ? `color: ${productName.color};` : "" }'>` + item.Name + "</div>" +
                        `<div hidden class='${ price.enabled ? "" : "dis-none" }' style='${productName.fontSize ? `font-size: ${productName.fontSize}pt;` : ""} ${productName.family && productName.family !== 'Default' ? `font-family: ${productName.family};` : "" } ${productName.color ? `color: ${productName.color};` : "" }'>` + item.Price + "</div>" +
                        "</div>" +
                        "</div>" +
                        "</div>");
                });

                $(`#${tagId}>.slick2`).slick('unslick');
                initSlick2(tagId);

                //On Detail Click
                const moreBtns = $(`#${tagId} .btn-more-ctn`);
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
                        recordEngagement("CLICK", { SKU: sku, location: location, source: source });
                        productsImage.onclick = undefined;
                        productsImage.click();
                    }
                });
                Array.from(cvProductsImages).forEach((cvProductsImage) => {
                    cvProductsImage.onclick = function (e){
                        const sku = cvProductsImage.getAttribute('data-sku');
                        e.preventDefault();
                        recordEngagement("CLICK", { SKU: sku, location: location, source: source, computerVision: true });
                        cvProductsImage.onclick = undefined;
                        cvProductsImage.click();
                    }
                });
                detailProductImage.onclick = function (e){
                    const sku = detailProductImage.getAttribute('data-sku');
                    e.preventDefault();
                    recordEngagement("CLICK", { SKU: sku, location: location, source: source });
                    detailProductImage.onclick = undefined;
                    detailProductImage.click();
                }
            });
            widget.init = true;
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
};

const initSmartVision = (function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('id', 'delivfysmartvisioninput');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('hidden', true);
    document.body.appendChild(input);
    const uploadButton = document.getElementById('uploadButton');
    uploadButton.addEventListener('click', function(e) {
        e.preventDefault();
        $('#delivfysmartvisioninput').click();
        return false;
    });

    const searchPanel = document.createElement('div');
    searchPanel.setAttribute('class', 'delvify-smart-vision');
    searchPanel.innerHTML =
        "<div class='delvify-smart-vision-backdrop d-hidden-backdrop'></div>" +
        "<div class='delvify-smart-vision-panel d-hidden-panel'>" +
            "<div class='delvify-smart-vision-panel-upload'>" +
                "<div class='delvify-smart-vision-panel-h1'>Your upload</div>" +
                "<img src='https://delvify-recommendations-vendors.s3-ap-southeast-1.amazonaws.com/product_placeholder.png' class='delvify-smart-vision-panel-uploaded-image' id='delvifySmartVisionPanelUploadImage'/>" +
                "<div class='delvify-smart-vision-panel-upload-button' id='delvifySmartVisionUploadButton'>" +
                    "<i class='delvify-icon-camera'></i>" +
                    "<div class='delvify-smart-vision-panel-h2'>Upload another image</div>" +
                "</div>" +
            "</div>" +
            "<div class='delvify-smart-vision-panel-divider'></div>" +
            "<div class='delvify-smart-vision-panel-result'>" +
                "<div class='delvify-smart-vision-panel-h1'>Similar Items</div>" +
                "<div id='delvifySmartVisionPanelResult' class='delvify-smart-vision-panel-result-container'>" +
                "</div>" +
            "</div>" +
            "<div class='delvify-icon-close-sm' id='delvifySmartVisionCloseButton'></div>" +
        "</div>";
    searchPanel.setAttribute('hidden', true);
    const backdrop = searchPanel.getElementsByClassName('delvify-smart-vision-backdrop')[0];
    const panel = searchPanel.getElementsByClassName('delvify-smart-vision-panel')[0];
    document.body.appendChild(searchPanel);
    const delvifySmartVisionCloseButton = document.getElementById('delvifySmartVisionCloseButton');
    const delvifySmartVisionUploadButton = document.getElementById('delvifySmartVisionUploadButton');
    const delvifySmartVisionPanelUploadImage = document.getElementById('delvifySmartVisionPanelUploadImage');
    const delvifySmartVisionPanelResult = document.getElementById('delvifySmartVisionPanelResult');
    const closePanel = function() {
        backdrop.classList.add('d-hidden-backdrop');
        panel.classList.add('d-hidden-panel');
        input.value = "";
        setTimeout(function(){
            searchPanel.setAttribute('hidden', true);
        }, 500);
    };
    backdrop.addEventListener('click', function(e) {
        closePanel();
    });
    delvifySmartVisionCloseButton.addEventListener('click', function(e) {
        closePanel();
    });
    delvifySmartVisionUploadButton.addEventListener('click', function(e) {
        e.preventDefault();
        $('#delivfysmartvisioninput').click();
        return false;
    });
    input.addEventListener('change', function(e) {
        if ($(this).prop('files').length > 0) {
            const file = $(this).prop('files')[0];
            delvifySmartVisionPanelResult.innerHTML =
                "<div class='delvify-smart-vision-panel-result-block image-loading'>" +
                "<img src='https://delvify-recommendations-vendors.s3-ap-southeast-1.amazonaws.com/placeholder_1.png'/>" +
                "</div>" +
                "<div class='delvify-smart-vision-panel-result-block image-loading'>" +
                "<img src='https://delvify-recommendations-vendors.s3-ap-southeast-1.amazonaws.com/placeholder_2.png'/>" +
                "</div>" +
                "<div class='delvify-smart-vision-panel-result-block image-loading'>" +
                "<img src='https://delvify-recommendations-vendors.s3-ap-southeast-1.amazonaws.com/placeholder_3.png'/>" +
                "</div>" +
                "<div class='delvify-smart-vision-panel-result-block image-loading'>" +
                "<img src='https://delvify-recommendations-vendors.s3-ap-southeast-1.amazonaws.com/placeholder_4.png'/>" +
                "</div>";
            searchPanel.removeAttribute('hidden');
            setTimeout(() => {
                backdrop.classList.remove('d-hidden-backdrop');
                panel.classList.remove('d-hidden-panel');
            }, 200);
            delvifySmartVisionPanelUploadImage.setAttribute('src', URL.createObjectURL(file));

            resizeImage(file)
                .then((blob) => {
                    const image = new File([blob], file.name);
                    const formData = new FormData();
                    formData.append('image', image);
                    return request('POST', `${API_HOST}/fs/imageSearch/${userID}`, { data: formData });
                })
                .then((res) => {
                    const skus = res.skus;
                    return request('GET', addQuery(`${GET_PRODUCTS_API}/${userID}`, { sku: skus.join(',') }));
                })
                .then((products) => {
                    const eles = products.map((product) => `
                        <a href='${addQuery(product.OriginalUrl, { delvifyreco: true, delvifyrecolocation: 'search', delvifyrecosource: 'search' })}' class='delvify-smart-vision-panel-result-block'>
                            <img src='${product.Image}'/>
                            <div class='delvify-smart-vision-panel-result-description'>${product.Name}</div>
                            <div class='delvify-smart-vision-panel-h3 delvify-smart-vision-panel-result-price'>$${product.Price}</div>
                        </a>`
                    );
                    delvifySmartVisionPanelResult.innerHTML = eles.join('');
                })
                .catch(() => {
                    delvifySmartVisionPanelResult.innerHTML = 'No Results';
                });
        }
    });
});

const resizeImage = function (file) {
    const MAX_WIDTH = 600;
    const MAX_HEIGHT = 600;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'delivfysmartvisioncanvas');
    document.body.appendChild(canvas);
    return new Promise((res, rej) => {
        try {
            let img = new Image();
            img.src = window.URL.createObjectURL(file);
            img.onload = function() {
                const canvas = document.getElementById('delivfysmartvisioncanvas');
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;

                ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    res(blob);
                }, file.type);
            };
        } catch (e) {
            return rej(e);
        };
    });
};

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
    const { id, verbal = false, params, data, responseType, async = true, ...setting } = settings;
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
        xhttp.open(method, parsedUrl, async);
        // xhttp.setRequestHeader("Content-Type", data instanceof FormData ? false : "application/json");
        xhttp.send(data ? data instanceof FormData ? data : JSON.stringify(data) : null);
    });
}

function push (data) {
    console.log('push', data);
    const { event, product, products, tagId } = data;
    currentProduct = product || currentProduct;
    switch (event) {
        case 'reinit':
            widgets.forEach( function (widget) {
                if (widget.tagId === tagId) {
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

(function () {
    const rra = getSession('rra');
    if (!rra) {
        const rand = Math.floor(Math.random() * 2147483647);
        uid = `rra.${rand}.${Date.now()}`;
        setSession('rra', uid);
    } else {
        uid = rra;
    };
    device = deviceDetector.device;
    request('GET', 'http://ip-api.com/json')
        .then((res) => {
            geo_location = res.country;
        })
        .finally(() => {
            request('GET', `${CONFIG_API}/${userID}`)
                .then((result) => {
                    if (!result) {
                        console.log('No configurations');
                    } else {
                        const tempDataLayer = window.delvifyDataLayer.slice(0, window.delvifyDataLayer.length);
                        console.log('tempDataLayer', tempDataLayer);
                        tempDataLayer.forEach((data, index) => {
                            const temp = data;
                            window.delvifyDataLayer.splice(index, 1);
                            push(temp);
                        });
                        window.delvifyDataLayer['push'] = push;
                        config = {...config, ...result};
                        widgets = config.widgets;
                        console.log('currentProduct', currentProduct);
                        widgets.forEach( function (widget) {
                            if (currentProduct || widget.type !== 'SIMILAR') {
                                initWidget(widget);
                            }
                        })
                        initSmartVision();
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
    "    min-width: 200px;" +
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
    ".real-recommendation .real-recommendation-text5 {" +
    "font-size: 30px;" +
    "color: #222222;" +
    "line-height: 1.2;" +
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
    ".real-recommendation .p-l-50 {padding-left: 50px;}" +
    "" +
    ".real-recommendation .p-r-15 {padding-right: 15px;}" +
    ".real-recommendation .p-r-50 {padding-right: 50px;}" +
    ".real-recommendation .real-recommendation-text16 {" +
    "text-align: left;" +
    "font-family: Montserrat-Regular;" +
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
    ".real-recommendation .real-recommendation-text8, .real-recommendation-text8 a {" +
    "text-align: left;" +
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
    ".real-recommendation .text-left {" +
    "text-align: left;" +
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
    ".delvify-icon-close { " +
    "   width: 20px;" +
    "   height: 20px;" +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 40.8 40.8' style='enable-background:new 0 0 40.8 40.8;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23707070;%7D%0A%3C/style%3E%3Cg id='Group_4' transform='translate(-738.086 -937.086)'%3E%3Cpath class='st0' d='M777.5,977.5c-0.3,0-0.5-0.1-0.7-0.3l-38-38c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l38,38c0.4,0.4,0.4,1,0,1.4 C778,977.4,777.8,977.5,777.5,977.5z'/%3E%3Cpath class='st0' d='M739.5,977.5c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l38-38c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-38,38 C740,977.4,739.8,977.5,739.5,977.5z'/%3E%3C/g%3E%3C/svg%3E%0A\");" +
    " }" +
    ".delvify-icon-close-sm {" +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   width: 18px;" +
    "   height: 18px;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16.7988 14.6117L11.1871 9.00002L16.7988 3.3883C17.4047 2.78244 17.4047 1.80705 16.7988 1.20119C16.193 0.595331 15.2176 0.595331 14.6117 1.20119L8.99999 6.81291L3.38827 1.20119C2.78241 0.595331 1.80702 0.595331 1.20116 1.20119C0.5953 1.80705 0.5953 2.78244 1.20116 3.3883L6.81288 9.00002L1.20116 14.6117C0.5953 15.2176 0.5953 16.193 1.20116 16.7988C1.80702 17.4047 2.78241 17.4047 3.38827 16.7988L8.99999 11.1871L14.6117 16.7988C15.2176 17.4047 16.193 17.4047 16.7988 16.7988C17.4004 16.193 17.4004 15.2133 16.7988 14.6117Z' fill='%237E7E7E'/%3E%3C/svg%3E%0A\");" +
    "}" +
    ".delvify-icon-cv { " +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 37.9 37.9' style='enable-background:new 0 0 37.9 37.9;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23707070;%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M18.9,27.8c-4.9,0-8.9-4-8.9-8.9c0-4.9,4-8.9,8.9-8.9c4.9,0,8.9,4,8.9,8.9C27.8,23.8,23.8,27.8,18.9,27.8z M18.9,12.1c-3.8,0-6.9,3.1-6.9,6.9s3.1,6.9,6.9,6.9s6.9-3.1,6.9-6.9S22.7,12.1,18.9,12.1z'/%3E%3Cg%3E%3Cpath class='st0' d='M0.8,12.6c0.4,0,0.8-0.4,0.8-0.8V3.9c0-1.3,1.1-2.4,2.4-2.4h7.9c0.4,0,0.8-0.4,0.8-0.8S12.3,0,11.8,0H3.9 C1.8,0,0,1.8,0,3.9v7.9C0,12.3,0.4,12.6,0.8,12.6z'/%3E%3Cpath class='st0' d='M33.9,0H26c-0.4,0-0.8,0.4-0.8,0.8s0.4,0.8,0.8,0.8h7.9c1.3,0,2.4,1.1,2.4,2.4v7.9c0,0.4,0.4,0.8,0.8,0.8 c0.4,0,0.8-0.4,0.8-0.8V3.9C37.9,1.8,36.1,0,33.9,0z'/%3E%3Cpath class='st0' d='M11.8,36.3H3.9c-1.3,0-2.4-1.1-2.4-2.4V26c0-0.4-0.4-0.8-0.8-0.8S0,25.6,0,26v7.9c0,2.2,1.8,3.9,3.9,3.9h7.9 c0.4,0,0.8-0.4,0.8-0.8C12.6,36.7,12.3,36.3,11.8,36.3z'/%3E%3Cpath class='st0' d='M37.1,25.3c-0.4,0-0.8,0.4-0.8,0.8v7.9c0,1.3-1.1,2.4-2.4,2.4H26c-0.4,0-0.8,0.4-0.8,0.8 c0,0.4,0.4,0.8,0.8,0.8h7.9c2.2,0,3.9-1.8,3.9-3.9V26C37.9,25.6,37.5,25.3,37.1,25.3z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A\");" +
    " }" +
    ".delvify-icon-bars { " +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 40 38' style='enable-background:new 0 0 40 38;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23707070;%7D%0A%3C/style%3E%3Cg id='Group_6' transform='translate(-249.5 -964.5)'%3E%3Cpath class='st0' d='M288.5,966.5h-38c-0.6,0-1-0.4-1-1s0.4-1,1-1h38c0.6,0,1,0.4,1,1S289.1,966.5,288.5,966.5z'/%3E%3Cpath class='st0' d='M288.5,984.5h-38c-0.6,0-1-0.4-1-1s0.4-1,1-1h38c0.6,0,1,0.4,1,1S289.1,984.5,288.5,984.5z'/%3E%3Cpath class='st0' d='M288.5,1002.5h-38c-0.6,0-1-0.4-1-1s0.4-1,1-1h38c0.6,0,1,0.4,1,1S289.1,1002.5,288.5,1002.5z'/%3E%3C/g%3E%3C/svg%3E\");" +
    "}" +
    ".delvify-icon-left-arrow { " +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   width: 25px;" +
    "   height: 50px;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='angle-left' class='svg-inline--fa fa-angle-left fa-w-8' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 512'%3E%3Cpath fill='%23888888' d='M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z'%3E%3C/path%3E%3C/svg%3E\");" +
    "}" +
    ".delvify-icon-right-arrow { " +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   width: 25px;" +
    "   height: 50px;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='angle-right' class='svg-inline--fa fa-angle-right fa-w-8' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 512'%3E%3Cpath fill='%23888888' d='M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z'%3E%3C/path%3E%3C/svg%3E\");" +
    "}" +
    ".delvify-icon-camera { " +
    "   background-repeat: no-repeat;" +
    "   background-size: contain;" +
    "   width: 21.44px;" +
    "   height: 20px;" +
    "   background-image: url(\"data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='camera' class='svg-inline--fa fa-camera fa-w-16' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23000000' d='M512 144v288c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48h88l12.3-32.9c7-18.7 24.9-31.1 44.9-31.1h125.5c20 0 37.9 12.4 44.9 31.1L376 96h88c26.5 0 48 21.5 48 48zM376 288c0-66.2-53.8-120-120-120s-120 53.8-120 120 53.8 120 120 120 120-53.8 120-120zm-32 0c0 48.5-39.5 88-88 88s-88-39.5-88-88 39.5-88 88-88 88 39.5 88 88z'%3E%3C/path%3E%3C/svg%3E\");" +
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
    "    min-width: 100px;" +
    "    margin: 10px;" +
    // "    height: 100%;" +
    "    min-height: 200px;" +
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
    ".delvify-smart-vision {" +
    "   position: fixed;" +
    "   width: 100vw;" +
    "   height: 100vh;" +
    "   top: 0;" +
    "   z-index: 10000;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-backdrop {" +
    "   cursor: pointer;" +
    "   background-color: #efefef;" +
    "   width: 100%;" +
    "   height: 100%;" +
    "   position: absolute;" +
    "   opacity: 0.9;" +
    "   transition: opacity 1s;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-backdrop.d-hidden-backdrop{" +
    "   opacity: 0;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel {" +
    "   position: relative;" +
    "   width: 94%;" +
    "   height: 88vh;" +
    "   background-color: #fff;" +
    "   margin: 1.6vh auto auto auto;" +
    "   max-width: 1440px;" +
    "   display: flex;" +
    "   flex-direction: row;" +
    "   opacity: 1;" +
    "   top: 0px;" +
    "   transition: top 0.5s, opacity 0.2s;" +
    "}" +
    "@media (max-width: 500px) {" +
    "  .delvify-smart-vision .delvify-smart-vision-panel {" +
    "    display: block;" +
    "    overflow-y: scroll;" +
    "  }" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel.d-hidden-panel{" +
    "   opacity: 0;" +
    "   top: -500px;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-upload {" +
    "   flex: 0 1 36%;" +
    "   display: flex;" +
    "   flex-direction: column;" +
    "   padding: 5vh 4.8% 5vh 4.8%;" +
    "   align-items: center;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-uploaded-image {" +
    "   width: 100%;" +
    "   max-height: 27%;" +
    "   object-fit: contain;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-divider {" +
    "   width: 3px;" +
    "   background-color: #e7e7e7;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-upload-button {" +
    "   display: flex;" +
    "   flex-direction: row;" +
    "   align-items: center;" +
    "   padding: 5px;" +
    "   margin-top: 4.3vh;" +
    "   cursor: pointer;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-result {" +
    "   overflow-y:  scroll;" +
    "   padding: 5vh calc(4.8% - 7%) 5vh 4.8%;" +
    "   flex: 1" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-result-container{" +
    "   display: flex;" +
    "   flex-direction: row;" +
    "   flex-wrap: wrap" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-result-block{" +
    "   width: 142px;" +
    "   margin-bottom: 7vh;" +
    "   margin-right: 7%;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-result-block img{" +
    "   width: 100%;" +
    "   object-fit: cover;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-result-block .delvify-smart-vision-panel-result-description{" +
    "   font-family: Montserrat-Regular, sans-serif;" +
    "   font-size: 11.7px;" +
    "   margin-top: 23px;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-result-block .delvify-smart-vision-panel-result-price{" +
    "    margin-top: 7.6px" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-upload-button .delvify-smart-vision-panel-h2{" +
    "   margin-left: 14px;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-h1 {" +
    "   font-family: Keep Calm;" +
    "   font-weight: 500;" +
    "   font-size: 30px;" +
    "   line-height: 36px;" +
    "   margin-bottom: 7.5vh;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-h2 {" +
    "   font-family: Keep Calm;" +
    "   font-weight: 500;" +
    "   font-size: 14px;" +
    "   line-height: 17px;" +
    "}" +
    ".delvify-smart-vision .delvify-smart-vision-panel-h3 {" +
    "   font-family: Keep Calm;" +
    "   font-weight: bold;" +
    "   font-size: 11.7px;" +
    "   line-height: 14px;" +
    "}" +
    ".delvify-smart-vision .delvify-icon-close-sm {" +
    "   position: fixed;" +
    "   top: 1.5vh;" +
    "   margin: 14px;" +
    "   padding: 5px;" +
    "   cursor: pointer;" +
    "   background-size: auto;" +
    "   background-repeat: no-repeat;" +
    "   -ms-background-position-x: center;" +
    "   background-position-x: center;" +
    "   -ms-background-position-y: center;" +
    "   background-position-y: center;" +
    "   width: 28px;" +
    "   height: 28px;" +
    "}" +
    ".delvify-smart-vision-panel-result::-webkit-scrollbar {\n" +
    "  width: 5px;" +
    "}" +
    ".delvify-smart-vision-panel-result::-webkit-scrollbar-thumb {\n" +
    "  background-color: #c4c4c4;" +
    "  border-radius: 6px" +
    "}" +
    ".delvify-smart-vision-panel-result::-webkit-scrollbar-thumb:hover {" +
    "  background-color: #888888;" +
    "}" +
    "@keyframes imageLoading {\n" +
    "  0%   { opacity:1; }\n" +
    "  80%  { opacity:0.2; }\n" +
    "  100% { opacity:1; }\n" +
    "}\n" +
    "@-o-keyframes imageLoading{\n" +
    "  0%   { opacity:1; }\n" +
    "  80%  { opacity:0.2; }\n" +
    "  100% { opacity:1; }\n" +
    "}\n" +
    "@-moz-keyframes imageLoading{\n" +
    "  0%   { opacity:1; }\n" +
    "  80%  { opacity:0.2; }\n" +
    "  100% { opacity:1; }\n" +
    "}\n" +
    "@-webkit-keyframes imageLoading{\n" +
    "  0%   { opacity:1; }\n" +
    "  80%  { opacity:0.2; }\n" +
    "  100% { opacity:1; }\n" +
    "}\n" +
    ".image-loading {\n" +
    "   -webkit-animation: imageLoading 1s infinite;\n" +
    "   -moz-animation: imageLoading 1s infinite;\n" +
    "   -o-animation: imageLoading 1s infinite;\n" +
    "    animation: imageLoading 1s infinite;\n" +
    "}" +
    "@-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }" +
    "@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }" +
    "@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }" +
    "</style>";