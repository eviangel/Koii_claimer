"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Withdraw = exports.FundTask = exports.ClaimReward = exports.SetActive = exports.Whitelist = exports.updateTask = exports.createTask = exports.checkProgram = exports.establishPayer = exports.establishConnection = void 0;
const web3_js_1 = require("@_koi/web3.js");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const BufferLayout = require("@solana/buffer-layout");
const rustString = (property = "string") => {
    const rsl = BufferLayout.struct([
        BufferLayout.u32("length"),
        BufferLayout.u32("lengthPadding"),
        BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), "chars"),
    ], property);
    const _decode = rsl.decode.bind(rsl);
    const _encode = rsl.encode.bind(rsl);
    rsl.decode = (buffer, offset) => {
        const data = _decode(buffer, offset);
        return data["chars"].toString("utf8");
    };
    rsl.encode = (str, buffer, offset) => {
        const data = {
            chars: Buffer.from(str, "utf8"),
        };
        return _encode(data, buffer, offset);
    };
    rsl.alloc = (str) => {
        return (BufferLayout.u32().span +
            BufferLayout.u32().span +
            Buffer.from(str, "utf8").length);
    };
    return rsl;
};
const publicKey = (property = "publicKey") => {
    return BufferLayout.blob(32, property);
};
const toBuffer = (arr) => {
    if (Buffer.isBuffer(arr)) {
        return arr;
    }
    else if (arr instanceof Uint8Array) {
        return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
    }
    else {
        return Buffer.from(arr);
    }
};
const utils_1 = require("./utils");
const SYSTEM_PUBLIC_KEY = new web3_js_1.PublicKey("11111111111111111111111111111111");
const CLOCK_PUBLIC_KEY = new web3_js_1.PublicKey("SysvarC1ock11111111111111111111111111111111");
// let STAKE_POT_ACCOUNT: PublicKey;
// =new PublicKey("9XABSvWLMkUV1hPb4bXbJqvsH3Ab2mptxMMMnxfJUvG9")
/**
 * Connection to the network
 */
let connection;
/**
 * Hello world's program id
 */
