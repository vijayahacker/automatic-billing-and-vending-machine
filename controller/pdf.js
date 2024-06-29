//Required package
var pdf = require("pdf-node");
var fs = require("fs");
const path = require('path');
const axios = require('axios')

const newPath = __dirname.replace("\\controller", "")
    // Read HTML Template
var html = fs.readFileSync(path.join(newPath, 'views/bill.hbs'), "utf8");


const makePDF = (req, res) => {
    // data to be filled in pdf 
    var reqData = { invoice: req.query.invoice };
    console.log(JSON.stringify(reqData))
    const url = 'http://localhost/kuldeep/getInvoice.php';

    axios.post(url, reqData)
        .then(function(response) {
            let data = response.data;

            var json = JSON.parse(data.data);
            json.date = new Date(parseInt(json.date)).toLocaleDateString();
            json.seller = 0;
            json.customer = 0;
            console.log(json)
            createPDF(json);
            json.seller = 0;
            json.customer = 1;
            json.url = newPath
            res.render('bill', json)
        })
        .catch(function(error) {
            res.render('error', { status: "fail", msg: "sorry" })
        });
    console.log(req)

}

function createPDF(pdfData) {
    // naming the pdf 
    var pdfName = pdfData.invoice + "_" + pdfData.name + "_pdf";

    // formating pdf
    var options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
        header: {
            height: "45mm",
            contents: '<div style="text-align: center;">Author: Shyam Hajare</div>'
        },
        footer: {
            height: "28mm",
            contents: {
                first: 'Cover page',
                2: 'Second page', // Any page number is working. 1-based index
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                last: 'Last Page'
            }
        }
    };

    // documenting
    var document = {
        html: html,
        data: pdfData,
        path: newPath + "/pdf/" + pdfName + ".pdf",
        type: "pdf",
    };

    // pdf making process 
    pdf(document, options)
        .then((response) => {
            console.log(response);
            return true
        })
        .catch((error) => {
            console.error(error);
            return error;

        });
}
module.exports = { makePDF, createPDF }