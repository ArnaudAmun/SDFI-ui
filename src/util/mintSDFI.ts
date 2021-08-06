import * as splToken from "@solana/spl-token";
import { Keypair, Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import { SDFI_ACCOUNT_DATA_LAYOUT, SDFILayout } from "./layout sdfi";

const connection = new Connection("http://localhost:8899", 'singleGossip');

export const mintSDFI = async (

    userPrivateKeyByteArray: string,
    sdfiProgramIdString: string,
    sdfiMintPubkeyString: string,
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

    // Sdfi mint Pubkey
    let sdfiMintPubkey = new PublicKey(sdfiMintPubkeyString);

    // Underlyings mint state accounts
    let tokenAPubkey = new PublicKey(decodedSdfiLayout.tokenAPubkey);
    let tokenBPubkey = new PublicKey(decodedSdfiLayout.tokenBPubkey);

    console.log("Token")
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
        sdfiMintPubkey, 
        splToken.TOKEN_PROGRAM_ID,
        userAccount
    );

    // Mint decimals
    let mint_decimals_a = (await mint_a.getMintInfo()).decimals;
    let mint_decimals_b = (await mint_b.getMintInfo()).decimals;
    let mint_decimals_sdfi = (await mint_sdfi.getMintInfo()).decimals;

    // Associated addresses for each underlyings and SDFI
    let userAssociatedAccountA = await mint_a.getOrCreateAssociatedAccountInfo(userAccount.publicKey);
    console.log("user Associated Account A: ", userAssociatedAccountA.address.toString());

    let userAssociatedAccountB = await mint_b.getOrCreateAssociatedAccountInfo(userAccount.publicKey);
    console.log("user Associated Account B: ", userAssociatedAccountB.address.toString());

    let userAssociatedAccountSdfi = await mint_sdfi.getOrCreateAssociatedAccountInfo(userAccount.publicKey);
    console.log("user Associated Account SDFI: ", userAssociatedAccountSdfi.address.toString());
    
    let amunAssociatedAccountA = await mint_a.getOrCreateAssociatedAccountInfo(amunPubkey);
    console.log("amun Associated Account A: ", amunAssociatedAccountA.address.toString());

    let amunAssociatedAccountB = await mint_b.getOrCreateAssociatedAccountInfo(amunPubkey);
    console.log("amun Associated Account B: d", amunAssociatedAccountB.address.toString());

    // Get PDA Pubkey
    const PDA = await PublicKey.findProgramAddress([Buffer.from("escrow")], sdfiProgramId);

    // Instruction
    console.log("Instruction for SDFI minting")
    const mintSDFIIx = new TransactionInstruction({   
        programId: sdfiProgramId,
        keys: [
            { pubkey: userAccount.publicKey, isSigner: true, isWritable: false },
            { pubkey: sdfiMintPubkey, isSigner: false, isWritable: true },
            { pubkey: sdfiAccountPubkey, isSigner: false, isWritable: true },
            { pubkey: amunAssociatedAccountA.address, isSigner: false, isWritable: true },
            { pubkey: amunAssociatedAccountB.address, isSigner: false, isWritable: true },
            { pubkey: userAssociatedAccountA.address, isSigner: false, isWritable: true },
            { pubkey: userAssociatedAccountB.address, isSigner: false, isWritable: true },
            { pubkey: userAssociatedAccountSdfi.address, isSigner: false, isWritable: true },
            { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: PDA[0], isSigner: false, isWritable: false },
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
