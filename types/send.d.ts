declare let QRCode: any;
declare let bc: any;
declare let QrScanner: any;
declare let qrcode: any;
declare let interval: any;
declare let fileReadData: Uint8Array;
declare let encoder: any;
declare const setupSlider: (sliderElName: string, sliderValueName: string) => void;
declare const drawQR: (str: string) => void;
declare function unicodeStringToTypedArray(s: string): Uint8Array;
declare let contentElement: HTMLElement;
declare function onButtonClicked(): Promise<void>;
/**
 * Select file(s).
 * @param {String} contentType The content type of files you wish to select. For instance "image/*" to select all kinds of images.
 * @param {Boolean} multiple Indicates if the user can select multiples file.
 * @returns {Promise<File|File[]>} A promise of a file or array of files in case the multiple parameter is true.
 */
declare function selectFile(contentType: any, multiple: any): Promise<File[]>;
declare function readAllBytesAsUInt8Array(path: any): ArrayBufferLike;
declare const startEncodingData: () => void;
declare const startInterval: () => void;
declare function handleDragOver(evt: any): void;
declare function handleFileSelect(evt: any): void;
