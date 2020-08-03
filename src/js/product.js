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
        "<img src=\""+ item.image_url +"\" alt=\"IMG-PRODUCT\">" +
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
        "<span class=\"block2-price s-text8 p-r-5\">" +
        `${item.sku}` +
        "</span>" +
        "<a href=\"product-details.html?sku=" + item.sku + "\" class=\"block2-name dis-block s-text3 p-b-5 product-item\" data-sku=\"" + item.sku + "\">" +
        item.name +
        "</a>" +
        "<span class=\"block2-price m-text6 p-r-5\">" +
        `$${item.price}` +
        "</span>" +
        "</div>" +
        "</div>" +
        "</div>"
    )
}

const flower = ["SKU689420", "SKU730566", "SKU701486", "SKU638107", "SKUC20109", "SKUC20110", "SKUB61700", "SKUB48263", "SKUC13831", "SKU953431", "SKUB55130", "SKU659999", "SKUA96068", "SKUB42186", "SKUB42025", "SKUC13831", "SKU961797", "SKU961797", "SKUB83024", "SKU974199", "SKUB47706", "SKUB78443", "SKUB76818", "SKUB63801", "SKU627824", "SKUB42713", "SKU652684", "SKU653147", "SKU660001", "SKU662851", "SKU665044", "SKU816569", "SKU816571", "SKU895177", "SKU908490", "SKU908507", "SKU920791", "SKU920797", "SKU927336", "SKU951171", "SKU951910", "SKUA52137", "SKUA08671", "SKUA55443", "SKUA73817", "SKUA73818", "SKU912435", "SKUA61154", "SKUA71633", "SKUA68219", "SKU917577", "SKU631015", "SKUA71632", "SKUB19144", "SKUB18971", "SKUA50859", "SKUA63364", "SKU997548", "SKU997549", "SKUA20868", "SKUA29719", "SKUA29725", "SKUA31292", "SKU965137", "SKU971117", "SKU971137", "SKU971161", "SKUA94311", "SKUA94326", "SKUA94343", "SKUA94344", "SKU913021", "SKU913031", "SKU913044", "SKU917513", "SKU917557", "SKU926412", "SKUB83344"];
const spring = ["SKUA87952", "SKUC33623", "SKU861014", "SKUA35196", "SKUB90043", "SKU958661"];
const colorful = ["SKU671850", "SKU654783", "SKU668945", "SKU904195", "SKUA57632", "SKU965138", "SKU965139", "SKUA96309", "SKUA96331", "SKUB82375", "SKU588034", "SKUA97158", "SKUA97159"];
const tshirt = ["SKUA91281","SKUA87213","SKUA87325","SKUA88280","SKUA88282","SKUA89626","SKUA89658","SKUA89883","SKUA82401","SKUA82402","SKUA82445","SKUA82476","SKUA83060","SKUA83215","SKUA83216","SKUA84244","SKUA79548","SKUA79658","SKUA79967","SKUA80432","SKUA80433","SKUA80434","SKUA80955","SKUA80966","SKUA81114","SKUA81214","SKUA81285","SKUA81287","SKUA81581","SKUA77617","SKUA78116","SKUA78117","SKUA78324","SKUA78325","SKUA78348","SKUA79246","SKUB35833","SKUB35835","SKUB35840","SKUB35841","SKUB36178","SKUB69345","SKUB69347","SKUB79655","SKUB79656","SKUB15545","SKUB17166","SKUB17178","SKUB23038","SKUB64858","SKUB65280","SKUB65281","SKUB66901","SKUB66902","SKUB66903","SKUB10648","SKUB12714","SKUB12836","SKUB12851","SKUB13662","SKUB13811","SKUB13826","SKUB13852","SKUB13928","SKUB13939","SKUB13956","SKUB14002","SKUB14011","SKUB14027","SKUB14032","SKUB14646","SKUB14708","SKUB14714","SKUB14812","SKUB02745","SKUB03031","SKUB05176","SKUB06336","SKUB08973","SKUB57936","SKUB57946","SKUB58687","SKUB58688","SKUB61249","SKUB61251","SKUA97687","SKUA97779","SKUB00141","SKUB57634","SKUB57646","SKUB57655","SKUB57660","SKUB57665","SKUB57911","SKUA90484","SKUA90496","SKUA91721","SKUA93013","SKUA93252","SKUB48694","SKUB51918","SKUB53024","SKUB54204","SKUA58277","SKUB47765","SKUB48660","SKUB48670","SKUB48690","SKUB48693","SKUB43824","SKUB43825","SKUB43903","SKUB43904","SKUB45576","SKUB45578","SKUB46237","SKUB46261","SKUB46699","SKUB46709","SKUB46737","SKUB47502","SKUB47513","SKUB42094","SKUB42096","SKUB42097","SKUB42115","SKUB42120","SKUB42128","SKUB42212","SKUB42300","SKUB42302","SKUB42520","SKUB42521","SKUB42775","SKUB40970","SKUB41035","SKUB41038","SKUB41039","SKUB41042","SKUB41043","SKUB41047","SKUB41048","SKUB41083","SKUB37716","SKUB37728","SKUB38137","SKUB40120","SKUB40121","SKUB36640","SKUB36650","SKUB36689","SKUB36706","SKUB36876","SKUB36879","SKUB36888","SKUB36891","SKUB36896","SKUB36902","SKUB36975","SKUB37144","SKUB82375","SKUB83344","SKUB08971","SKUB13760","SKUB14040","SKUB17027","SKUB42193","SKUB46301","SKUB46485","SKUB48192","SKUB54082","SKUB63720","SKUB80653","SKUB80654","SKUB80655","SKUB83002","SKUB84958","SKUB84959","SKUB84973","SKUB88148","SKUB88180","SKUB89068","SKUB89069","SKUB89070","SKUB89739","SKUB89751","SKUB89788","SKUB89789","SKUB89831","SKUB96379","SKUB96380","SKUB96381","SKUB96631","SKUB96632","SKUB96633","SKUB96637","SKUB98193","SKUA70018","SKUA53493","SKUA80152","SKUB46172","SKU840614","SKUB13506","SKUB42180","SKUB47746","SKUB49181","SKUB63726","SKUB46103","SKUA89362","SKUB37064","SKUB47725","SKUB48081","SKUB88788","SKUB97394","SKUB14736","SKUB63602","SKUB89740","SKUB95176","SKUB15801","SKUB16543","SKUC00065","SKUB02730","SKU895737","SKU904421","SKUC00051","SKUC00059","SKUC07238","SKUC07258","SKUB64413","SKUB64530","SKUB42279","SKUB47559","SKUB72846","SKUB70042","SKUA91319","SKUA82113","SKUC06515","SKUB51811","SKUB51812","SKUB13507","SKUB64405","SKUB37066","SKUB46616","SKU957001","SKUC00055","SKUC05687","SKUC07425","SKUC07491","SKUC07492","SKUC13142","SKUC13143","SKUC00044","SKU565126","SKUB78434","SKUB72754","SKUB13669","SKUB37069","SKU837414","SKU883217","SKUC06882","SKUB97395","SKUB97396","SKUB72592","SKUB48087","SKU883204","SKU843501","SKUC16471","SKUC16472","SKUC16875","SKUC20529","SKUC11685","SKUC13051","SKUC13144","SKUC13148","SKUC13149","SKUC15109","SKUC15116","SKUC15137","SKUC15141","SKUC06919","SKUB88605","SKU948556","SKU642758","SKUC20550","SKUC20002","SKUC11690","SKUC13052","SKUC20003","SKUB77981","SKUB07706","SKUB48088","SKUC19962","SKUC27814","SKUC14518","SKUC14529","SKUC16928","SKUB81852","SKUB82978","SKUB54049","SKUB54051","SKU886996","SKUC21137","SKUC21138","SKUC27455","SKUC27492","SKUC27857","SKUC27858","SKUC30821","SKUC19964","SKUC20539","SKU667086","SKUB97488","SKUB88897","SKU588034","SKU917582","SKUB64474","SKUB72662","SKUC13150","SKUC27608","SKUC16929","SKUC27797","SKUC27902","SKUC27903","SKUB72657","SKUC20548","SKUC16876","SKUC36482","SKUB63776","SKUC13065","SKUB81824","SKUB72791","SKUC40178","SKUC20140","SKUA87025","SKUC20087","SKU768640","SKU934829","SKUC09615","SKUC27912","SKUC30769","SKU856095","SKUA41029","SKUC09574","SKUC30840","SKUC30847","SKUB83451","SKUB88902","SKUC05580","SKUC10421","SKUC11055","SKUC17212","SKUB37655","SKUC39554","SKUC39948","SKUC45414","SKUC17523","SKUC61482"];
const buttons = ["SKU856653", "SKUA22180", "SKUA36619", "SKUA42665", "SKUA42666", "SKUA64496", "SKUA64497", "SKUA60759", "SKUA69687", "SKUA69688", "SKUA69689", "SKUA51957", "SKU974093", "SKUA97199", "SKUA97200", "SKUA81581"];
const nosleeves = ["SKU765187", "SKU765184", "SKU677169", "SKU840405", "SKU840406", "SKU840408", "SKUC16812", "SKU689286", "SKU391844", "SKU417476", "SKU436545", "SKU455617", "SKU576519", "SKU595168", "SKU627824", "SKU652684", "SKU657126", "SKU669509", "SKU677229", "SKU677838", "SKU901399", "SKU901894", "SKU902084", "SKUB77262", "SKUB58390", "SKUB61717", "SKUB53599", "SKU895919", "SKU895921", "SKUB43807", "SKUB47464", "SKUB42231", "SKUB36865", "SKUB58401", "SKUB89081", "SKUB58396", "SKUB58393", "SKUB46592", "SKUB47610", "SKUC13136", "SKU876830", "SKU961818", "SKUC02642", "SKUB72481", "SKUB64791", "SKU639340", "SKUC17425", "SKUC07416", "SKUB82941", "SKUB64264", "SKU816264", "SKUC17454", "SKUC17524", "SKUC21843", "SKUB82949", "SKUB82964", "SKUB76866", "SKUB77594", "SKU682259", "SKUB83214", "SKUC21286", "SKUC40246", "SKUB78250", "SKUB83305", "SKUB57896", "SKUB57897", "SKUB76868", "SKU689061", "SKUB70107", "SKUB82752", "SKUC09543", "SKUB72498", "SKUB69345", "SKUB69347", "SKUB51918", "SKUB54204", "SKUB77981", "SKU642758"];
const zips = ["SKU853410", "SKUA33400", "SKUA39265", "SKUA46233", "SKUA62285", "SKUA48553", "SKU991964", "SKUB66901", "SKUB66902", "SKUB66903", "SKUB64474"];
const long = ["SKU920791", "SKUB36075", "SKUB72460", "SKUB42173", "SKUB36442", "SKUB65105", "SKUB65106", "SKUB65107", "SKUB90023", "SKUB90034", "SKUB92225", "SKUC02371", "SKUB76918", "SKUB92214", "SKUB42159", "SKUB47872", "SKUB99443", "SKUB76989", "SKUB55194", "SKUC53026", "SKUB90418", "SKUC53068", "SKUC53372", "SKUC41156", "SKUC53391"];
const dress = ["SKU895177","SKU898702","SKU904195","SKU908490","SKU908507","SKU911031","SKU911566","SKU920791","SKU920797","SKU922310","SKU922865","SKU945583","SKU972845","SKU986590","SKU986592","SKU993117","SKUA04028","SKUA06929","SKUA09638","SKUA07941","SKUA16542","SKUA18489","SKUA26304","SKUA27540","SKUA28349","SKUA42410","SKUA58280","SKUA55486","SKUA55487","SKU873031","SKU908047","SKU846369","SKUA51627","SKUA50320","SKUA45372","SKUA49778","SKUA36057","SKUA36369","SKUA55388","SKUA70803","SKUA69398","SKUA69881","SKUA62868","SKUA34918","SKUA70626","SKUA69367","SKUA69368","SKUA69399","SKUA68213","SKUA74760","SKUA74768","SKUA74275","SKUA71633","SKUA70589","SKUA72703","SKUA72704","SKUA73785","SKUA74151","SKUA68219","SKUA72705","SKUA73783","SKUA73784","SKUA73775","SKUA75073","SKUA75074","SKUA75784","SKUA75983","SKUA70599","SKUA70913","SKUA70973","SKUA71632","SKUA68144","SKUA68242","SKUB04630","SKUB04631","SKUB04632","SKUB10504","SKUB10540","SKUB10541","SKUB10555","SKUA59134","SKUA94311","SKUA94326","SKUA94343","SKUA94344","SKUA94348","SKUA97280","SKUA97655","SKUA97751","SKUA90983","SKUA92679","SKUA92684","SKUA92719","SKUA92725","SKUA81929","SKUA81930","SKUA81938","SKUA81947","SKUA81952","SKUA81953","SKUA81955","SKUA81956","SKUA83434","SKUA83454","SKUA83470","SKUA85111","SKUA85117","SKUA85118","SKUA85131","SKUA85145","SKUA85146","SKUA85155","SKUA85167","SKUA76761","SKUA76824","SKUA78659","SKUA79046","SKUB25153","SKUB25154","SKUB25170","SKUB25174","SKUB25175","SKUB25178","SKUB25179","SKUB25183","SKUB25185","SKUB25186","SKUB29879","SKUB36075","SKUB36433","SKUB72460","SKUB72516","SKUB77067","SKUB77068","SKUB25055","SKUB25135","SKUB25136","SKUB25140","SKUB25142","SKUB25145","SKUB65112","SKUB13846","SKUB13996","SKUA94301","SKUA95173","SKUA95178","SKUA95183","SKUA95212","SKUA95217","SKUA95223","SKUB56901","SKUB56909","SKUB56911","SKUA91496","SKUA91507","SKUA91524","SKUA91536","SKUA91543","SKUA91547","SKUA91550","SKUA91589","SKUA91605","SKUA91611","SKUA91650","SKUA92722","SKUB52303","SKUB52304","SKUB54000","SKUA85116","SKUB42110","SKUB42150","SKUB42154","SKUB42156","SKUB42168","SKUB42173","SKUB42186","SKUB40388","SKUB40389","SKUB40416","SKUB40417","SKUB40419","SKUB40439","SKUB40440","SKUB40456","SKUB36434","SKUB36442","SKUB36447","SKUB36500","SKUB36514","SKUB36625","SKU897807","SKUB13838","SKUB25051","SKUB25180","SKUB40387","SKUB52311","SKUB56469","SKUB56497","SKUB57565","SKUB57566","SKUB57567","SKUB65081","SKUB65087","SKUB65088","SKUB65105","SKUB65106","SKUB65107","SKUB76921","SKUB76925","SKUB76926","SKUB76940","SKUB76945","SKUB76947","SKUB76951","SKUB76956","SKUB76958","SKUB76959","SKUB83540","SKUB83561","SKUB90023","SKUB90029","SKUB90034","SKUB90041","SKUB90043","SKUB91774","SKUB92083","SKUB92106","SKUB92172","SKUB92225","SKUB92254","SKUB92583","SKUB92594","SKUB92600","SKUB92605","SKUB92607","SKUC02371","SKUC02409","SKUC02414","SKUC02415","SKUC02446","SKUC02510","SKUC03970","SKUB76917","SKUB76918","SKUB91755","SKUB92214","SKUB42159","SKUB83494","SKUB83495","SKUB42105","SKUB47973","SKUB83536",];

