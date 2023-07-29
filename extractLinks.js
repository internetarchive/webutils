const input = document.getElementById("file");
const txtlink = document.getElementById("txtlink");
const status = document.getElementById("status");
const output = document.getElementById("output");
const wbmurl = document.getElementById("wbmurl");
input.addEventListener("change", fileSelectHandler, false);
pdfjsLib.GlobalWorkerOptions.workerSrc = "pdf.worker.js";
const linkRe = new RegExp("https?://[^\\s'\"><]+\\.[^\\s'\"><]+", "ig");
const linksFromPDF = async (data) => {
    let links = new Set();
    const pdf = await pdfjsLib.getDocument(data).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
        let page = await pdf.getPage(i);
        let ant = await page.getAnnotations();
        ant.map((a) => a.url)
            .filter((l) => l && l.startsWith("http"))
            .forEach((e) => links.add(e));
        if (txtlink.checked) {
            let txt = await page.getTextContent();
            for (const m of txt.items
                .map((token) => token.str)
                .join(" ")
                .matchAll(linkRe)) {
                links.add(m[0].replace(/[,;.)]+$/g, ""));
            }
        }
    }
    return [...links];
};
input.addEventListener("change", fileSelectHandler, false);
const fileSelectHandler = async (e) => {
    const f = e.target.files[0];
    if (f.type != "application/pdf") {
        output.innerText = "Please select a PDF file!";
        return;
    }
    output.innerText = "Processing PDF...";
    const reader = new FileReader();
    reader.onload = async () => {
        let links = await linksFromPDF(new Uint8Array(reader.result));
        let wbmlinks = links.filter((l) => l.includes("web.archive.org"));
        let otrlinks = links.filter((l) => !l.includes("web.archive.org"));
        status.innerText = `File Name: ${f.name}\nTotal Unique Links: ${links.length}\nWayback Machine Links: ${wbmlinks.length}\nNon-WBM Links: ${otrlinks.length}`;
        output.innerText = otrlinks.join("\n");
        wbmurl.innerText = wbmlinks.join("\n");
    };
    reader.readAsArrayBuffer(f);
};
