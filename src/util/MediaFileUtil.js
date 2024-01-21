class MediaFileUtil {
    static blobToArrayBuffer(blob, callback) {
        const reader = new FileReader();
        reader.onload = function() {
            callback(reader.result);
        };
        reader.readAsArrayBuffer(blob);
    }
    static dataUrlToBlob(dataUrl, callback) {
        fetch(dataUrl)
            .then(res => res.blob())
            .then(callback);
    }

    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    static formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
}
export default MediaFileUtil;