let qrcode;
let interval;
let fileReadData = new Uint8Array([100]);
let encoder;
// https://www.html5rocks.com/en/tutorials/file/dndfiles//
const setupSlider = (sliderElName, sliderValueName) => {
    let slider = document.getElementById(sliderElName);
    let output = document.getElementById(sliderValueName);
    output.innerHTML = slider.value; // Display the default slider value
    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function () {
        output.innerHTML = slider.value;
    };
};
setupSlider('speed', 'speed-value');
setupSlider('size', 'size-value');
qrcode;
const drawQR = (str) => {
    console.log('drawing', str);
    const el = document.getElementById("qrcode");
    // el.innerHTML = ''
    if (qrcode) {
        qrcode.makeCode(str);
    }
    else {
        qrcode = new QRCode(el, {
            text: str,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
};
function unicodeStringToTypedArray(s) {
    var escstr = encodeURIComponent(s);
    console.log('ASDASDASD');
    var binstr = escstr.replace(/%([0-9A-F]{2})/g, function (_match, p1) {
        return String.fromCharCode('0x' + p1);
    });
    console.log(binstr);
    var ua = new Uint8Array(binstr.length);
    Array.prototype.forEach.call(binstr, function (ch, i) {
        ua[i] = ch.charCodeAt(0);
    });
    return ua;
}
// Content wrapper element
let contentElement = document.getElementById("content");
// Button callback
async function onButtonClicked() {
    let files = await selectFile("image/*", true);
    console.log(files);
    console.log(URL.createObjectURL(files[0]));
    console.log(readAllBytesAsUInt8Array(URL.createObjectURL(files[0])));
    contentElement.innerHTML = files.map(file => `<img src="${URL.createObjectURL(file)}" style="width: 100px; height: 100px;">`).join('');
}
/**
 * Select file(s).
 * @param {String} contentType The content type of files you wish to select. For instance "image/*" to select all kinds of images.
 * @param {Boolean} multiple Indicates if the user can select multiples file.
 * @returns {Promise<File|File[]>} A promise of a file or array of files in case the multiple parameter is true.
 */
function selectFile(contentType, multiple) {
    return new Promise(resolve => {
        let input = document.createElement('input');
        input.type = 'file';
        input.multiple = multiple;
        input.accept = contentType;
        input.onchange = _ => {
            let files = Array.from(input.files);
            if (multiple)
                resolve(files);
            else
                resolve([files[0]]);
        };
        input.click();
    });
}
function readAllBytesAsUInt8Array(path) {
    var req = new XMLHttpRequest();
    req.responseType = "arraybuffer";
    req.open("GET", path, false);
    req.overrideMimeType("text/plain; charset=binary-data");
    req.send(null);
    if (req.status !== 200) {
        console.log("error");
        return null;
    }
    let buffer = req.response;
    let u = new Uint8Array(buffer);
    return u.buffer;
}
const startEncodingData = () => {
    console.log('preparing data');
    const textAreaValue = document.getElementById('data').value;
    const ur = textAreaValue ? bc.UR.fromUint8Array(unicodeStringToTypedArray(textAreaValue)) : bc.UR.fromUint8Array(fileReadData);
    const maxFragmentLength = Number(document.getElementById('size').value);
    const firstSeqNum = 0;
    encoder = new bc.UREncoder(ur, maxFragmentLength, firstSeqNum);
    console.log('fragmentsLength', encoder.fragmentsLength);
    console.log('messageLength', encoder.messageLength);
};
const startInterval = () => {
    if (interval) {
        clearInterval(interval);
    }
    if (!encoder) {
        startEncodingData();
    }
    drawQR(encoder.nextPart());
    interval = setInterval(() => {
        drawQR(encoder.nextPart());
    }, Number(document.getElementById('speed').value));
};
document.getElementById('start').addEventListener('click', () => {
    startInterval();
});
document.getElementById('stop').addEventListener('click', () => {
    if (interval) {
        clearInterval(interval);
        encoder = undefined;
    }
});
// function handleFileSelect(evt) {
//     evt.stopPropagation();
//     evt.preventDefault();
//     var files = evt.dataTransfer.files; // FileList object.
//     // files is a FileList of File objects. List some properties.
//     var output = [];
//     for (var i = 0, f; f = files[i]; i++) {
//         output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
//             f.size, ' bytes, last modified: ',
//             f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
//             '</li>');
//     }
//     document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
// }
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {
        f.arrayBuffer().then(r => {
            var uint8View = new Uint8Array(r);
            fileReadData = uint8View;
            startEncodingData();
            console.log(uint8View);
        });
        // Only process image files.
        if (!f.type.match('image.*')) {
            continue;
        }
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                // Render thumbnail.
                var span = document.createElement('span');
                span.innerHTML = ['<img class="thumb" src="', e.target.result,
                    '" title="', escape(theFile.name), '"/>'].join('');
                document.getElementById('list').insertBefore(span, null);
            };
        })(f);
        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
}
document.getElementById('files').addEventListener('change', handleFileSelect, false);
