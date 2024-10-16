import mclc from 'minecraft-launcher-core';
import path from 'node:path';
const { Client, Authenticator } = mclc;
var version = ""
var versionType
var username
var memory
var jre_ver = "8";
(async()=>{
    process.send(["data", null]);
    await new Promise((resolve, reject) => {process.on("message", (m) => {if (m[0] == "data") {const versionArray = m[1];version = versionArray[0];versionType = versionArray[1];username = versionArray[2];memory=versionArray[3];resolve();}});});
    const processedVersion = version.split(".")[1];
    if (parseInt(processedVersion) >= 17) {
        jre_ver = "21";
    }
    if (versionType === "Vanilla") {
        const launcher = new Client();
        launcher.launch({
            authorization: Authenticator.getAuth(username),
            root: path.join(process.env.appdata, "/.minecraft/"),
            version: {
                number: version,
                type: "release"
            },
            javaPath: path.join(process.env.appdata, ".minecraft", "zluvx-jres/", jre_ver, "bin", "java.exe"),
            memory: {
                max: memory,
                min: memory
            }
        });
        launcher.on('data', (e) => console.log(e));
        launcher.on('close', (code) => {process.exit();})
    }
})();