# SSI - Self Sovereign Identity Application

A web application dashboard utilising Trinsic APIS to faciliate interactions with Hyperledger Indy using Hyperledger Aries

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


https://user-images.githubusercontent.com/7840952/158397633-06077373-23e5-4f6c-a5e4-1459e9a3356d.mp4


# Requirements
1. Installation 
of Nodejs version 12: https://github.com/nvm-sh/nvm
2. Generate an Access Token from by creating user account on Trinsic Studio https://studio.trinsic.id/SignUp and creating a new Provider Organisation https://docs.trinsic.id/docs <img width="1889" alt="image" src="https://user-images.githubusercontent.com/7840952/158523701-723ea1fc-5db5-4680-8a66-f0031201c73d.png">
3. Rename file .env-template to .env and insert Access Token value into PROVIDER_TOKEN
4. _Optional_: but maybe neccessary if credential id or policy id not found under Provider API key domain. Create a credential and verification policy through Trinsic Studio containing attribute _name_ and _email_ and place those ids in the .env file under CRED_DEF_ID and POLICY_ID

# Setup 

In terminal/command line from root directory of this project folder:

1. npm install 
2. npm run start
3. Navigate to http://localhost:80 on web browser
