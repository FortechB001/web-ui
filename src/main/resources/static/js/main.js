let products = [];
let product;


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

function selectProduct(productId) {

    //stock-service
    $.ajax({
        url: "http://localhost:8084/stock/find?productId=" + productId,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            console.log("stock info: " + data.stockInfo);
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot read stock info");
        }
    });
}