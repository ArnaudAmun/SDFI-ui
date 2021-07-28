# escrow-ui

UI used in [this guide](https://paulx.dev/2021/01/14/programming-on-solana-an-introduction)

# SDFI-ui

This UI aims at testing the Solana_DFI_Program git repo.

# Addresses creation

1. Go to [https://www.sollet.io/](https://www.sollet.io/) to create the initializer's wallet and user's wallet
2. Go to [https://www.spl-token-ui.com/](https://www.spl-token-ui.com/) to manually create SDFI, Token A and Token B mint addresses in Token / New token
3. Create user's Token A and B addresses in account / create account
4. Mint some amounts of both token to the user's address in account / edit account

# Running the UI

1. ```npm install```
2. ```npm run serve```
3. Go to [http://localhost:8080/](http://localhost:8080/)
4. SDFI initialization on main page
5. SDFI update underlyings on [http://localhost:8080/#/update](http://localhost:8080/#/update)
6. Minting in progress
7. Burning in progress

# Remarks
After SDFI initialization, write done the SDFI account address because the initialization cannot be done a second time with the same SDFI mint address due to the fact that the SDFI mint authority has been given to a Program Derived Address (PDA). It will allow future Cross Program invocations during the minting/burning calls where the PDA will sign on behalf of the SDFI mint owner.
