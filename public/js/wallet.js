const spinner = document.getElementById("spinner");
const spinnerModal = document.getElementById("spinnerModal");

// ---------------
// Load Connection
window.loadVerifications = async function(walletId) {
	let data = [];

	console.log(walletId)

	var $connectionsTable = $('#connectionsTable')

	showVerificationSpinner();

	try {
		let connectionsResponse = await Promise.resolve($.ajax({
			type: 'post',
			url: '/listConnections',
			data: { walletId: walletId },
			dataType: 'json'
		}))

		console.log("listConnections wallet", connectionsResponse.result);

		for (conn in connectionsResponse.result) {
			let verificationsResponse = await Promise.resolve($.ajax({
				type: 'post',
				url: '/listVerificationsForConnection',
				data: { walletId: walletId, connectionId: connectionsResponse.result[conn].connectionId },
				dataType: 'json'
			}))


			for (index in verificationsResponse.result) {
				verificationsResponse.result[index].walletId = walletId
			}

			data.push(verificationsResponse.result);

		}

		console.log(data);

		$connectionsTable.bootstrapTable('destroy').bootstrapTable({
			rowStyle: function(row, index) {
                if (row.state === "Accepted") {
                    return {
                      css: {
                        color: '#A6BC09'
                      }
                    }    
                } else {
                    return {
                      css: {
                        color: '#011F26'
                      }
                    }   
                }
                
            },
			sortName: 'createdAtUtc',
            sortOrder: 'desc',
			data: data[0],
			columns: [
				[{
					title: 'Connection ID',
					field: 'connectionId',
					formatter: function(value, row, index) {
						let arr = []
						arr.push("<u>" + row.connectionId + "</u>")
						return arr.join('');
					}
				}, {
					title: 'Verification ID',
					field: 'verificationId',
					formatter: function(value, row, index) {
						let arr = []
						arr.push("<u>" + row.verificationId + "</u>")
						return arr.join('');
					}
				}, {
					title: 'Policy',
					field: 'policy.name'
				}, {
					title: 'Version',
					field: 'policy.version'
				}, {
					title: 'Time Created',
					field: 'createdAtUtc',
					formatter: function(value, row, index) {
						let arr = [];

						if (!row.createdAtUtc) {
							return arr.join('')
						}

						const date = new Date(row.createdAtUtc);

						arr.push("<span>" + (date.getDate()) + "</span>/")
						arr.push("<span>" + (date.getMonth() + 1) + "</span>/")
						arr.push("<span>" + (date.getFullYear()) + "</span>")
						arr.push("<span> </span>")
                        arr.push("<span>" + (date.getHours()) + "</span>")
                        arr.push("<span>:</span>")
                        arr.push("<span>" + (date.getMinutes()) + "</span>")

						return arr.join('')
					}
				}, {
					title: 'Attributes',
					field: 'policy.attributes',
					formatter: function(value, row, index) {
						let arr = []

						// display restrictions 
						for (item in value) {
							for (key in value[item]) {
								if (key === 'restrictions') {
									for (index in value[item][key][0]) {
										arr.push(index + ": " + value[item][key][index] + ", ");
									}
								} else {
									arr.push(key + ": " + value[item][key] + ", ");
								}
							}
						}

						return arr.join("");
					}
				}, {
					title: 'State',
					field: 'state',
					formatter: function (value, row, index) {
                        let arr = []
                        
                        arr.push(row.state)

                        if (row.state === "Accepted") {
                            arr.push('<i class="fa-solid fa-circle-check" style="color: #A6BC09"></i>')
                        }

                        return arr.join('');
                    }
				}, {
					field: '',
					title: 'Actions',
					align: 'center',
					events: window.connectionsTableEvents,
					formatter: window.connectionsTableFormatter
				}]
			]
		})
	} catch (error) {
		console.log(error);
		showGenericModalContent("Error", error.result)
	}

	hideVerificationSpinner();
}

// ---------------
// Load Wallet
window.loadWallet = async function() {

	var $table = $('#table')

	showSpinner();

	let response = await Promise.resolve($.ajax({
		type: 'get',
		url: '/listWallets',
		data: {},
		dataType: 'json'
	}))

	hideSpinner();

	var data = response.result;

	$table.bootstrapTable('destroy').bootstrapTable({
		data: data,
		columns: [
			[{
				field: 'walletId',
				title: 'Wallet Id',
				formatter: function(value, row) {
					return '<span style="text-decoration-line: underline;">' + value + '</span>';
				}
			}, {
				title: 'Owner',
				field: 'name'
			}, {
				field: '',
				title: 'Actions',
				align: 'center',
				events: window.walletTableEvents,
				formatter: window.walletTableFormatter
			}]
		]
	})
}

