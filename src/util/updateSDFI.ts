import {TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Account, Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { rawListeners } from "process";
import { SDFI_ACCOUNT_DATA_LAYOUT, SDFILayout } from "./layout sdfi";

const connection = new Connection("http://localhost:8899", 'singleGossip');

export const updateSDFI = async (

    amunPrivateKeyByteArray: string,
    sdfiProgramIdString: string,
    sdfiAccountPubkeyString: string,
    tokenAPubKeyString: string,
    tokenBPubKeyString: string,
    tokenAweight: number,
    tokenBWeight: number,
) => {

    // amun main account
    const amunPrivateKey = amunPrivateKeyByteArray.split(',').map(s=>parseInt(s));
    const amunAccount = new Account(amunPrivateKey);
    console.log("amunAccount: {}", amunAccount.publicKey.toString());
    
    // Program ID
    const sdfiProgramId = new PublicKey(sdfiProgramIdString);
    console.log("sdfiProgramId: {}", sdfiProgramId.toString())

    // SDFI state account
    const sdfiAccountPubkey = new PublicKey(sdfiAccountPubkeyString);

    // Accounts Public Keys
    const tokenAPubkey = new PublicKey(tokenAPubKeyString);
    const tokenBPubkey = new PublicKey(tokenBPubKeyString);

    // Update SDFI state account
    console.log("Instruction for SDFI state account initialization")
    const updateSDFIIx = new TransactionInstruction({
        programId: sdfiProgramId,
        keys: [
            { pubkey: amunAccount.publicKey, isSigner: true, isWritable: false },
            { pubkey: sdfiAccountPubkey, isSigner: false, isWritable: true },
            { pubkey: tokenAPubkey, isSigner: false, isWritable: true },
            { pubkey: tokenBPubkey, isSigner: false, isWritable: true },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false},
        ],
        data: Buffer.from(Uint8Array.of(1, 
            ...new BN(tokenAweight).toArray("le", 8),
            ...new BN(tokenBWeight).toArray("le", 8)))
    })
    
    // Transaction
    console.log("Transaction udpate")
    const tx = new Transaction()
        .add(updateSDFIIx);
    
    // Send the transaction
    console.log("Send transaction")
    await connection.sendTransaction(tx, [amunAccount], {skipPreflight: false, preflightCommitment: 'singleGossip'});
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Request data from the SDFI state program
    console.log("Request SDFI state info")
    const encodedSDFIState = (await connection.getAccountInfo(sdfiAccountPubkey, 'singleGossip'))!.data;
    const decodedSDFIState = SDFI_ACCOUNT_DATA_LAYOUT.decode(encodedSDFIState) as SDFILayout;
    
    return {
        sdfiAccountPubkey: sdfiAccountPubkey.toBase58(),
        isInitialized: !!decodedSDFIState.isInitialized,
        initializerAccountPubkey: new PublicKey(decodedSDFIState.initializerPubkey).toBase58(),
        tokenAPubkey: new PublicKey(decodedSDFIState.tokenAPubkey).toBase58(),
        tokenBPubkey: new PublicKey(decodedSDFIState.tokenBPubkey).toBase58(),
        tokenAWeight: new BN(decodedSDFIState.tokenAWeight, 10, "le").toNumber(),
        tokenBWeight: new BN(decodedSDFIState.tokenBWeight, 10, "le").toNumber(),
    };
}
