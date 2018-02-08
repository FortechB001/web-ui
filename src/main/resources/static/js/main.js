let products = [];
let productId;
let howManySelected;


window.onload = function () {

    //alert("hello");
    getProducts();
};

function getProducts() {

    //products-service
    $.ajax({
        url: "http://localhost:8083/product/all",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            products = data;
            populateProductsList();
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot read products");
        }
    });
}

function populateProductsList() {

    let prod = document.getElementById('products');
    let list = [];

    for (let i = 0; i < products.length; i++) {
        list[i] =
            $('<a>', {
                class: 'list-group-item',
                text: products[i].name,
                onclick: "selectProduct('" + products[i].id + "')",
            })
    }
    $(document.getElementById('products')).append(list);
}

function selectProduct(prId) {

    productId = prId;

    //stock-service
    $.ajax({
        url: "http://localhost:8084/stock/find?productId=" + productId,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            showStockResults(data);
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot read stock info");
        }
    });
}

function showStockResults(stock) {

    document.getElementById('productsInStock').innerHTML = stock.stockTotal;
    document.getElementById('howMany').innerHTML = "";
    if (stock.stockTotal !== 0) {
        document.getElementById("howManyContinueButton").className = "btn btn-primary enabled";
        createDropDownList(stock.stockTotal);
    } else {
        document.getElementById("howManyContinueButton").className = "btn btn-primary disabled";
    }
    showStockCard();
}

function createDropDownList(howMany) {

    let list = [];
    for (let i = 0; i < howMany; i++) {
        list[i] =
            $('<option>', {
                text: (i + 1)
            })
    }
    $(document.getElementById('howMany')).append(list);
}

document.getElementById('howManyContinueButton').onclick = function () {
    let selected = document.getElementById('howMany');
    let howMany = selected.selectedIndex + 1;

    getDeliveryTimeToDeposit(howMany);

    console.log("howMany: " + howMany);
};

function getDeliveryTimeToDeposit(howMany) {

    //stock-service
    $.ajax({
        url: "http://localhost:8084/stock/when?productId=" + productId + "&howMany=" + howMany,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            showDeliveryEstimation(data);
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot read stock delivery estimation");
        }
    });
}

function showDeliveryEstimation(daysToArriveInDeposit) {
    console.log("daysToArriveInDeposit: " + daysToArriveInDeposit);
}

function showStockCard() {
    $('#detailsCard').show();
}

function hideStockCard() {
    $('#detailsCard').hide();
}
