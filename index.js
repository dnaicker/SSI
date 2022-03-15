var express = require("express");
var mongoose = require("mongoose");
const port = 80;
const app = express();
const {
	CredentialsServiceClient,
	ProviderServiceClient,
	WalletServiceClient,
	Credentials,
	ProviderCredentials
} = require("@trinsic/service-clients");

// the credential definition and policy id is on a different api key organisation, so might need to be updated
const apiKey = "UJFgZPUcoBuAbtwKTjaIWUXgCNZTrFV29j-ejYSc5Ws";
const CRED_DEF_ID = "5TUNXBbn1pW79GDujbchdK:3:CL:278230:Default";
const POLICY_ID = "129b779a-c5af-44a5-0999-08d9dc1ce5e9";
const PROVIDER_TOKEN = "r44O1oxWkI3pkcUlIcIsH1uuCQdo8KmXMQ9OpGzqNww";
const request = require('request')

// Credentials API
const credentialsClient = new CredentialsServiceClient(
	new Credentials(PROVIDER_TOKEN), { noRetryPolicy: true }
);

// Provider API
const providerClient = new ProviderServiceClient(
	new ProviderCredentials(PROVIDER_TOKEN), { noRetryPolicy: true }
);

// Wallet API
const walletClient = new WalletServiceClient(
	new Credentials(PROVIDER_TOKEN), { noRetryPolicy: true }
);

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
	res.set({
		"Allow-access-Allow-Origin": "*",
	});

	return res.redirect("credential.html");
});

app.get("/wallet", (req, res) => {
	return res.redirect("wallet.html");
});

app.get("/provider", (req, res) => {
	return res.redirect("wallet.html");
});

app.get("/credential", (req, res) => {
	return res.redirect("credential.html");
});

// -------------- Credential

// Create Invitation
app.post("/createConnectionInvitation", async (req, res) => {
	res.header('Content-Type', 'application/json');
	try {
		// todo make credential definition id dynamic:
		let result = await credentialsClient.createConnection({
		  name: null,
		  connectionId: null,
		  multiParty: false
		});
		return res.status(200).send(JSON.stringify({ message: "createConnectionInvitation processed successfully", result: result }));
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "createConnectionInvitation error", error: stringifyError(error, null, '\t') });
	}
})

// Accept Invitation
app.post("/acceptConnectionInvitation", async (req, res) => {
	console.log("acceptConnectionInvitation")
	res.header('Content-Type', 'application/json');
	try {
		let result = await walletClient.acceptInvitation(req.body.walletId, req.body.invitationUrl);
		return res.status(200).send(JSON.stringify({ message: "acceptConnectionInvitation processed successfully", result: result }));
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "acceptConnectionInvitation error", error: error});
	}
})

// Create Credential
app.post("/createCredential", async (req, res) => {
	try {
		// todo make credential definition id dynamic:
		let result = await credentialsClient.createCredential({
			definitionId: CRED_DEF_ID,
			automaticIssuance: true,
			credentialValues: {
				"Email": req.body.email,
				"Full name": req.body.fullname
			}
		});
		res.header('Content-Type', 'application/json');
		return res.status(200).send(JSON.stringify({ message: "createCredential processed successfully", result: result }));
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "createCredential error", error: stringifyError(error, null, '\t') });
	}
})

// Create Verification
app.post("/createVerification", async (req, res) => {
	try {
		let verification = await credentialsClient.createVerificationFromPolicy(POLICY_ID);

		console.log("createVerification processed successfully", verification)
		return res.status(200).send({
			message: "createVerification processed successfully",
			result: {
				verificationRequestData: verification.verificationRequestData,
				verificationRequestUrl: verification.verificationRequestUrl,
				verificationId: verification.verificationId
			}
		});
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "createVerification error", error: error });
	}
})

// Create Verification
app.post("/deleteVerification", async (req, res) => {
	try {
		let verification = await walletClient.deleteVerification(req.body.walletId, req.body.verificationId);

		console.log("deleteVerification processed successfully", verification)
		return res.status(200).send({
			message: "createVerification processed successfully",
			result: verification
		});
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "deleteVerification error", error: error });
	}
})

// Get Verify Credential
app.post("/getVerification", async (req, res) => {
	try {
		let verificationId = req.body.verificationId;
		let verification = await credentialsClient.getVerification(verificationId);

		console.log("getVerification processed successfully", verification)
		return res.status(200).send({ message: "getVerification processed successfully", result: verification });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "getVerification error", error: error });
	}
})

// List Credentials
app.get("/listCredentials", async (req, res) => {
	try {
		let credentials = await walletClient.listCredentialsForConnectionId(req.body.walletId, req.body.connectionId);
		console.log("listCredentials processed successfully", credentials)
		return res.status(200).send({ message: "listCredentials processed successfully", result: credentials });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listCredentials error", error: error });
	}
})