const search = function(keyword, uploadedImage, enabledAI, param, searchBy) {
    return new Promise(function(resolve, reject) {
        if (searchBy === 'image') {
            fetch(uploadedImage.data)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], uploadedImage.name);

                    let formData = new FormData();
                    formData.append('image', file);

                    let req = new XMLHttpRequest();

                    req.onreadystatechange = function(e) {
                        if (req.readyState == 4 && req.status == 200) {
                            const result = JSON.parse(req.responseText);
                            const skus = result.skus;
                            console.log('Image search', skus);
                            api('GET', '/product', {skus: skus.join(',') || [], ...param}, function (response) {
                                resolve(response);
                            });
                        }
                    };

                    req.open("POST", `${process.env.API_HOST}/ai/search`);
                    req.send(formData);
                })
        } else if (!enabledAI) {
            api('GET', '/product/search', { keyword: keyword, ...param }, function (response) {
                console.log('Disabled AI', response.rows.map((item) => item.sku));
                resolve(response);
            })
        } else {
            api('GET', "/ai/search", { keyword: keyword }, function (result) {
                console.log('Enabled AI', result.skus);
                api('GET', '/product', {skus: result.skus.join(',') || [], ...param}, function (response) {
                    resolve(response);
                })
            });
        }
    })
};


