let products = [];
let stock = [];
let suppliers = [];

$(document).ready(function () {
    getProducts();
});

function getProducts() {

    //products-service
    $.ajax({
        url: "http://localhost:8081/api/product-service/product/all",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            products = data;
            getStock();
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot read products");
        }
    });
}

function getStock() {

    //stock-service
    $.ajax({
        url: "http://localhost:8081/api/stock-service/stock/all",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            stock = data;
            getAllSuppliers();
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot read stock");
        }
    });
}

function populateTable() {
    let tableRows = [];
    //delete all created <td>
    $("#productsRows > tbody").empty();

    for (let i = 0; i < products.length; i++) {

        let productName = '<td><input type="text" id="' + products[i].id + 'name' + '" class="form-control" value="' + products[i].name + '"></td>';
        let editButton = '<td><button type="button" class="btn btn-warning btn-md" onclick="editProductName(\'' + products[i].id + '\')">edit name</button></td>';
        let deleteButton = '<td><button type="button" id="' + products[i].id + 'delete' + '" class="btn btn-danger btn-md" onclick="deleteProduct(\'' + products[i].id + '\')">delete</button></td>';
        let stockSelect =
            '<td><div class="form-group">' +
            '<div class="col-xs-4"><select class="form-control" id="' + products[i].id + 'select' + '" onchange="onChangeLocation(\'' + products[i].id + '\', this.value)"></div>' +
            '</div></td>';
        let stockLocation = populateLocationsDropDown(products[i].id);
        let quantity =
            '<td><div class="col-xs-4">' +
            '<input id="' + products[i].id + 'input' + '" class="form-control" type="number" min="0" max="100"/>' +
            '</div></td>';
        let totalQuantity = getTotalQuantity(products[i].id);
        let saveButton = '<td><button type="button" id="' + products[i].id + 'save' + '" class="btn btn-success btn-md" onclick="saveNewStock(\'' + products[i].id + '\')">save</button></td>';

        tableRows[i] =
            $('<tr>', {
                id: 'row' + i
            }).append(productName)
                .append(editButton)
                .append(deleteButton)
                .append(stockSelect)
                .append(quantity)
                .append(totalQuantity)
                .append(saveButton);
        $(document.getElementById('productsRows')).append(tableRows[i]);
        $(document.getElementById(products[i].id + "select")).append(stockLocation);
        document.getElementById(products[i].id + "input").value = getStockForSupplier(products[i].id, document.getElementById(products[i].id + "select").value);
    }

}

function populateLocationsDropDown(productId) {

    let suppliersName = [];
    for (let i = 0; i < suppliers.length; i++) {
        suppliersName[i] =
            $('<option>', {text: suppliers[i]});
    }
    return suppliersName;
}

function getTotalQuantity(productId) {

    let matchingStock = stock.map((e) => e.productId === productId ? e : '').filter(String);
    let total = 0;

    for (let i in matchingStock) {
        total += matchingStock[i].quantity;
    }

    return '<td><h5 class="">' + total + '</h5></td>';
}

function onChangeLocation(productId, selectedValue) {
    document.getElementById(productId + "input").value = getStockForSupplier(productId, selectedValue);
}

function getStockForSupplier(productId, selectedValue) {

    let productStock = stock.map((e) => e.productId === productId ? e : '').filter(String);
    let quantity = productStock.map((e) => e.location === selectedValue ? e.quantity : '').filter(Number);
    return quantity.length !== 0 ? quantity : 0;
}

function saveNewStock(productId) {

    let selectedSupplier = document.getElementById(productId + "select").value;
    let newQuantity = document.getElementById(productId + "input").value;

    let url = "http://localhost:8081/api/stock-service/stock/add?productId=" + productId +
        "&location=" + selectedSupplier + "&quantity=" + newQuantity;

    //stock-service
    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            getProducts();
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot update stock");
        }
    });
}

function getAllSuppliers() {
    //stock-service
    $.ajax({
        url: "http://localhost:8081/api/stock-service/stock/suppliers",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            suppliers = data;
            populateTable();
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot read suppliers");
        }
    });
}

function editProductName(productId) {

    let newProductName = document.getElementById(productId + "name").value;
    let url = "http://localhost:8081/api/product-service/product/productName/update?productId=" +
        productId + "&newProductName=" + newProductName;

    //products-service
    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            getProducts();
        },
        error: function (jqXHR, status) {
            console.log("Cannot update product name");
            if (jqXHR.status === 406) {
                document.getElementById('errorModalMessage').innerHTML = jqXHR.responseJSON.message;
                $('#errorModal').modal('show');
            }
        }
    });
}

function openModal() {
    $('#newProductModal').modal('show');
}
//Add new product
document.getElementById('addNewProduct').onclick = function () {
    let productName = document.getElementById('product-name').value;
    let productDescription = document.getElementById('product-description').value;

    //products-service
    $.ajax({
        url: "http://localhost:8081/api/product-service/product/add?name=" + productName + "&description=" + productDescription,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            getProducts();
        },
        error: function (jqXHR, status) {
            if (jqXHR.status === 406) {
                document.getElementById('errorModalMessage').innerHTML = jqXHR.responseJSON.message;
                $('#errorModal').modal('show');
            }
        },
        complete : function () {
            $('#newProductModal').modal('hide');
        }
    });
};

function deleteProduct(productId) {

    //products-service
    $.ajax({
        url: "http://localhost:8081/api/product-service/product/delete?productId=" + productId,
        type: "DELETE",
        contentType: "application/json; charset=utf-8",
        success: function (data, textStatus, jqXHR) {
            console.log("Deleted");
            getProducts();
        },
        error: function (data, textStatus, jqXHR) {
            console.log("Cannot delete product with Id: " + productId);
        }
    });
}