let programId;
/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy task_contract-keypair.json`
 */
// const PROGRAM_KEYPAIR_PATH = 'TaskMDbVartWDkgHrWZ6NiHUQUwdWpN3WDyRmSEoMTm.json';
const TASK_INSTRUCTION_LAYOUTS = Object.freeze({
    CreateTask: {
        index: 0,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.blob(24, "task_name"),
            BufferLayout.blob(64, "task_description"),
            BufferLayout.blob(64, "task_audit_program"),
            BufferLayout.blob(64, "task_executable_network"),
            BufferLayout.ns64("total_bounty_amount"),
            BufferLayout.ns64("bounty_amount_per_round"),
            BufferLayout.ns64("round_time"),
            BufferLayout.ns64("audit_window"),
            BufferLayout.ns64("submission_window"),
            BufferLayout.ns64("minimum_stake_amount"),
            BufferLayout.blob(64, "task_metadata"),
            BufferLayout.blob(64, "local_vars"),
            BufferLayout.ns64("allowed_failed_distributions"),
            // publicKey('stake_pot_account')
        ]),
    },
    UpdateTask: {
        index: 14,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.blob(24, "task_name"),
            BufferLayout.blob(64, "task_description"),
            BufferLayout.blob(64, "task_audit_program"),
            BufferLayout.blob(64, "task_executable_network"),
            BufferLayout.ns64("bounty_amount_per_round"),
            BufferLayout.ns64("round_time"),
            BufferLayout.ns64("audit_window"),
            BufferLayout.ns64("submission_window"),
            BufferLayout.ns64("minimum_stake_amount"),
            BufferLayout.blob(64, "task_metadata"),
            BufferLayout.blob(64, "local_vars"),
            BufferLayout.ns64("allowed_failed_distributions"),
        ]),
    },
    SubmitTask: {
        index: 1,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.blob(512, "submission"),
            BufferLayout.ns64("round"),
        ]),
    },
    AuditSubmissions: {
        index: 2,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.ns64("is_valid"),
            BufferLayout.ns64("round"),
        ]),
    },
    AuditDistribution: {
        index: 3,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.ns64("is_valid"),
            BufferLayout.ns64("round"),
        ]),
    },
    Payout: {
        index: 4,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.ns64("round"),
        ]),
    },
    Whitelist: {
        index: 5,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.ns64("isWhitelisted"),
        ]),
    },
    SetActive: {
        index: 6,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.ns64("isActive"),
        ]),
    },
    ClaimReward: {
        index: 7,
        layout: BufferLayout.struct([BufferLayout.u8("instruction")]),
    },
    FundTask: {
        index: 8,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.ns64("amount"),
        ]),
    },
    Stake: {
        index: 9,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.ns64("stakeAmount"),
        ]),
    },
    Withdraw: {
        //WithDraw Stake
        index: 10,
        layout: BufferLayout.struct([BufferLayout.u8("instruction")]),
    },
    UploadDistributionList: {
        //Upload Distribution complex flow, seperate script
        index: 11,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.blob(512, "instruction_data"),
        ]),
    },
    SubmitDistributionList: {
        //WithDraw Stake
        index: 12,
        layout: BufferLayout.struct([
            BufferLayout.u8("instruction"),
            BufferLayout.ns64("round"),
        ]),
    },
});
/**
 * Establish a connection to the cluster
 */
function establishConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        const rpcUrl = yield (0, utils_1.getRpcUrl)();
        connection = new web3_js_1.Connection(rpcUrl, "confirmed");
        const version = yield connection.getVersion();
        console.log("Connection to cluster established:", rpcUrl, version);
        return connection;
    });
}
exports.establishConnection = establishConnection;
/**
 * Establish an account to pay for everything
 */
function establishPayer(payerWallet) {
    return __awaiter(this, void 0, void 0, function* () {
        let fees = 0;
        if (!payerWallet) {
            const { feeCalculator } = yield connection.getRecentBlockhash();
            // Calculate the cost to fund the greeter account
            fees += yield connection.getMinimumBalanceForRentExemption(1000);
            // Calculate the cost of sending transactions
            fees += feeCalculator.lamportsPerSignature * 100; // wag
            payerWallet = yield (0, utils_1.getPayer)();
        }
        const lamports = yield connection.getBalance(payerWallet.publicKey);
        if (lamports < fees) {
            console.error("Your balance is not sufficient: " + payerWallet.publicKey.toBase58);
            process.exit(0);
            // If current balance is not enough to pay for fees, request an airdrop
            // const sig = await connection.requestAirdrop(payer.publicKey, 100000000000 + fees - lamports);
            // await connection.confirmTransaction(sig);
            // lamports = await connection.getBalance(payer.publicKey);
        }
        console.log("Using account", payerWallet.publicKey.toBase58(), "containing", lamports / web3_js_1.LAMPORTS_PER_SOL, "SOL to pay for fees");
    });
}
exports.establishPayer = establishPayer;
/**
 * Check if the hello world BPF program has been deployed
 */
function checkProgram() {
    return __awaiter(this, void 0, void 0, function* () {
        // Read program id from keypair file
        try {
            programId = new web3_js_1.PublicKey("Koiitask22222222222222222222222222222222222");
        }
        catch (err) {
            const errMsg = err.message;
            throw new Error(`Failed to read program keypair at due to error: ${errMsg}. The task executable need to be uploaded. Program may need to be deployed with \`solana program deploy dist/program/helloworld.so\``);
        }
        // Check if the program has been deployed
        const programInfo = yield connection.getAccountInfo(programId);
        if (programInfo === null) {
            throw new Error("Please use koii testnet or mainnet to deploy the program");
        }
        else if (!programInfo.executable) {
            throw new Error(`Program is not executable`);
        }
        console.log(`Using program ${programId.toBase58()}`);
    });
}
exports.checkProgram = checkProgram;
function encodeData(type, fields) {
    const allocLength = type.layout.span >= 0 ? type.layout.span : getAlloc(type, fields);
    const data = Buffer.alloc(allocLength);
    const layoutFields = Object.assign({ instruction: type.index }, fields);
    type.layout.encode(layoutFields, data);
    return data;
}
function getAlloc(type, fields) {
    let alloc = 0;
    type.layout.fields.forEach((item) => {
        if (item.span >= 0) {
            alloc += item.span;
        }
        else if (typeof item.alloc === "function") {
            alloc += item.alloc(fields[item.property]);
        }
    });
    return alloc;
}
function padStringWithSpaces(input, length) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(input);
    const padding = length - encoded.length;
    const spaces = new Uint8Array(padding).fill(32); // 32 is the ASCII code for space
    const paddedArray = new Uint8Array(encoded.length + padding);
    paddedArray.set(encoded);
    paddedArray.set(spaces, encoded.length);
    return new TextDecoder().decode(paddedArray);
}
function createTask(payerWallet, task_name, task_audit_program, total_bounty_amount, bounty_amount_per_round, space, task_description, task_executable_network, round_time, audit_window, submission_window, minimum_stake_amount, task_metadata, local_vars, koii_vars, allowed_failed_distributions) {
    return __awaiter(this, void 0, void 0, function* () {
        // Checks
        if (round_time < audit_window + submission_window)
            throw new Error("Round time cannot be less than audit_window + submission_window");
        if (task_description.length > 64)
            throw new Error("task_description cannot be greater than 64 characters");
        // console.log(
        //   "TEST",
        //   task_name,
        //   task_description,
        //   task_audit_program,
        //   task_executable_network,
        //   task_metadata,
        //   local_vars
        // );
        const createTaskData = {
            task_name: new TextEncoder().encode(padStringWithSpaces(task_name, 24)),
            task_description: new TextEncoder().encode(padStringWithSpaces(task_description, 64)),
            task_audit_program: new TextEncoder().encode(padStringWithSpaces(task_audit_program, 64)),
            task_executable_network: new TextEncoder().encode(padStringWithSpaces(task_executable_network, 64)),
            total_bounty_amount: total_bounty_amount * web3_js_1.LAMPORTS_PER_SOL,
            bounty_amount_per_round: bounty_amount_per_round * web3_js_1.LAMPORTS_PER_SOL,
            round_time: round_time,
            audit_window: audit_window,
            submission_window: submission_window,
            rentExemptionAmount: (yield connection.getMinimumBalanceForRentExemption(space)) + 1000,
            space: space,
            minimum_stake_amount: minimum_stake_amount * web3_js_1.LAMPORTS_PER_SOL,
            task_metadata: new TextEncoder().encode(padStringWithSpaces(task_metadata, 64)),
            local_vars: new TextEncoder().encode(padStringWithSpaces(local_vars, 64)),
            allowed_failed_distributions: allowed_failed_distributions,
            // koii_vars:new TextEncoder().encode(padStringWithSpaces(task_metadata,64))
        };
        const data = encodeData(TASK_INSTRUCTION_LAYOUTS.CreateTask, createTaskData);
        const taskStateInfoKeypair = web3_js_1.Keypair.generate();
        const stake_pot_account_pubkey = getStakePotAccount();
        const createTaskStateTransaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: payerWallet.publicKey,
            newAccountPubkey: taskStateInfoKeypair.publicKey,
            lamports: createTaskData.rentExemptionAmount,
            space: createTaskData.space,
            programId: programId,
        }));
        const keys = [
            { pubkey: payerWallet.publicKey, isSigner: true, isWritable: true },
            {
                pubkey: taskStateInfoKeypair.publicKey,
                isSigner: true,
                isWritable: true,
            },
            { pubkey: stake_pot_account_pubkey, isSigner: false, isWritable: true },
            { pubkey: CLOCK_PUBLIC_KEY, isSigner: false, isWritable: false },
        ];
        if (koii_vars)
            [
                keys.push({
                    pubkey: new web3_js_1.PublicKey(koii_vars),
                    isSigner: false,
                    isWritable: false,
                }),
            ];
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, createTaskStateTransaction, [
            payerWallet,
            taskStateInfoKeypair,
        ]);
        const instruction = new web3_js_1.TransactionInstruction({
            keys,
            programId,
            data: data,
        });
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, new web3_js_1.Transaction().add(instruction), [payerWallet, taskStateInfoKeypair]);
        // Transfer to stakepot account
        const transferTx = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: payerWallet.publicKey,
            toPubkey: stake_pot_account_pubkey,
            lamports: 0.001 * web3_js_1.LAMPORTS_PER_SOL,
        }));
        try {
            yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transferTx, [payerWallet]);
        }
        catch (e) {
            console.error(e);
        }
        return { taskStateInfoKeypair, stake_pot_account_pubkey };
    });
}
exports.createTask = createTask;
function updateTask(payerWallet, task_name, task_audit_program, bounty_amount_per_round, space, task_description, task_executable_network, round_time, audit_window, submission_window, minimum_stake_amount, task_metadata, local_vars, allowed_failed_distributions, taskAccountInfoPubKey, statePotAccountPubKey) {
    return __awaiter(this, void 0, void 0, function* () {
        // Checks
        if (round_time < audit_window + submission_window)
            throw new Error("Round time cannot be less than audit_window + submission_window");
        if (task_description.length > 64)
            throw new Error("task_description cannot be greater than 64 characters");
        const updateTaskData = {
            task_name: new TextEncoder().encode(padStringWithSpaces(task_name, 24)),
            task_description: new TextEncoder().encode(padStringWithSpaces(task_description, 64)),
            task_audit_program: new TextEncoder().encode(padStringWithSpaces(task_audit_program, 64)),
            task_executable_network: new TextEncoder().encode(padStringWithSpaces(task_executable_network, 64)),
            bounty_amount_per_round: bounty_amount_per_round * web3_js_1.LAMPORTS_PER_SOL,
            round_time: round_time,
            audit_window: audit_window,
            submission_window: submission_window,
            rentExemptionAmount: (yield connection.getMinimumBalanceForRentExemption(space)) + 1000,
            space: space,
            minimum_stake_amount: minimum_stake_amount * web3_js_1.LAMPORTS_PER_SOL,
            task_metadata: new TextEncoder().encode(padStringWithSpaces(task_metadata, 64)),
            local_vars: new TextEncoder().encode(padStringWithSpaces(local_vars, 64)),
            allowed_failed_distributions: allowed_failed_distributions,
        };
        const data = encodeData(TASK_INSTRUCTION_LAYOUTS.UpdateTask, updateTaskData);
        const newTaskStateInfoKeypair = web3_js_1.Keypair.generate();
        const newStake_pot_account_pubkey = getStakePotAccount();
        const createTaskStateTransaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: payerWallet.publicKey,
            newAccountPubkey: newTaskStateInfoKeypair.publicKey,
            lamports: updateTaskData.rentExemptionAmount,
            space: updateTaskData.space,
            programId: programId,
        }));
        const keys = [
            { pubkey: payerWallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: taskAccountInfoPubKey, isSigner: false, isWritable: true },
            { pubkey: statePotAccountPubKey, isSigner: false, isWritable: true },
            { pubkey: CLOCK_PUBLIC_KEY, isSigner: false, isWritable: false },
            {
                pubkey: newTaskStateInfoKeypair.publicKey,
                isSigner: true,
                isWritable: true,
            },
            { pubkey: newStake_pot_account_pubkey, isSigner: false, isWritable: true },
        ];
        // if (koii_vars) [
        //   keys.push({
        //     pubkey: new PublicKey(koii_vars), isSigner: false, isWritable: false
        //   })
        // ]
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, createTaskStateTransaction, [
            payerWallet,
            newTaskStateInfoKeypair,
        ]);
        const instruction = new web3_js_1.TransactionInstruction({
            keys,
            programId,
            data: data,
        });
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, new web3_js_1.Transaction().add(instruction), [payerWallet, newTaskStateInfoKeypair]);
        return { newTaskStateInfoKeypair, newStake_pot_account_pubkey };
    });
}
exports.updateTask = updateTask;
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
// export async function submitTask(taskStateInfoKeypair: Keypair): Promise<PublicKey> {
//   const data = encodeData(TASK_INSTRUCTION_LAYOUTS.SubmitTask, {
//     submission: new TextEncoder().encode(padStringWithSpaces('test1111111111111111111111111111', 512)), //must be 512 chracters long
//     stakeAmount: 10000000,
//   });
//   let submitterKeypair = Keypair.generate();
//   console.log('Making new account', submitterKeypair.publicKey.toBase58());
//   const createSubmitterAccTransaction = new Transaction().add(
//     SystemProgram.createAccount({
//       fromPubkey: payer.publicKey,
//       newAccountPubkey: submitterKeypair.publicKey,
//       lamports: 10000000 + (await connection.getMinimumBalanceForRentExemption(100)) + 10000, //Adding 10,000 extra lamports for padding
//       space: 100,
//       programId: programId,
//     })
//   );
//   await sendAndConfirmTransaction(connection, createSubmitterAccTransaction, [payer, submitterKeypair]);
//   await sleep(10000);
//   console.log('CAAALLL', submitterKeypair.publicKey.toBase58());
//   const instruction = new TransactionInstruction({
//     keys: [
//       {pubkey: taskStateInfoKeypair.publicKey, isSigner: false, isWritable: true},
//       {pubkey: submitterKeypair.publicKey, isSigner: true, isWritable: true},
//       {pubkey: STAKE_POT_ACCOUNT, isSigner: false, isWritable: true},
//       {pubkey: CLOCK_PUBLIC_KEY, isSigner: false, isWritable: false},
//       {pubkey: SYSTEM_PUBLIC_KEY, isSigner: false, isWritable: false},
//     ],
//     programId,
//     data: data,
//   });
//   await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [payer, submitterKeypair]);
//   return submitterKeypair.publicKey;
// }
function Whitelist(payerWallet, taskStateInfoAddress, PROGRAM_KEYPAIR_PATH, isWhitelisted) {
    return __awaiter(this, void 0, void 0, function* () {
        const programKeypair = yield (0, utils_1.createKeypairFromFile)(PROGRAM_KEYPAIR_PATH);
        console.log("WHITELIST", programKeypair.publicKey.toBase58());
        const data = encodeData(TASK_INSTRUCTION_LAYOUTS.Whitelist, {
            isWhitelisted,
        });
        const instruction = new web3_js_1.TransactionInstruction({
            keys: [
                { pubkey: taskStateInfoAddress, isSigner: false, isWritable: true },
                { pubkey: programKeypair.publicKey, isSigner: true, isWritable: false },
            ],
            programId,
            data: data,
        });
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, new web3_js_1.Transaction().add(instruction), [payerWallet, programKeypair]);
    });
}
exports.Whitelist = Whitelist;
function SetActive(payerWallet, taskStateInfoAddress, setActive) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = encodeData(TASK_INSTRUCTION_LAYOUTS.SetActive, {
            isActive: setActive ? 1 : 0,
        });
        const instruction = new web3_js_1.TransactionInstruction({
            keys: [
                { pubkey: taskStateInfoAddress, isSigner: false, isWritable: true },
                { pubkey: payerWallet.publicKey, isSigner: true, isWritable: false },
            ],
            programId,
            data: data,
        });
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, new web3_js_1.Transaction().add(instruction), [payerWallet]);
    });
}
exports.SetActive = SetActive;
function ClaimReward(payerWallet, taskStateInfoAddress, stakePotAccount, beneficiaryAccount, claimerKeypairPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const claimerKeypair = yield (0, utils_1.createKeypairFromFile)(claimerKeypairPath);
        const data = encodeData(TASK_INSTRUCTION_LAYOUTS.ClaimReward, {});
        const instruction = new web3_js_1.TransactionInstruction({
            keys: [
                { pubkey: taskStateInfoAddress, isSigner: false, isWritable: true },
                { pubkey: claimerKeypair.publicKey, isSigner: true, isWritable: true },
                { pubkey: stakePotAccount, isSigner: false, isWritable: true },
                { pubkey: beneficiaryAccount, isSigner: false, isWritable: true },
            ],
            programId,
            data: data,
        });
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, new web3_js_1.Transaction().add(instruction), [payerWallet, claimerKeypair]);
    });
}
exports.ClaimReward = ClaimReward;
function FundTask(payerWallet, taskStateInfoAddress, stakePotAccount, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = encodeData(TASK_INSTRUCTION_LAYOUTS.FundTask, {
            amount,
        });
        const funderKeypair = web3_js_1.Keypair.generate();
        console.log("Making new account", funderKeypair.publicKey.toBase58());
        const createSubmitterAccTransaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: payerWallet.publicKey,
            newAccountPubkey: funderKeypair.publicKey,
            lamports: amount +
                (yield connection.getMinimumBalanceForRentExemption(100)) +
                1000,
            space: 100,
            programId: programId,
        }));
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, createSubmitterAccTransaction, [
            payerWallet,
            funderKeypair,
        ]);
        const instruction = new web3_js_1.TransactionInstruction({
            keys: [
                { pubkey: taskStateInfoAddress, isSigner: false, isWritable: true },
                { pubkey: funderKeypair.publicKey, isSigner: true, isWritable: true },
                { pubkey: stakePotAccount, isSigner: false, isWritable: true },
                { pubkey: SYSTEM_PUBLIC_KEY, isSigner: false, isWritable: false },
                { pubkey: CLOCK_PUBLIC_KEY, isSigner: false, isWritable: false },
            ],
            programId,
            data: data,
        });
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, new web3_js_1.Transaction().add(instruction), [payerWallet, funderKeypair]);
    });
}
exports.FundTask = FundTask;
function getStakePotAccount() {
    let pubkey;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const keypair = new web3_js_1.Keypair();
            let pubkeyString = keypair.publicKey.toBase58();
            pubkeyString = pubkeyString.replace(pubkeyString.substring(0, 15), "stakepotaccount");
            pubkey = new web3_js_1.PublicKey(pubkeyString);
            if (web3_js_1.PublicKey.isOnCurve(pubkey.toBytes())) {
                break;
            }
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    }
    return pubkey;
}
function Withdraw(payerWallet, taskStateInfoAddress, submitterKeypair) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = encodeData(TASK_INSTRUCTION_LAYOUTS.Withdraw, {});
        const instruction = new web3_js_1.TransactionInstruction({
            keys: [
                { pubkey: taskStateInfoAddress, isSigner: false, isWritable: true },
                { pubkey: submitterKeypair.publicKey, isSigner: true, isWritable: true },
                { pubkey: CLOCK_PUBLIC_KEY, isSigner: false, isWritable: false },
            ],
            programId,
            data: data,
        });
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, new web3_js_1.Transaction().add(instruction), [payerWallet, submitterKeypair]);
    });
}
exports.Withdraw = Withdraw;