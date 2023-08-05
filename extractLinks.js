const input = document.getElementById("file");
const txtlink = document.getElementById("txtlink");
const status = document.getElementById("status");
const output = document.getElementById("output");
const wbmurl = document.getElementById("wbmurl");

const linkRe = new RegExp(
    "\b((?:https?:(?:/{1,3}|[a-z0-9%])|[a-z0-9.-]+[.](?:com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|Ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)/)(?:[^s()<>{}[]]+|([^s()]*?([^s()]+)[^s()]*?)|([^s]+?))+(?:([^s()]*?([^s()]+)[^s()]*?)|([^s]+?)|[^s`!()[]{};:'\".,<>?«»“”‘’])|(?:(?<!@)[a-z0-9]+(?:[.-][a-z0-9]+)*[.](?:com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|Ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)\b/?(?!@)))",
    "ig"
);
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
input.addEventListener("change", fileSelectHandler, false);
