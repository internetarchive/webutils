const input = document.getElementById("file");
const txtlink = document.getElementById("txtlink");
const status = document.getElementById("status");
const output = document.getElementById("output");
const wbmurl = document.getElementById("wbmurl");
const linksFromPDF = async (data) => {
    let links = new Set();
    const pdf = await pdfjsLib.getDocument(data).promise;
    // parse through the pdf
};
const fileSelectHandler = async (e) => {
    const f = e.target.files[0];
    console.log(f);
    if (f.type != "application/pdf") {
        output.innerText = "Please select a PDF file!";
        console.log("im breaking");
        return;
    }
    output.innerText = "Processing PDF...";
    /* 
    Steps to read through the contents of the file that has been uploaded 
    1. Create a new file reader instance
    2. Use the reader to read the file
    2. Execute code on read.load ie this code is executed once the reader.result is available
    3. Access the resulting bytes from reader.result and then  process further
    */
    const reader = new FileReader();
    reader.readAsArrayBuffer(f);
    reader.onload = async () => {
        // const file = new Uint8Array(reader.result);
        console.log(reader.result);
        let links = await linksFromPDF(new Uint8Array(reader.result));
    };
};
input.addEventListener("change", fileSelectHandler, false);