// List Credentials
app.post("/listCredentialsForWalletId", async (req, res) => {
	try {
		let credentials = await walletClient.listCredentials(req.body.walletId);
		console.log("listCredentialsForWalletId processed successfully", credentials)
		return res.status(200).send({ message: "listCredentialsForWalletId processed successfully", result: credentials });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listCredentialsForWalletId error", error: error });
	}
})

// -------------- Organisation

// Create Organisation
app.post("/createOrganisation", async (req, res) => {
	try {
		let organisation = await providerClient.createTenant({
			name: req.body.name,
			imageUrl: req.body.imageUrl,
			networkId: req.body.networkId,
			endorserType: req.body.endorserType,
			region: "UnitedStates"
		});
		console.log("createProvider processed successfully", organisation)
		return res.status(200).send({ message: "createOrganisation processed successfully", result: organisation });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "createOrganisation error", error: error });
	}
})

// Delete Organisation
app.post("/deleteOrganisation", async (req, res) => {
	try {
		console.log(req.body.tenantId);
		let organisation = await providerClient.deleteTenant(req.body.tenantId);
		console.log("deleteOrganisation processed successfully", organisation)
		return res.status(200).send({ message: "deleteOrganisation processed successfully", result: organisation });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "deleteOrganisation error", error: error });
	}
})

// Get Organisation
app.post("/getOrganisation/:organisationId", async (req, res) => {
	try {
		let organisation = await providerClient.getTenantKeys(req.params.organisationId);
		console.log("getOrganisation processed successfully", organisation)
		return res.status(200).send({ message: "getOrganisation processed successfully", result: organisation });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "getOrganisation error", error: error });
	}
})

// List Organisations
app.get("/listOrganisations", async (req, res) => {
	try {
		let organisations = await providerClient.listTenants();
		console.log("listOrganisations processed successfully", organisations)
		return res.status(200).send({ message: "listOrganisations processed successfully", result: organisations });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listOrganisations error", error: error });
	}
})

// Update Organisations Keys
app.get("/changeOrganisationKey/:organisationId", async (req, res) => {
	try {
		let result = await providerClient.changeTenantKeys(req.params.organisationId);
		console.log("changeOrganisationKey processed successfully", result)
		return res.status(200).send({ message: "changeOrganisationKey processed successfully", result: result });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "changeOrganisationKey error", error: error });
	}
})

// -------------- Wallet

// Create Wallet
app.post("/createWallet", async (req, res) => {
	try {
		let ownerName = req.body.ownerName || null; // Can be null
		let walletId = req.body.walletId || null; // Can be null
		let result = await walletClient.createWallet({
			ownerName: ownerName,
			walletId: walletId
		});

		console.log("createWallet processed successfully", result)
		return res.status(200).json({ message: "createWallet processed successfully", result: result });
	} catch (error) {
		console.log(error);
		res.header('Content-Type', 'application/json');
		return res.status(400).send(JSON.stringify({ message: "createWallet error", error: error }));
	}
})

// List Wallets
app.get("/listWallets", async (req, res) => {
	try {
		let wallets = await walletClient.listWallets();
		console.log("listWallets processed successfully", wallets)
		return res.status(200).send({ message: "listWallets processed successfully", result: wallets });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listWallets error", error: error });
	}
})

// deletes a wallet by the ID
app.post('/deleteWallet', async function(req, res) {
	try {
		console.log(req.body)
		const walletId = req.body.walletId
		const response = await walletClient.deleteWallet(walletId)
		res.status(200).send({ message: "deleteWallet processed successfully"});
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "deleteWallet error", error: error });
	}
})

// returns all the credentials for a given wallet and connection id
app.get('/listCredentialsForConnection', async function(req, res) {
	try {
		const response = await walletClient.ListCredentialsForConnectionIdAsync(req.body.walletId, req.body.connectionId)
		res.status(200).send({ message: "listCredentialsForConnection processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listCredentialsForConnection error", error: error });
	}
})

// returns all the verifications for a given wallet
app.get('/listVerifications', async function(req, res) {
	try {
		const response = await walletClient.listVerifications(req.body.walletId)
		res.status(200).send({ message: "listVerifications processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listVerifications error", error: error });
	}
})

