import mclc from 'minecraft-launcher-core';
import path from 'node:path';
import chalk from 'chalk';
const { Client, Authenticator } = mclc;
async function x(version, versionType, username, memory) {
    var jre_ver = "8";
    const processedVersion = version.split(".")[1];
    if (parseInt(processedVersion) >= 17) {
        jre_ver = "21";
    }
    if (versionType === "Vanilla") {
        const launcher = new Client();
        let opts = {
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
        };
        if (processedVersion === "16") {
            console.log(chalk.redBright("Multiplayer blocked by Mojang servers. A bypass will be activated.\n Hold down. Still downloading..."));
            opts.customArgs = ["-Dminecraft.api.auth.host=https://0.0.0.0", "-Dminecraft.api.account.host=https://0.0.0.0", "-Dminecraft.api.session.host=https://0.0.0.0", "-Dminecraft.api.services.host=https://0.0.0.0"]
        }
        launcher.launch(opts);
        launcher.on('data', (e) => console.log(e));
        launcher.on('close', (code) => {process.exit();})
    }
}
export default {
    runVersion: x,
}