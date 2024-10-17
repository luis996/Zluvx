import chalk from 'chalk';
import path from 'node:path';
import fs from 'node:fs/promises';
import {createWriteStream} from 'fs'
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import readline from 'node:readline/promises';
import admzip from 'adm-zip';
import * as core from './core.mjs'
// import fetch from 'node-fetch';
async function restart() {await main();}
async function stop() {process.exit();}
async function fetchVersions(type) {
    if (type === "Vanilla") {
        const remoteResponse = await (await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json", {method: "GET",headers: {"Content-Type":"application/json"}})).json();
        // Process remoteResponse in order to create a version array.
        let versionsArray = [];
        remoteResponse.versions.forEach(ver=>{
            if (ver.type === "release") {
                versionsArray.push(ver.id);
            }
        })
        return versionsArray;
    }
    if (type === "Fabric") {
        const fabricMeta = "https://meta.fabricmc.net";
        const fabricResponse = await (await fetch(fabricMeta + "/v2/versions/game", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })).json();
        let versionsArray = [];
        fabricResponse.forEach(ver => {
            if (ver.stable === true) {
                versionsArray.push(ver.version);
            }
        });
        return versionsArray;
    }
}

async function jreHandle(ver, jrePath) {
    console.log(chalk.redBright(`JRE-${ver} Not found. Fetching from Eclipse Adoptium API...`));
    const request = await (await fetch(`https://api.adoptium.net/v3/assets/latest/${ver}/hotspot?os=windows&architecture=x64`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })).json();
    let downloadUrl
    request.forEach(r => {
        if (r.binary.image_type === "jre") {
            downloadUrl = r.binary.package.link;
        }
    });
    console.log(chalk.blueBright("Fetched!\nDownloading..."));
    const filewritestream = createWriteStream(path.join(jrePath, `jre${ver}.zip`));
    const download = await fetch(downloadUrl);
    await finished(Readable.fromWeb(download.body).pipe(filewritestream));


    const jrezip = new admzip(filewritestream.path);
    return new Promise((resolve)=>{jrezip.extractAllToAsync(path.join(jrePath), async ()=>{
        const direcx = await fs.readdir(jrePath);
        direcx.forEach(async file=>{
            if (file.endsWith(".zip")) { await fs.rm(path.join(filewritestream.path)); }
            if (file.startsWith("jdk")) { if (!(file.endsWith(".zip"))) {await fs.rename(path.join(jrePath, file), path.join(jrePath, ver));} }
        })
        resolve();
    })});
}
//
async function main() {
    await fs.access(path.join(process.env.appdata, ".minecraft/")).catch(async c=>{ await fs.mkdir(path.join(process.env.appdata, ".minecraft/")) });
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});
    const versionTypes = ["Vanilla", "Forge", "Fabric", "Quilt"]
    console.log(chalk.greenBright("Enter your username:"));
    const username = await rl.question("> ");
    console.log(chalk.greenBright("Welcome to Zluvx Launcher!\n\nSelect your version type:\n[0]\tVanilla\n[1]\tForge\n[2]\tFabric\n[3]\tQuilt"));
    const versionTypeResponse = await rl.question("> ");
    const versionType = versionTypes[parseInt(versionTypeResponse)];
    console.log(chalk.blueBright(`Fetching ${versionType} versions...`));
    const versions = (await fetchVersions(versionType)).reverse();
    console.clear();
    versions.forEach(ver=>{
        console.log(chalk.whiteBright(ver));
    })
    console.log(chalk.greenBright("Select your version (x.x)/(x.x.x)"));
    const questionfillx = rl.question("> ");rl.write(versions[versions.length-1]);
    const version = await questionfillx;



    console.clear();
    console.log(chalk.greenBright("Please select your memory:\nExample: 2G, 4G, 2048M, 4096M"));
    const memorypromptx = rl.question("> ");rl.write("2G");
    const memory = await memorypromptx;

    console.clear();
    console.log(chalk.blueBright("Deploying JRE. If it's the first time it may take a while..."));
    const jrePath = path.join(process.env.appdata, ".minecraft", "zluvx-jres/");
    await fs.access(jrePath).catch(async c=>{console.log(chalk.redBright("Directory doesn't exist. Creating one... "));await fs.mkdir(jrePath)});
    console.log(chalk.cyanBright("Verifying JRE-21..."));
    await fs.access(path.join(jrePath, "/21/")).catch(async c=>{await jreHandle("21", jrePath)});
    console.log(chalk.cyanBright("Verifying JRE-8..."));
    await fs.access(path.join(jrePath, "/8/")).catch(async c=>{await jreHandle("8", jrePath)});
    await core.runVersion(version, versionType, username, memory);
    rl.close();
    await restart();



    rl.close();
};main();
//