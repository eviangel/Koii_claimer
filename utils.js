"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadExecutableFileToIpfs = exports.createKeypairFromFile = exports.getPayer = exports.getRpcUrl = exports.getConfig = void 0;
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yaml_1 = __importDefault(require("yaml"));
const web3_js_1 = require("@_koi/web3.js");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// import { Web3Storage, getFilesFromPath } from "web3.storage";
const storage_1 = require("@spheron/storage");
/**
 * @private
 */
function getConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        // Path to KOII CLI config file
        const CONFIG_FILE_PATH = path_1.default.resolve(os_1.default.homedir(), ".config", "koii", "cli", "config.yml");
        const configYml = fs_1.default.readFileSync(CONFIG_FILE_PATH, { encoding: "utf8" });
        return yaml_1.default.parse(configYml);
    });
}
exports.getConfig = getConfig;
/**
 * Load and parse the Koii CLI config file to determine which RPC url to use
 */
function getRpcUrl() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = yield getConfig();
            console.log("CONFIG", config);
            if (!config.json_rpc_url)
                throw new Error("Missing RPC URL");
            return config.json_rpc_url;
        }
        catch (err) {
            console.warn("Failed to read RPC url from CLI config file, falling back to testnet");
            return "https://testnet.koii.live/";
        }
    });
}
exports.getRpcUrl = getRpcUrl;
/**
 * Load and parse the KOII CLI config file to determine which payer to use
 */
function getPayer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = yield getConfig();
            if (!config.keypair_path)
                throw new Error("Missing keypair path");
            return yield createKeypairFromFile(config.keypair_path);
        }
        catch (err) {
            console.warn("Failed to create keypair from CLI config file, falling back to new random keypair");
            return web3_js_1.Keypair.generate();
        }
    });
}
exports.getPayer = getPayer;
/**
 * Create a Keypair from a secret key stored in file as bytes' array
 */
function createKeypairFromFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const secretKeyString = fs_1.default.readFileSync(filePath, { encoding: "utf8" });
        const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        return web3_js_1.Keypair.fromSecretKey(secretKey);
    });
}
exports.createKeypairFromFile = createKeypairFromFile;
function uploadExecutableFileToIpfs(filePath, secret_web3_storage_key) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `${filePath}`;
        //console.log(filePath);
        //console.log(secret_web3_storage_key);
        console.log("FILEPATH", path);
        if (path.substring(path.length - 7) !== "main.js") {
            console.error("Provide a valid path to webpacked 'main.js' file");
            process.exit();
        }
        if (fs_1.default.existsSync(path)) {
            // const storageClient = new Web3Storage({
            //   token: secret_web3_storage_key || "",
            // });
            const client = new storage_1.SpheronClient({ token: secret_web3_storage_key || "" });
            let cid;
            if (client) {
                // const upload: any = await getFilesFromPath(path);
                // cid = await storageClient.put(upload);
                const ipfsData = yield client.upload(filePath, {
                    protocol: storage_1.ProtocolEnum.IPFS,
                    name: "main.js"
                });
                cid = ipfsData.cid;
            }
            console.log("CID of executable", cid);
            return cid;
        }
        else {
            console.error("\x1b[31m%s\x1b[0m", "task_audit_program File not found");
            process.exit();
        }
    });
}
exports.uploadExecutableFileToIpfs = uploadExecutableFileToIpfs;