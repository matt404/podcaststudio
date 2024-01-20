class MediaFileUtil {
   static blobToDataUrl(blob, callback) {
        const reader = new FileReader();
        reader.onload = function() {
            callback(reader.result);
        };
        reader.readAsDataURL(blob);
    }
    static dataUrlToBlob(dataUrl, callback) {
        fetch(dataUrl)
            .then(res => res.blob())
            .then(callback);
    }
}
export default MediaFileUtil;