$(document).ready(async function() {
	hideSpinnerG("acceptConnectionSpinner");
	hideWalletCreateSpinnerModal();
	hideCredentialSpinnerModal();

	window.loadWallet();
	// todo: load dropdown of wallet id and name

	window.walletTableFormatter = function(value, row, index) {
		return [
			'<a class="listVerifications" href="javascript:void(0)" title="View Verifications Requested" style="padding-right: 15px">',
			'<i class="fa-solid fa-handshake"></i>',
			'</a>',
			'<a class="listCredentials" href="javascript:void(0)" title="View Credentials" style="padding-right: 15px">',
			'<i class="fa-solid fa-id-card"></i>',
			'</a>',
			'<a class="deleteWallet" href="javascript:void(0)" title="Delete Wallet">',
			'<i class="fa fa-trash"></i>',
			'</a>'
		].join('')
	}

	window.connectionsTableFormatter = function(value, row, index) {
		let arr = [];

		if (row.state === "Requested") {
			arr.push('<a class="submitVerification" href="javascript:void(0)" title="Submit Verification">')
			arr.push('<i class="fa-solid fa-circle-check"></i>')
			arr.push('</a>')
		}

		arr.push('<a class="deleteVerification" href="javascript:void(0)" title="Delete Verification">')
		arr.push('<i class="fa-solid fa-trash-can" style="padding-left: 10px"></i>')
		arr.push('</a>')

		return arr.join("");
	}

	window.modalOperateFormatter = function(value, row, index) {
		return [
			'<a class="deleteCredential" href="javascript:void(0)" title="Remove">',
			'<i class="fa fa-trash"></i>',
			'</a>'
		].join('')
	}

	window.modalCredentialIdFormatter = function(value, row, index) {
		let arr = [];

		arr.push("<u>" + row.credentialId + "</u>");

		return arr.join('')
	}

	window.modalValuesFormatter = function(value, row, index) {
		let arr = [];

		for (const key in row.values) {
			arr.push("<span>" + key + ": <i>" + row.values[key] + "</i> , </span>")
		}

		return arr.join('')
	}

	window.modalIssuedTimeFormatter = function(value, row, index) {
		let arr = [];

		if (!row.issuedAtUtc) {
			return arr.join('')
		}

		const date = new Date(row.issuedAtUtc);

		arr.push("<span>" + (date.getDate()) + "</span>/")
		arr.push("<span>" + (date.getMonth() + 1) + "</span>/")
		arr.push("<span>" + (date.getFullYear()) + "</span>")
		arr.push("<span> </span>")
		arr.push("<span>" + (date.getHours()) + "</span>")
		arr.push("<span>:</span>")
		arr.push("<span>" + (date.getMinutes()) + "</span>")

		return arr.join('')
	}

	window.modalAcceptedTimeFormatter = function(value, row, index) {
		let arr = [];

		if (!row.acceptedAtUtc) {
			return arr.join('')
		}

		const date = new Date(row.acceptedAtUtc);

		arr.push("<span>" + (date.getDate()) + "</span>/")
		arr.push("<span>" + (date.getMonth() + 1) + "</span>/")
		arr.push("<span>" + (date.getFullYear()) + "</span>")
		arr.push("<span> </span>")
		arr.push("<span>" + (row.acceptedAtUtc.substring(11, 13)) + "</span>")
		arr.push("<span>:</span>")
		arr.push("<span>" + (row.acceptedAtUtc.substring(14, 16)) + "</span>")

		return arr.join('')
	}

	window.modalOperateEvents = {
		'click .deleteCredential': async function(e, value, row, index) {
			try {
				showSpinnerModal();

				console.log("walletIdSelected", window.walletIdSelected);

				let response = await Promise.resolve($.ajax({
					type: 'post',
					url: '/deleteCredential',
					data: { walletId: window.walletIdSelected, credentialId: row.credentialId },
					dataType: 'json'
				}))

				hideSpinnerModal();

				loadCredentials(window.walletIdSelected);
			} catch (error) {
				hideSpinner();
				console.log(error);
			}
		}
	}

	window.walletTableEvents = {
		'click .deleteWallet': async function(e, value, row, index) {

			showSpinner();

			// delete wallet
			try {
				let response = await Promise.resolve($.ajax({
					type: 'post',
					url: '/deleteWallet',
					data: { walletId: row.walletId },
					dataType: 'json'
				}))

				hideSpinner();

				window.loadWallet();

				document.getElementById("wallet-deleted").innerHTML = "<p> Wallet ID: <u>" + row.walletId + "</u> for owner: <u>" + row.name + "</u> has been deleted. </p>";
				$("#walletDeleteModal").modal();

			} catch (error) {
				hideSpinner();
				console.log(error);
			}
		},
		'click .listCredentials': async function(e, value, row, index) {
			console.log(row);
			// open modal
			$("#myModal").modal()

			showSpinnerModal();

			window.walletIdSelected = row.walletId;

			// acquire credentials based on wallet information
			loadCredentials(row.walletId);
		},
		'click .listVerifications': async function(e, value, row, index) {
			console.log(row);
			// open modal
			$("#verificationsModal").modal()

			// get verifications
			window.loadVerifications(row.walletId);
		}
	}

	window.connectionsTableEvents = {
		'click .submitVerification': async function(e, value, row, index) {
			showVerificationSpinner();
			try {
				let response = await Promise.resolve($.ajax({
					type: 'post',
					url: '/submitVerificationAutoSelect',
					data: { walletId: row.walletId, verificationId: row.verificationId },
					dataType: 'json'
				}))

				console.log(response)

				// reload table
				window.loadVerifications(row.walletId);

			} catch (error) {
				console.log(error)
			}

			hideVerificationSpinner();
		},
		'click .deleteVerification': async function(e, value, row, index) {
			showVerificationSpinner();
			console.log('deleteVerification')
			try {
				let response = await Promise.resolve($.ajax({
					type: 'post',
					url: '/deleteVerification',
					data: { walletId: row.walletId, verificationId: row.verificationId },
					dataType: 'json'
				}))

				console.log(response)

				// reload table
				window.loadVerifications(row.walletId);
			} catch (error) {
				console.log(error)
			}
			hideVerificationSpinner();

		}
	}
});

