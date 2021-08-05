import * as splToken from "@solana/spl-token";
import { Keypair, Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { SDFI_ACCOUNT_DATA_LAYOUT, SDFILayout } from "./layout sdfi";

const connection = new Connection("http://localhost:8899", 'singleGossip');

export const mintSDFI = async (

    userPrivateKeyByteArray: string,
    sdfiProgramIdString: string,
    sdfiAccountPubkeyString: string,
    amount: number,
) => {

    // User main account
    const userPrivateKey = userPrivateKeyByteArray.split(',').map(s=>parseInt(s));
    const userPrivateKeyUint8 = new Uint8Array(userPrivateKey);
    const userAccount = Keypair.fromSecretKey(userPrivateKeyUint8);
    console.log("userAccount: {}", userAccount.publicKey.toString());
    
    // Program ID PubKey
    const sdfiProgramId = new PublicKey(sdfiProgramIdString);
    console.log("sdfiProgramId: {}", sdfiProgramId.toString())

    // Decode SDFI state account
    const sdfiAccountPubkey = new PublicKey(sdfiAccountPubkeyString);
    let encodedState;
    try {
        encodedState = (await connection.getAccountInfo(sdfiAccountPubkey, 'singleGossip'))!.data;
    } catch (err) { throw new Error("Could not find accountInfo at given address!")}
    const decodedSdfiLayout = SDFI_ACCOUNT_DATA_LAYOUT.decode(encodedState) as SDFILayout; 

    // Get Amun Pubkey
    let amunPubkey = new PublicKey(decodedSdfiLayout.initializerPubkey);

    // Underlyings mint state accounts
    let tokenAPubkey = new PublicKey(decodedSdfiLayout.tokenAPubkey);
    let tokenBPubkey = new PublicKey(decodedSdfiLayout.tokenBPubkey);
    
    let mint_a = new splToken.Token(
        connection, 
        tokenAPubkey, 
        splToken.TOKEN_PROGRAM_ID,
        userAccount
    );
    let mint_b = new splToken.Token(
        connection, 
        tokenBPubkey, 
        splToken.TOKEN_PROGRAM_ID,
        userAccount
    );
    let mint_sdfi = new splToken.Token(
        connection, 
        sdfiAccountPubkey, 
        splToken.TOKEN_PROGRAM_ID,
        userAccount
    );

    // Associated addresses for each underlyings and SDFI
    let userAssociatedAccountA = await mint_a.getOrCreateAssociatedAccountInfo(userAccount.publicKey);
    let userAssociatedAccountB = await mint_b.getOrCreateAssociatedAccountInfo(userAccount.publicKey);
    let userAssociatedAccountSdfi = await mint_sdfi.getOrCreateAssociatedAccountInfo(userAccount.publicKey);
    
    let amunAssociatedAccountA = await mint_b.getOrCreateAssociatedAccountInfo(amunPubkey);
    let amunAssociatedAccountB = await mint_b.getOrCreateAssociatedAccountInfo(amunPubkey);
    let amunAssociatedAccountSdfi = await mint_sdfi.getOrCreateAssociatedAccountInfo(amunPubkey);
    
    // Instruction
    console.log("Instruction for SDFI minting")
    const mintSDFIIx = new TransactionInstruction({   
        programId: sdfiProgramId,
        keys: [
            { pubkey: userAccount.publicKey, isSigner: true, isWritable: false },
            { pubkey: sdfiAccountPubkey, isSigner: false, isWritable: true },
            { pubkey: amunAssociatedAccountA.address, isSigner: false, isWritable: false },
            { pubkey: amunAssociatedAccountB.address, isSigner: false, isWritable: false },
            { pubkey: amunAssociatedAccountSdfi.address, isSigner: false, isWritable: false },
            { pubkey: userAssociatedAccountA.address, isSigner: false, isWritable: false },
            { pubkey: userAssociatedAccountB.address, isSigner: false, isWritable: false },
            { pubkey: userAssociatedAccountSdfi.address, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false},
            { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: Buffer.from(Uint8Array.of(2, 
            ...new BN(amount).toArray("le", 8)))
    })
    
    // Transaction
    console.log("Transaction mint")
    const tx = new Transaction()
        .add(mintSDFIIx);
    
    // Send the transaction
    console.log("Send transaction")
    await connection.sendTransaction(tx, [userAccount], {skipPreflight: false, preflightCommitment: 'singleGossip'});
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
}