$( document ).ready(function() {

    const limit = 15;
    const enabledAI = getQuery()['ai'] === 'true' || false;
    const page = getQuery()['p'] || 1;
    const categoryId = getQuery()['category'] || null;
    const keyword = getQuery()['keyword'] || null;
    const searchBy = getQuery()['searchBy'] || null;
    const uploadedImage = JSON.parse(sessionStorage.getItem('uploadedImage')) || null;
    const param = { limit, offset: (page - 1)* limit };
    const searchItems = {};
    if (categoryId) {
        param['categoryId'] = categoryId;
    }
    $('.product-item').on('click', () => {
        window.delvifyDataLayer.push({
            event: 'click',
            procudt: {
                sku: $(this).attr('data-sku')
            }
        })
    });

    if (keyword || (searchBy === 'image' && uploadedImage)) {
        if (searchBy === 'image' && uploadedImage) {
            $('#uploadButton').removeClass('d-flex').addClass('d-none');
            $('#recordButton').removeClass('d-flex').addClass('d-none');
            $('#searchButton').removeClass('d-flex').addClass('d-none');
            $('#uploadSpinner').removeClass('d-none').addClass('d-flex');
            $('#uploadedImageContainer').removeClass('d-none').addClass('d-flex');
            $('#searchProduct').removeClass('d-block').addClass('d-none');
            $('#uploadedImage').prop('src', uploadedImage.data);
            $('#uploadedImageName').html(`${uploadedImage.name} ‧ ${(uploadedImage.size/1024).toFixed(2)}KB`);
        } else {
            $('#searchProduct').val(keyword);
            $('#searchProductMobile').val(keyword);
        }
        search(keyword, uploadedImage, enabledAI, param, searchBy)
            .then((response) => {
                $('#uploadButton').removeClass('d-none').addClass('d-flex');
                $('#recordButton').removeClass('d-none').addClass('d-flex');
                $('#searchButton').removeClass('d-none').addClass('d-flex');
                $('#uploadSpinner').removeClass('d-flex').addClass('d-none');
                $('#searchProduct').removeClass('d-none').addClass('d-block');
                const products = response.rows;
                if (products.length <= 0) {
                    if (searchBy === 'image' ) {
                        $('#productList').append("<h3 class='w-100 text-center m-2'>No results for: '" + uploadedImage.name + "'</h3>");
                    } else {
                        $('#productList').append("<h3 class='w-100 text-center m-2'>No results for: '" + keyword + "'</h3>");
                    }
                    return;
                }
                const pages = Math.ceil(response.count / limit);
                for (let i = 0; i < products.length; i++) {
                    const item = products[i];
                    $('#productList').append(displayItem(item));
                }
                for (let i = 1; i <= pages; i++) {
                    const keywordQuery = keyword ? `keyword=${keyword}&` : "";
                    const imageQuery = searchBy === 'image' && uploadedImage ? `searchBy=image&` : "";
                    const aiQuery = keyword || (searchBy === 'image' && uploadedImage)? `ai=${enabledAI}&` : "";
                    const href = (page == i) ? "javascript:void(0);" : ("product.html?" + aiQuery + keywordQuery + imageQuery + "p=" + i);
                    $('#pagination').append(
                        "<a href=\"" + href + "\" class=\"item-pagination flex-c-m trans-0-4" + ((page == i) ? " active-pagination\"" : "\"") + ">" + i + "</a>"
                    )
                }
                addListener('wishlist');
                $('.block2-btn-addcart').on('click', function () {
                    const pid = $(this).data('pid');
                    const item = products.find((t) => t.sku == pid);
                    swal(item.name, "is added to cart !", "success");
                    addToCart(item.sku, 1);
                });
            });
        return false;
    } else {
        api('GET', "/product", param, (response) => {
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
