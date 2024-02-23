#!/usr/bin/env node
"use strict";
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
const fs = require('fs');
const task_contract_1 = require("./task_contract");
const utils_2 = require("./utils");
const prompts_1 = __importDefault(require("prompts"));
const web3_js_1 = require("@_koi/web3.js");
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const os_1 = require("os");
// import { Web3Storage, getFilesFromPath, Filelike } from "web3.storage";
(0, dotenv_1.config)();
var RequirementType;
(function (RequirementType) {
    RequirementType["GLOBAL_VARIABLE"] = "GLOBAL_VARIABLE";
    RequirementType["TASK_VARIABLE"] = "TASK_VARIABLE";
    RequirementType["CPU"] = "CPU";
    RequirementType["RAM"] = "RAM";
    RequirementType["STORAGE"] = "STORAGE";
    RequirementType["NETWORK"] = "NETWORK";
    RequirementType["ARCHITECTURE"] = "ARCHITECTURE";
    RequirementType["OS"] = "OS";
})(RequirementType || (RequirementType = {}));





function loadConfigSync(filePath) {
    try {
        const data = fs.readFileSync(filePath, { encoding: 'utf8' });
        const config = JSON.parse(data);
        return config;
    } catch (error) {
        console.error('Error reading the config file:', error);
        return null;
    }
}

async function main() {
    //here
    const configPath = process.argv[2];
    const parameters = loadConfigSync(configPath);

    if (!parameters) {
        console.error('Failed to load configuration from file.');
        process.exit(1); // Exit if no configuration is found
    }

    // Now you can use parameters directly
    console.log('Configuration loaded:', parameters.stakePotAccount);

    //tillhere
    return __awaiter(this, void 0, void 0, function* () {
        let payerWallet;
        let walletPath;
        let config;
        try {
            config = yield (0, utils_2.getConfig)();
            walletPath = config.keypair_path;
            // walletPath = "1.json"
        }
        catch (error) {
            walletPath = path_1.default.resolve((0, os_1.homedir)(), ".config", "koii", "id.json");
        }
        if (!fs_1.default.existsSync(walletPath)) {
            walletPath = (yield (0, prompts_1.default)({
                type: "text",
                name: "walletPath",
                message: "Enter the path to your wallet",
            })).walletPath;
            walletPath = walletPath.trim();
            if (!fs_1.default.existsSync(walletPath)) {
                throw Error("Please make sure that the wallet path is correct");
            }
        }
        console.log("Wallet path: ", walletPath);
        try {
            const wallet = fs_1.default.readFileSync(walletPath, "utf-8");
            payerWallet = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(wallet)));
        }
        catch (e) {
            console.error("Wallet is not valid");
            //console.error(logSymbols.error, "Wallet is not valid");
            process.exit();
        }

        


        const mode = (yield (0, prompts_1.default)({
            type: "select",
            name: "mode",
            message: "Select operation",
            choices: [
                { title: "Claim reward", value: "claim-reward" },
            ],
        })).mode;
        console.log(mode);
        // Establish connection to the cluster
        const connection = yield (0, task_contract_1.establishConnection)();
        // Determine who pays for the fees
        yield (0, task_contract_1.establishPayer)(payerWallet);
        // Check if the program has been deployed
        yield (0, task_contract_1.checkProgram)();
        switch (mode) {
            case "claim-reward": {
                console.log("Calling ClaimReward",parameters.claimerKeypairPath);
                // const { claimerKeypair, } = yield takeInputForClaimReward();
                // const beneficiaryAccount = parameters[0];
                // const stakePotAccount= parameters[1];
                // const taskStateInfoAddress= parameters[2];
                const kp = parameters.claimerKeypairPath
                const { beneficiaryAccount, stakePotAccount, taskStateInfoAddress } = yield takeInputForClaimReward( parameters.beneficiaryAccount,parameters.stakePotAccount,parameters.taskStateInfoAddress);
                // const { beneficiaryAccount, stakePotAccount, taskStateInfoAddress, } = parameters;
                
                yield (0, task_contract_1.ClaimReward)(payerWallet, taskStateInfoAddress, stakePotAccount, beneficiaryAccount, kp);
                break;
            }
            default:
                console.error("Invalid option selected");
        }
        console.log("Success");
    });
}

function takeInputForClaimReward(beneficiaryAccount,stakePotAccount,taskStateInfoAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // const taskStateInfoAddress = params[0];
        // const stakePotAccount = params[1];
        // const beneficiaryAccount = params[2];
       
        return {
            beneficiaryAccount: new web3_js_1.PublicKey(beneficiaryAccount),
            stakePotAccount: new web3_js_1.PublicKey(stakePotAccount),
            taskStateInfoAddress: new web3_js_1.PublicKey(taskStateInfoAddress),
        };
    });
}

main().then(() => process.exit(), (err) => {
    console.error(err);
    process.exit(-1);
});
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}