import {TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Account, Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { rawListeners } from "process";
import { SDFI_ACCOUNT_DATA_LAYOUT, SDFILayout } from "./layout sdfi";

const connection = new Connection("http://localhost:8899", 'singleGossip');

export const initSDFI = async (

    amunPrivateKeyByteArray: string,
    sdfiMintPubKeyString: string,
    sdfiProgramIdString: string,
    tokenAPubKeyString: string,
    tokenBPubKeyString: string,
    tokenAweight: number,
    tokenBWeight: number,
) => {

    // amun main account
    const amunPrivateKey = amunPrivateKeyByteArray.split(',').map(s=>parseInt(s));
    const amunAccount = new Account(amunPrivateKey);
    console.log("amunAccount: {}", amunAccount.publicKey.toString());
    
    // Accounts Public Keys
    const sdfiMintPubKey = new PublicKey(sdfiMintPubKeyString);
    const tokenAPubkey = new PublicKey(tokenAPubKeyString);
    const tokenBPubkey = new PublicKey(tokenBPubKeyString);

    console.log("sdfiMintPubKey: {}", sdfiMintPubKey.toString())
    
    // Create SDFI state accoount
    const sdfiStateAccount = new Account();
    console.log("sdfiStateAccount: {}", sdfiStateAccount.publicKey.toString())

    // Program ID
    const sdfiProgramId = new PublicKey(sdfiProgramIdString);
    console.log("sdfiProgramId: {}", sdfiProgramId.toString())

    // Create Sdfi State account instruction
    console.log("instruction for SDFI state account creation")
    const createSDFIAccountIx = SystemProgram.createAccount({
        space: SDFI_ACCOUNT_DATA_LAYOUT.span,
        lamports: await connection.getMinimumBalanceForRentExemption(SDFI_ACCOUNT_DATA_LAYOUT.span, 'singleGossip'),
        fromPubkey: amunAccount.publicKey,
        newAccountPubkey: sdfiStateAccount.publicKey,
        programId: sdfiProgramId
    });

    // Initialize SDFI state account
    console.log("Instruction for SDFI state account initialization")
    const initSDFIIx = new TransactionInstruction({
        programId: sdfiProgramId,
        keys: [
            { pubkey: amunAccount.publicKey, isSigner: true, isWritable: false },
            { pubkey: sdfiMintPubKey, isSigner: false, isWritable: true },
            { pubkey: sdfiStateAccount.publicKey, isSigner: false, isWritable: true },
            { pubkey: tokenAPubkey, isSigner: false, isWritable: true },
            { pubkey: tokenBPubkey, isSigner: false, isWritable: true },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false},
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: Buffer.from(Uint8Array.of(0, 
            ...new BN(tokenAweight).toArray("le", 8),
            ...new BN(tokenBWeight).toArray("le", 8)))
    })
    
    // Merge instructions into a transaction
    console.log("Transaction init")
    const tx = new Transaction()
        .add(createSDFIAccountIx, initSDFIIx);
    
    // Send the transaction
    console.log("Send transaction")
    await connection.sendTransaction(tx, [amunAccount, sdfiStateAccount], {skipPreflight: false, preflightCommitment: 'singleGossip'});
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Request data from the SDFI state program
    console.log("Request SDFI state info")
    const encodedSDFIState = (await connection.getAccountInfo(sdfiStateAccount.publicKey, 'singleGossip'))!.data;
    const decodedSDFIState = SDFI_ACCOUNT_DATA_LAYOUT.decode(encodedSDFIState) as SDFILayout;
    
    return {
        sdfiAccountPubkey: sdfiStateAccount.publicKey.toBase58(),
        isInitialized: !!decodedSDFIState.isInitialized,
        initializerAccountPubkey: new PublicKey(decodedSDFIState.initializerPubkey).toBase58(),
        tokenAPubkey: new PublicKey(decodedSDFIState.tokenAPubkey).toBase58(),
        tokenBPubkey: new PublicKey(decodedSDFIState.tokenBPubkey).toBase58(),
        tokenAWeight: new BN(decodedSDFIState.tokenAWeight, 10, "le").toNumber(),
        tokenBWeight: new BN(decodedSDFIState.tokenBWeight, 10, "le").toNumber(),
    };
}
