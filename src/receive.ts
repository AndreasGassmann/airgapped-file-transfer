function typedArrayToUnicodeString(ua: Uint8Array) {
    var binstr = Array.prototype.map.call(ua, function (ch: number) {
        return String.fromCharCode(ch);
    }).join('');
    var escstr = binstr.replace(/(.)/g, function (_m: any, p: any) {
        var code = p.charCodeAt(p).toString(16).toUpperCase();
        if (code.length < 2) {
            code = '0' + code;
        }
        return '%' + code;
    });
    return decodeURIComponent(escstr);
}

var downloadBlob, downloadURL;

downloadBlob = function (data: Uint8Array, fileName, mimeType) {
    var blob, url;
    blob = new Blob([data], {
        type: mimeType
    });
    url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(function () {
        return window.URL.revokeObjectURL(url);
    }, 1000);
};

downloadURL = function (data, fileName) {
    var a;
    a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
};

{
    const decoder = new bc.URDecoder();

    let lastScan

    const decode = (part: string) => {
        if (lastScan === part) {
            console.log('DUPLICATE')
            return
        }
        lastScan = part

        console.log('decoded qr code:', part)
        decoder.receivePart(part);

        document.getElementById('progress').innerHTML = decoder.estimatedPercentComplete()

        if (decoder.isComplete()) {
            if (decoder.isSuccess()) {
                const res = decoder.resultUR().decodeCBOR()
                console.log('success', res)
                try {
                    console.log('INTERPRETED', typedArrayToUnicodeString(new Uint8Array(Object.values(res))))
                    document.getElementById('result').innerHTML = typedArrayToUnicodeString(new Uint8Array(Object.values(res)))
                } catch (e) {
                    downloadBlob(new Uint8Array(Object.values(res)), 'air-gapped-file.jpg', 'application/octet-stream');
                }
                document.getElementById('video').remove()
                qrScanner.stop()
            }
            else {
                console.log('decoder.resultError()', decoder.resultError())
            }
        }
    }

    const qrScanner = new QrScanner(document.getElementById('video'), decode);

    qrScanner.start();

}