$("#accept-connection-invitation").on("click", async function(e) {
	e.preventDefault();

	formValidationCheck('acceptConnectionForm')

	const walletId = document.getElementById("connectionWalletId").value;
	const invitationUrl = document.getElementById("connectionInvitationUrl").value;

	console.log(walletId, invitationUrl)

	showSpinnerG("acceptConnectionSpinner")

	try {
		let response = await Promise.resolve($.ajax({
			type: 'post',
			url: '/acceptConnectionInvitation',
			data: { walletId: walletId, invitationUrl: invitationUrl },
			dataType: 'json'
			}))

			console.log(response);

			// show modal
			showGenericModalContent("Invitation Accepted!", "Wallet <u>" + walletId + "</u> has been successfully connected to Issuer and can now be sent credentials to be stored in wallet.")
	} catch(error) {
		console.log(error)
			showGenericModalContent("Error", JSON.parse(error.responseJSON.error.response.body).error)
	}

	hideSpinnerG("acceptConnectionSpinner")

})

$("#accept-credential").on("click", async function(e) {
	e.preventDefault();

	// validate if input fields have values
	formValidationCheck('acceptCredentialForm')

	const credentialOfferUrl = document.getElementById("credentialOfferUrl").value;
	const credentialWalletId = document.getElementById("credentialWalletId").value;

	// show spinner for credentials
	showCredentialSpinnerModal();

	try {
		let response = await Promise.resolve($.ajax({
			type: 'post',
			url: '/acceptCredential',
			data: { walletId: credentialWalletId, credentialData: credentialOfferUrl },
			dataType: 'json'
		}))

		// hide spinner
		hideCredentialSpinnerModal();

		// update text in modal credential id issued to wallet id
		// show modal
		document.getElementById("credential-issued-title").innerText = "Credential linked to Wallet";
		document.getElementById("credential-issued").innerHTML = "<p> Credential ID: <u>" + response.result.credentialId + "</u> has been issued to Wallet ID: <u>" + credentialWalletId + "</u></p>";
		$("#credentialIssuedModal").modal()

	} catch (error) {
		// hide spinner
		hideCredentialSpinnerModal();
		console.log(error);

		let errorResponse = JSON.parse(error.responseText)

		document.getElementById("credential-issued").innerHTML = "Please enter a valid <u>Offer URL</u> and <u>Wallet ID</u>";
		document.getElementById("credential-issued-title").innerText = "Error";
		$("#credentialIssuedModal").modal()

	}
})

