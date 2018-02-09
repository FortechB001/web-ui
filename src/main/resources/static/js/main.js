let products = [];
let productId;
let howManySelected;
let selectedProduct = "";
let daysToArriveInDeposit = -1;
let order;


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
                href: '#',
                id: products[i].id,
                class: 'list-group-item',
                text: products[i].name,
                onclick: "selectProduct('" + products[i].id + "')",
            })
    }
    $(document.getElementById('products')).append(list);
}

function selectProduct(prId) {

    if (selectedProduct !== "") {
        document.getElementById(selectedProduct).className = "list-group-item";
    }
    selectedProduct = prId;
    document.getElementById(prId).className = "list-group-item active";
    hideDeliveryEstimationCard();
    hideConfirmDeliveryCard();
    hideOrderCard();
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
        createHowManyDropDownList(stock.stockTotal);
    } else {
        document.getElementById("howManyContinueButton").className = "btn btn-primary disabled";
    }
    showStockCard();
}

function createHowManyDropDownList(howMany) {

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
    howManySelected = howMany;

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
            daysToArriveInDeposit = data;
            showDeliveryEstimation(data);
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot read stock delivery estimation");
        }
    });
}

function showDeliveryEstimation(daysToArriveInDeposit) {

    document.getElementById("countryContinueButton").className = "btn btn-primary disabled";
    showDeliveryEstimationResult(daysToArriveInDeposit);
    populateDeliveryCountryList();
    showDeliveryEstimationCard();
}

function showDeliveryEstimationResult(daysToArriveInDeposit) {
    document.getElementById('daysInOurStock').innerHTML = daysToArriveInDeposit;
}

function populateDeliveryCountryList() {

    //estimation-service
    $.ajax({
        url: "http://localhost:8085/estimation/countries",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            createCountriesDropDownList(data);
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot read countries list");
        }
    });
}

function createCountriesDropDownList(countries) {

    if (countries.length === 0) {
        return;
    }
    document.getElementById("countryContinueButton").className = "btn btn-primary enabled";
    document.getElementById('yourCountry').innerHTML = "";
    let list = [];
    for (let i = 0; i < countries.length; i++) {
        list[i] =
            $('<option>', {
                text: countries[i]
            })
    }
    $(document.getElementById('yourCountry')).append(list);
}

document.getElementById('countryContinueButton').onclick = function () {
    let selected = document.getElementById('yourCountry');
    let country = selected.options[selected.selectedIndex].value;

    getConfirmDeliveryToUser(country);
    console.log("selected country: " + country);
};

function getConfirmDeliveryToUser(country) {
    //estimation-service
    let url = "http://localhost:8085/estimation/delivery?" +
        "id=" + productId + "&howMany=" + howManySelected + "&daysToArriveInDeposit=" +
        daysToArriveInDeposit + "&country=" + country;

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            order = data;
            showConfirmDelivery();
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot read delivery to user estimation");
        }
    });
}

document.getElementById('confirmDeliveryButton').onclick = function () {
    showOrderCard();
    showOrderDetails();
};

function showOrderDetails() {
    document.getElementById('orderProductName').innerHTML = order.productId;
    document.getElementById('orderQuantity').innerHTML = order.howMany;
    document.getElementById('orderDaysToArrive').innerHTML = order.daysToCustomer;
}

function showConfirmDelivery() {
    showConfirmDeliveryResult();
    showConfirmDeliveryCard();
}

function showConfirmDeliveryResult() {
    document.getElementById('daysToCustomer').innerHTML = order.daysToCustomer;
}

document.getElementById('orderProductButton').onclick = function () {

    let result;

    //order-service
    let url = "http://localhost:8086/order/make?" +
        "id=" + productId +
        "&howMany=" + howManySelected +
        "&daysToArriveInDeposit=" + daysToArriveInDeposit +
        "&country=" + order.country +
        "&daysToCustomer=" + order.daysToCustomer;

    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            console.log("ORDER SUCCESS: " + textStatus + " " + jqXHR);
        },
        error: function (xhr, status) {
            console.log("Cannot make the order");
        },
        complete: function (jqXHR, status) {
            showModal(jqXHR.responseText);
        }
    });
};

function showModal(result) {
    document.getElementById('orderMessage').innerHTML = result;
    $('#myModal').modal('show');

    hideDeliveryEstimationCard();
    hideConfirmDeliveryCard();
    hideOrderCard();
    hideStockCard();
    document.getElementById(selectedProduct).className = "list-group-item";
}


$('#howMany').change(function () {
    hideDeliveryEstimationCard();
    hideConfirmDeliveryCard();
    hideOrderCard();
});

$('#yourCountry').change(function () {
    hideConfirmDeliveryCard();
    hideOrderCard();
});

function showStockCard() {
    $('#detailsCard').show();
}

function hideStockCard() {
    $('#detailsCard').hide();
}

function showDeliveryEstimationCard() {
    $('#estimationCard').show();
}

function hideDeliveryEstimationCard() {
    $('#estimationCard').hide();
}

function showConfirmDeliveryCard() {
    $('#confirmDelivery').show();
}

function hideConfirmDeliveryCard() {
    $('#confirmDelivery').hide();
}

function showOrderCard() {
    $('#orderProduct').show();
}

function hideOrderCard() {
    $('#orderProduct').hide();
}