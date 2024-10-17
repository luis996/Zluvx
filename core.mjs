import mclc from 'minecraft-launcher-core';
import path from 'node:path';
import chalk from 'chalk';
import fs from 'node:fs/promises';
const { Client, Authenticator } = mclc;
export async function runVersion(version, versionType, username, memory) {
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
        return new Promise((resolve) => {launcher.on('close', resolve)});
    }
    if (versionType === "Fabric") {
        let xboolean = true;
        await fs.access(path.join(process.env.appdata, ".minecraft", "versions", `Fabric${version}`)).catch(e=>{xboolean = false})
        if (xboolean === false) {
            const vResponse = await (await fetch(`https://meta.fabricmc.net/v2/versions/loader/${version}`)).json();
            const loaderVersion = vResponse[0].loader.version;
            const PROFILEjson = await (await fetch(`https://meta.fabricmc.net/v2/versions/loader/${version}/${loaderVersion}/profile/json`)).json();
            const PROFILE = JSON.stringify(PROFILEjson);
            await fs.mkdir(path.join(process.env.appdata, ".minecraft", "versions", `Fabric${version}`));
            await fs.writeFile(path.join(process.env.appdata, ".minecraft", "versions", `Fabric${version}`, `Fabric${version}.json`), PROFILE);
        }

        const launcher = new Client();
        let opts = {
            authorization: Authenticator.getAuth(username),
            root: path.join(process.env.appdata, "/.minecraft/"),
            version: {
                number: version,
                type: "release",
                custom: "Fabric" + version
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
        return new Promise((resolve) => {launcher.on('close', resolve)});
    }
}