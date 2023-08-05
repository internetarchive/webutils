const input = document.getElementById("file");
const txtlink = document.getElementById("txtlink");
const stat = document.getElementById("status");
const output = document.getElementById("output");
const wbmurl = document.getElementById("wbmurl");
const linkRe = new RegExp("https?://[^\\s'\"><]+\\.[^\\s'\"><]+", "ig");

// Plan is to replace all line feeds with `
// write a regex that handles the appearnce of the above tag in a http string
// https://github.com/metachris/pdfx/blob/master/pdfx/extractor.py Using this file as a base ref

// right now the edge cases still to be solved are
// 1. the link is broken into multiple lines
// (easy fix -> // Find first ` and last `  then  remove any other ` in between these two array indexes)
const getLinksFromPdf = async (data) => {
    const pdf = await pdfjsLib.getDocument(data).promise;
    let links = [];
    for (let i = 1; i <= 5; i++) {
        let page = await pdf.getPage(i);
        let parseableText = await convertToParsableIR(page);
        links.push(getLinksFromParseableIR(parseableText));
    }
    return links;
};

const convertToParsableIR = async (page) => {
    const tokenizedText = await page.getTextContent();

    const pageText = tokenizedText.items
        .map((token) => {
            if (token.hasEOL) {
                // https://stackoverflow.com/questions/1547899/which-characters-make-a-url-invalid
                return "`"; // ` back ticks are not valid character in url strings
            } else {
                return token.str;
            }
        })
        .join("");
    return pageText;
};
const getLinksFromParseableIR = (textIR) => {
    let links = textIR
        .split(" ")
        .filter((l) => l && (l.match(new RegExp(".*`.*")) || l.match(linkRe)))
        .filter((l) => l && l.match(linkRe))
        .map((l) => {
            let count = (l.match(/`/g) || []).length;
            let firstIx = l.match("https?://[^\\s'\"><]+\\.[^\\s'\"><]+").index; //7
            let firstIxSpl = l.indexOf("`"); //6
            let lastIx = l.lastIndexOf("`");
            if (count >= 2) {
                if (lastIx != -1) {
                    l = l.substring(firstIx, lastIx);
                }
            }
            if (count == 1) {
                if (firstIx > firstIxSpl) {
                    l = l.substring(firstIx, l.length);
                } else {
                    l = l.substring(firstIx, firstIxSpl);
                }
            }
            l = l.replaceAll("`", "");
            return l;
        });
    return links;
};
const fileSelectHandler = async (e) => {
    const f = e.target.files[0];
    if (f.type != "application/pdf") {
        output.innerText = "Please select a PDF file!";

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

        let linksCategorizedBypage = await getLinksFromPdf(
            new Uint8Array(reader.result)
        );
        console.log(linksCategorizedBypage);
        // stat.innerText = `File Name: ${f.name}\nTotal Unique Links: ${links.length}\nWayback Machine Links: ${wbmlinks.length}\nNon-WBM Links: ${otrlinks.length}`;
        // let totalLinks = 0;
        // let wbmLinksCtr = 0;

        linksCategorizedBypage.forEach((links, index) => {
            // console.log(links);
            // totalLinks = totalLinks + links.length;
            let wbmlinks = links.filter((l) => l.includes("web.archive.org"));
            // wbmLinksCtr = wbmlinks.length + wbmLinksCtr;
            let otrlinks = links.filter((l) => !l.includes("web.archive.org"));

            output.innerText += otrlinks.join("\n");
            wbmurl.innerText += wbmlinks.join("\n");
            output.innerText += "\n";
        });
        stat.innerText = `File Name: ${f.name}\nTotal Unique Links: ${totalLinks}\nWayback Machine Links: ${wbmlinks.length}\nNon-WBM Links: ${otrlinks.length}`;
    };
};
input.addEventListener("change", fileSelectHandler, false);
