# SSI - Self Sovereign Identity Application

A web application dashbboard utilising Trinsic APIS to faciliate interactions with Hyperledger Indy using Hyperledger Aries

Some of the operations included in the dashboard are:
1. Create wallet
2. Create invitation - create connection for wallet from issuer
3. Accept invitation - insert wallet id and connection id on wallet owner side
4. Create login credential from issuer side - insert user details for credential
5. Accept credential on wallet owner side - insert credential offer url and wallet id
6. View credential in wallet owner - show details captured
7. Verify login credential from issuer side - select connection id and policy id, view request in log
8. View verifications on wallet owner side - accept verification
9. Test using mobile scanning code and showing list of wallets

# Requirements
Installation of Nodejs version 12: https://github.com/nvm-sh/nvm

# Setup - from terminal/command line root directory of this project folder
1. npm install 
2. npm run start
