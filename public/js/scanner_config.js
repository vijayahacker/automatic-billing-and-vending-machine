const html5QrCode = new Html5Qrcode("reader");
const qrCodeSuccessCallback = (decodedText, decodedResult) => {
    /* handle success */
    console.log("success", decodedText, decodedResult);
    document.getElementById("resPID").innerHTML = decodedText;
    sotpCamera();
    findProduct();
};
const config = { fps: 10, qrbox: { width: 250, height: 250 } };

function sotpCamera() {
    html5QrCode.stop().then((ignore) => {
        console.log("camera stoped")
        return;
    }).catch((err) => {
        // Stop failed, handle it.
    });
}
// If you want to prefer back camera
function openScanner() {
    html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
}