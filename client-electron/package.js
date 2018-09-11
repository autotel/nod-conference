const packager = require('electron-packager');
const rebuild = require('electron-rebuild').rebuild;
console.log(rebuild);

packager({
    dir: "./",
    afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
        rebuild({ buildPath, electronVersion, arch })
            .then(() => callback())
            .catch((error) => callback(error));
    }],
});