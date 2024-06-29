const express = require('express');
const path = require('path');
const hbs = require('hbs')
const axios = require('axios')
const bodyParser = require('body-parser');
const pdfMaker = require("./controller/pdf");
const { stringify } = require('querystring');

// app and ports
const app = express();
const PORT = process.env.PORT || 3001;

// middile wares
app.use('/images', express.static('images'));
app.use('/pdfs', express.static('pdf'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/add', (req, res) => {
    res.render('add')
})

app.get('/user', (req, res) => {
    const mobile = req.query.mobile
        // api to check if user with this mobile exist
    const url = 'http://localhost/kuldeep/findUser.php';
    let reqData = JSON.stringify({
        mobile: mobile
    })
    axios.post(url, reqData)
        .then(function(response) {
            // data will return cid
            let data = response.data;
            console.log(data.msg)
            if (parseInt(data.msg) == 1) {
                let cid = data.data[0].cid;
                console.log("tets")
                res.redirect("addItems?cid=" + cid);
            } else {
                console.log("tets")
                res.render('addUser', { res: "", mobile: mobile })
            }

        })
        .catch(function(error) {
            console.log(error);
            res.render('error', {
                err: error,
            });
        });

    // else
})

app.get('/adduser', (req, res) => {
    const name = req.query.name;
    const mobile = req.query.mobile;
    // data storing api

    const url = 'http://localhost/kuldeep/addUser.php';
    let reqData = JSON.stringify({
        name: name,
        mobile: mobile
    })
    axios.post(url, reqData)
        .then(function(response) {
            // insert
            console.log("adduser res")
            let data = response.data;
            if (data.msg == 1) {
                console.log("msg = 1");
                var cid = data.data;
                console.log(cid);
                res.redirect('/addItems?cid=' + cid);
            } else {
                console.log("msg = 0")
                res.render('addUser', { res: "true", mobile: mobile })
            }
        })
        .catch(function(error) {
            console.log(error);
            res.render('error', {
                err: error,
            });
        });


})

app.get('/addItems', (req, res) => {
    const data = {
        cid: req.query.cid
    }
    res.render('addItems', { data })
})

app.get('/sales', (req, res) => {
    res.render("sales")
})
app.get("/in", (req, res) => {
    var reqData = { invoice: req.query.invoice };
    console.log(JSON.stringify(reqData))
    const url = 'http://localhost/kuldeep/getInvoice.php';

    axios.post(url, reqData)
        .then(function(response) {
            let data = response.data;

            var json = JSON.parse(data.data);
            json.date = new Date(parseInt(json.date)).toLocaleDateString();
            json.seller = 0;
            json.customer = 1;
            console.log(json)
            res.render("bill", json)
        })
        .catch(function(error) {
            res.render('error', { status: "fail", msg: "sorry" })
        });
})
app.get('/invoice', pdfMaker.makePDF)
app.get('/download', (req, res) => {
        var file = "/pdf/" + req.query.fileName;
        res.download(path.join(__dirname, file), (err) => { console.log("err", err) })
    })
    // post requests

app.post("/getProduct", (req, res) => {

    console.log("working", req.body.pid);
    var reqData = { pid: req.body.pid };
    console.log(JSON.stringify(reqData))
    const url = 'http://localhost/kuldeep/productDetail.php';

    axios.post(url, reqData)
        .then(function(response) {
            let data = response.data;
            console.log(JSON.stringify(data.data[0]))
            res.send(JSON.stringify(data.data[0]))
        })
        .catch(function(error) {
            res.send({ "status": "fail", "msg": "sorry" })
        });
})

app.post('/bill', pdfMaker.makePDF)

app.post("/createInvoice", (req, res) => {
    const resData = {};
    const url = 'http://localhost/kuldeep/invoice.php';
    let reqData = req.body;
    reqData.timeStamp = new Date().getTime()
    axios.post(url, reqData)
        .then(function(response) {
            // data will return cid
            let data = response.data;
            console.log(data)
            if (data.data) {
                resData.status = 200;
                resData.invoice = data.data;
                resData.msg = false;
                res.end(JSON.stringify(resData))
            } else {
                reqData.status = 400;
                resData.invoice = false;
                resData.msg = "error failed to create invoice";
                res.end(JSON.stringify(resData))
            }
        })
        .catch(function(error) {
            console.log(error);
            reqData.status = 400;
            resData.invoice = false;
            resData.msg = error;
            res.end(JSON.stringify(resData))
        });
})


// running on port 
app.listen(PORT, () => { //running surver
    console.log(`runing on ${PORT}`);
});