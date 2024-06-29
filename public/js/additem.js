var count = 0;
let productArray = [];
let newArray = [];
const baseURL = "http://localhost:3001/";
const apiIRL = ""

// config for camera 

function my(i) {
    var state = parseInt(document.getElementById(i + "-num").innerText);
    if (state == 1) {
        document.getElementById(i + "-h").style.display = "none";
        document.getElementById(i + "-num").innerText = 0;
    } else {
        document.getElementById(i + "-h").style.display = "block";
        document.getElementById(i + "-num").innerText = 1;
    }
    console.log("state", state)

}

function add() {
    document.getElementById("main-body").style.zIndex = 1;
    document.getElementById("c-wrapper").style.zIndex = 2;
}

function onloadfn() {
    var text = document.getElementById("res").innerText;
    console.log(text)
    if (text == "true") {
        document.getElementById("notice").innerText = "This mobile number is in used by anther customer";
    } else {
        document.getElementById("notice").innerText = "";
    }
}

function preview(event) {
    console.log(event);
    let imgFile = event.target.files;
    if (imgFile.length > 0) {
        let imgPath = URL.createObjectURL(imgFile[0]);
        document.getElementById("preview-img").src = imgPath;
        document.getElementById("preview-text").innerText = "Re-take"
        console.log("img")
    }
}

function findProduct() {
    let id = new Date().getTime().toString();
    //next api gives info about the id like name, prise;
    let tempProduct = {}
    console.log(parseInt(document.getElementById('resPID').innerText))
    let pid = { pid: parseInt(document.getElementById('resPID').innerText) }
    let reqJSON = JSON.stringify(pid)
    var httpXML = new XMLHttpRequest();
    var url = "./getProduct";
    httpXML.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var dataArray = JSON.parse(this.responseText);
            tempProduct.id = id;
            tempProduct.pid = parseInt(dataArray.pid);
            tempProduct.name = dataArray.pname;
            tempProduct.price = parseInt(dataArray.ppu);
            tempProduct.amount = parseInt(dataArray.ppu);
            tempProduct.quantity = 1;

            console.log(tempProduct)
            productArray.push(tempProduct)
            console.log(productArray)

            // console.log(id);
            document.getElementById("main-body").style.zIndex = 2;
            document.getElementById("c-wrapper").style.zIndex = 1;
            addItem(productArray);
        }
    }
    httpXML.open("POST", url, true);
    httpXML.setRequestHeader("Content-type", "application/json; charset=UTF-8")
    httpXML.send(reqJSON);
}

function addItem(productArray) {
    let list = document.getElementById("list");
    list.innerHTML = "";
    productArray.map((data) => {
        let listItem = '<div class="w3-card c-gray w3-round-large" id="' + data.id + '" >' +
            '<p id="' + data.id + '-num" hidden>0</p><div class="c-row w3-padding" onclick="my(' + data.id + ')">' +
            '<p class="c-80">' + data.name + '</p><p class="c-20" id="' + data.id + '-quantity">' + data.quantity + '</p>' +
            '</div ><div id="' + data.id + '-h" class="h01"><div class="c-row w3-container"><p>prise:' + data.price + ' </p>' +
            '</div><div class="c-row w3-padding"><button class="w3-button w3-red w3-round" onclick="deleteElem(' + data.id + ')">Delete</button>' +
            '<div class="w3-container w3-right"><button class="w3-black w3-button w3-round" onclick="minus(' + data.id + ')">-</button>' +
            '<input id="' + data.id + '-qu" type="number" class="c-w-50 " value="' + data.quantity + '">' +
            '<button class="w3-black w3-button w3-round" onclick="plus(' + data.id + ')">+</button>' +
            '<button class="w3-black w3-button w3-round" onclick="update()">update</button>' +
            '</div></div></div></div >';
        list.innerHTML += listItem;
    });
}

function reset() {
    productArray = [];
    addItem(productArray);
    document.getElementById("list").innerHTML = '<div class="w3-card c-gray c-row w3-padding w3-round-large">' +
        '<p class="c-80">no product selected</p></div>';
}

function minus(id) {
    let val = document.getElementById(id + '-qu').value;
    let d = parseInt(val);
    let decval = d - 1;
    document.getElementById(id + '-qu').value = decval;
    newArray = productArray.map(product => {
        if (product.id == id) {
            return {...product, quantity: decval }
        }
        return product;
    })
}

function plus(id) {
    let val = document.getElementById(id + '-qu').value;
    let d = parseInt(val);
    let inValue = d + 1;
    document.getElementById(id + '-qu').value = inValue;
    newArray = productArray.map(product => {
        if (product.id == id) {
            return {...product, quantity: inValue }
        }
        return product;
    })
}

function update() {
    productArray = newArray;
    addItem(productArray);
}

function deleteElem(id) {
    let index = 0;
    productArray.map((elem) => {
        if (parseInt(elem.id) == id) {
            let array1 = productArray.slice(0, index);
            let array2 = productArray.slice(index + 1, productArray.length);
            productArray = array1.concat(array2);
            addItem(productArray);
        } else {
            index += 1;
        }
    })
}

function createBill() {
    console.log('object')
    let sum = 0;
    productArray.map((e) => {
        e.amount = e.price * e.quantity;
        sum += e.amount
        console.log(sum)
    })
    console.log("total amount ", sum);

    let jsonData = {
        cid: parseInt(document.getElementById('cid').innerText),
        gtotal: sum,
        products: productArray
    }

    // api to send json to node
    var httpXML = new XMLHttpRequest();
    var url = "./createInvoice";
    httpXML.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var dataArray = JSON.parse(this.responseText);
            console.log(dataArray)
            if (dataArray.status == 200) {
                window.location.href = baseURL + "invoice?invoice=" + dataArray.invoice;
            } else {
                window.location.href = baseURL + "error?er=" + dataArray.msg;
            }
        }
    }
    var testJOSN = JSON.stringify(jsonData)
    httpXML.open("POST", url, true);
    httpXML.setRequestHeader("Content-type", "application/json; charset=UTF-8")
    httpXML.send(testJOSN);
}