$("#create-wallet").on("click", async function(e) {
	e.preventDefault();

	// validate if input fields have values
	const walletCreationForm = document.getElementById('walletCreationForm')
	walletCreationForm.classList.add('was-validated');
	if (walletCreationForm.checkValidity() === false) {
		return;
	}

	const ownerName = document.getElementById("walletName").value;
	const walletId = null; // an autogenerated will be provided

	showWalletCreateSpinnerModal();

	try {
		let response = await Promise.resolve($.ajax({
			type: 'post',
			url: '/createWallet',
			data: { walletId: walletId, ownerName: ownerName },
			dataType: 'json'
		}))


		hideWalletCreateSpinnerModal();

		$("#walletCreatedModal").modal()
		document.getElementById("wallet-created").innerHTML = "<p> New Wallet ID has been created: <u>" + response.result.walletId + "</u> for owner <u>" + response.result.name + "</u></p>";

		window.loadWallet();
	} catch (error) {
		console.log(error);
	}
})

async function loadCredentials(walletId) {
	try {
		showSpinnerModal();

		let response = await Promise.resolve($.ajax({
			type: 'post',
			url: '/listCredentialsForWalletId',
			data: { walletId: walletId },
			dataType: 'json'
		}))

		hideSpinnerModal();

		var $walletTable = $('#walletTable')

		// todo: add accept credential action to show if pending, hide action if credential is in issued state
		$walletTable.bootstrapTable('destroy').bootstrapTable({
			data: response.result,
			columns: [
				[{
					field: 'credentialId',
					title: 'Credential ID',
					formatter: window.modalCredentialIdFormatter
				}, {
					field: 'state',
					title: 'State'
				}, {
					field: 'values',
					title: 'Values',
					formatter: window.modalValuesFormatter
				}, {
					field: 'issuedAtUtc',
					title: 'Date Issued',
					formatter: window.modalIssuedTimeFormatter
				}, {
					field: 'acceptedAtUtc',
					title: 'Date Accepted',
					formatter: window.modalAcceptedTimeFormatter
				}, {
					field: '',
					title: 'Actions',
					align: 'center',
					events: window.modalOperateEvents,
					formatter: modalOperateFormatter
				}]
			]
		})
	} catch (error) {
		console.log(error);
	}
}

function showGenericModalContent(header, body) {
	document.getElementById("genericModalHeader").innerText = header;
	document.getElementById("genericModalBody").innerHTML = "<p>" + body + "</p>";
	$("#genericModal").modal()
}

function showSpinner() {
	document.getElementById("spinner").style.display = "block";
}

function hideSpinner() {
	document.getElementById("spinner").style.display = "none";
}

function showVerificationSpinner() {
	document.getElementById("verificationsSpinnerModal").style.display = "block";
}

function hideVerificationSpinner() {
	document.getElementById("verificationsSpinnerModal").style.display = "none";
}

function showSpinnerModal() {
	document.getElementById("spinnerModal").style.display = "block";
}

function hideSpinnerModal() {
	document.getElementById("spinnerModal").style.display = "none";
}

function showCredentialSpinnerModal() {
	document.getElementById("credentialAcceptSpinner").style.display = "block";
}

function hideCredentialSpinnerModal() {
	document.getElementById("credentialAcceptSpinner").style.display = "none";
}

function showWalletCreateSpinnerModal() {
	document.getElementById("walletCreateSpinner").style.display = "block";
}

function hideWalletCreateSpinnerModal() {
	document.getElementById("walletCreateSpinner").style.display = "none";
}

function showSpinnerG(name) {
    document.getElementById(name).style.display = "block";
}

function hideSpinnerG(name) {
    document.getElementById(name).style.display = "none";
}

function formValidationCheck(name) {	// validate if input fields have values
	const formValidation = document.getElementById(name)
	formValidation.classList.add('was-validated');
	if (formValidation.checkValidity() === false) {
		return;
	}
}

function copyText(value, htmlElementId) {

	// copy value or element id value
	if(htmlElement) {
		var copyText = document.getElementById(htmlElementId);

	  copyText.select();
	  copyText.setSelectionRange(0, 99999); 

	  navigator.clipboard.writeText(copyText.value);
	} else {
	  navigator.clipboard.writeText(value);
	}
  
}