// returns a single credential in a given wallet
app.get('/getCredential', async function(req, res) {
	try {
		const response = await walletClient.getCredential(req.body.walletId, req.body.credentialId)
		console.log(response)
		res.status(200).send({ message: "getCredential processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "getCredential error", error: error });
	}
})

// returns a single credential in a given wallet
app.post('/deleteCredential', async function(req, res) {
	try {
		const response = await walletClient.deleteCredential(req.body.walletId, req.body.credentialId)
		console.log(response)
		res.status(200).send({ message: "deleteCredential processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "deleteCredential error", error: error });
	}
})

// resolves the connection invite link to accept a connection 
app.post('/acceptConnection', async function(req, res) {
	const inviteUrl = req.body.inviteUrl
	const walletId = req.body.walletId
	try {
		request(inviteUrl, (err, response, body) => {
			if (response) {
				console.log(response)
				const urlParams = url.parse(response.request.href, true).query
				const urlData = urlParams.d_m
				console.log(urlData)
				walletClient.acceptInvitation(walletId, urlData)
					.then(con => console.log(con))
					.then(connection => res.status(200).send(connection))
			} else {
				console.log('error')
				res.sendStatus(400)
			}
		})
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "acceptConnection error", error: error });
	}
})

// accepts a new  credential
app.post('/acceptCredential', async function(req, res) {
	try {
		const response = await walletClient.acceptCredential(req.body.walletId, req.body.credentialData)
		console.log(response);
		res.status(200).send({ message: "acceptCredential processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "acceptCredential error", error: error });
	}
})

// returns current connections
app.post('/listConnections', async function(req, res) {
	try {
		console.log(req.body.walletId);
		const response = await walletClient.listConnections(req.body.walletId)
		console.log(response);
		res.status(200).send({ message: "listConnections processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listConnections error", error: error });
	}
})

// returns current connections
app.post('/listInvitations', async function(req, res) {
	try {
		const response = await walletClient.listInvitations(req.body.walletId)
		console.log(response);
		res.status(200).send({ message: "listInvitations processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listInvitations error", error: error });
	}
})

// returns current connections
app.post('/listVerificationsForConnection', async function(req, res) {
	try {
		const response = await walletClient.listVerificationsForConnection(req.body.walletId, req.body.connectionId)
		console.log(response);
		res.status(200).send({ message: "listVerificationsForConnection processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listVerificationsForConnection error", error: error });
	}
})

// returns possible credentials for a verification
app.post('/listAvailableCredentials', async function(req, res) {
	try {
		const response = await walletClient.getAvailableCredentialsForVerification(req.body.walletId, req.body.verificationId)
		console.log(response);
		res.status(200).send({ message: "listAvailableCredentials processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listAvailableCredentials error", error: error });
	}
})

// completes a verification request by auto selecting a credential that meets the requirements
app.post('/submitVerificationAutoSelect', async function(req, res) {
	try {
		const response = await walletClient.submitVerificationAutoSelect(req.body.walletId, req.body.verificationId)
		console.log(response);
		res.status(200).send({ message: "submitVerificationAutoSelect processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "submitVerificationAutoSelect error", error: error });
	}
})

// completes a verification request by auto selecting a credential that meets the requirements
app.post('/submitVerificationToConnectionFromPolicyId', async function(req, res) {
	try {
		const response = await credentialsClient.sendVerificationFromPolicy(req.body.connectionId, req.body.policyId)
		console.log(response);
		res.status(200).send({ message: "submitVerificationToConnectionFromPolicyId processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "submitVerificationToConnectionFromPolicyId error", error: error });
	}
})

// list all connections for issuer
app.post('/listAllConnectionsForCredentialIssuer', async function(req, res) {
	try {
		let state = req.body.state || null;
		console.log(state)
		const response = await credentialsClient.listConnections(state)

		let arr = response.filter((item)=> {
			return item.state === "Connected"
		})

		console.log(arr);

		res.status(200).send({ message: "listAllConnectionsForCredentialIssuer processed successfully", result: arr });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listAllConnectionsForCredentialIssuer error", error: error });
	}
})

// list all policies for issuer
app.get('/listAllPoliciesForCredentialIssuer', async function(req, res) {
	try {
		let state = req.body.state || null;
		const response = await credentialsClient.listVerificationPolicies()
		console.log(response);
		res.status(200).send({ message: "listAllPoliciesForCredentialIssuer processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listAllPoliciesForCredentialIssuer error", error: error });
	}
})

// list all policies for issuer
app.get('/listVerificationsIssuer', async function(req, res) {
	try {
		const response = await credentialsClient.listVerifications()
		console.log(response);
		res.status(200).send({ message: "listVerificationsIssuer processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "listVerificationsIssuer error", error: error });
	}
})

// list all policies for issuer
app.post('/deleteVerificationIssuer', async function(req, res) {
	try {
		const response = await credentialsClient.deleteVerification(req.body.verificationId)
		console.log(response);
		res.status(200).send({ message: "deleteVerificationIssuer processed successfully", result: response });
	} catch (error) {
		console.log(error)
		return res.status(400).send({ message: "deleteVerificationIssuer error", error: error });
	}
})

// -----------------------------------
app.listen(port, () => {
	console.log(`The application started successfully on port ${port}`);
});

const stringifyError = function(err, filter, space) {
	var plainObject = {};
	Object.getOwnPropertyNames(err).forEach(function(key) {
		plainObject[key] = err[key];
	});
	return JSON.stringify(plainObject, filter, space);
};