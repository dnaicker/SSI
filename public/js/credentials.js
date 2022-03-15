const modalText = document.getElementById("modal-text");
const spinner = document.getElementById("spinner");
const qr = document.getElementById("qrcode");
const qrcodetext = document.getElementById("qrcodetext");
const accepted = document.getElementById("verification-accepted");
const acceptedName = document.getElementById("verify-full-name");
const acceptedNumber = document.getElementById("verify-email");
const emailInput = document.getElementById("email");

window.loadVerificationHistory = async function() {
    console.log("loadVerificationHistory")

    let data = [];

    var table = $('#verificationHistoryTable')

    showVerificationHistorySpinner()

    try {
        let response = await Promise.resolve($.ajax({
            type: 'get',
            url: '/listVerificationsIssuer',
            data: {},
            dataType: 'json'
        }))

        console.log(response);

        table.bootstrapTable('destroy').bootstrapTable({
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
            data: response.result,
            columns: [
                [{
                    title: 'Verification ID',
                    field: 'verificationId',
                    formatter: function(value, row, index) {
                        let arr = []
                        arr.push("<u>" + row.verificationId + "</u>")
                        return arr.join('');
                    }
                }, {
                    title: 'Connection ID',
                    field: 'connectionId',
                    formatter: function(value, row, index) {
                        let arr = []
                        if(row.connectionId) {
                            arr.push("<u>" + row.connectionId + "</u>")
                        } else {
                            arr.push('Connectionless')
                        }
                        return arr.join('');
                    }
                }, {
                    title: 'Policy',
                    field: 'policy.name'
                }, {
                    title: 'Policy ID',
                    field: 'definitionId',
                    visible: false
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
                    events: {
                        'click .submitVerification': async function(e, value, row, index) {

                            console.log(row);

                            showVerificationHistorySpinner();

                            try {
                                let response = await Promise.resolve($.ajax({
                                    type: 'post',
                                    url: '/submitVerificationToConnectionFromPolicyId',
                                    data: { connectionId: row.connectionId, policyId: row.definitionId },
                                    dataType: 'json'
                                }))

                                console.log(response)

                                // reload table
                                window.loadVerificationHistory();

                            } catch (error) {
                                console.log(error)
                            }

                            hideVerificationHistorySpinner();
                        },
                        'click .deleteVerification': async function(e, value, row, index) {

                            showVerificationHistorySpinner();

                            try {
                                let response = await Promise.resolve($.ajax({
                                    type: 'post',
                                    url: '/deleteVerificationIssuer',
                                    data: { verificationId: row.verificationId },
                                    dataType: 'json'
                                }))

                                console.log(response)

                                // reload table
                                window.loadVerificationHistory();

                            } catch (error) {
                                console.log(error)
                            }

                        }
                    },
                    formatter: function(value, row, index) {
                        let arr = []
                        if (row.state === "Requested") {
                            arr.push('<a class="submitVerification" href="javascript:void(0)" title="Resend verification" style="padding-right: 15px">')
                            arr.push('<i class="fa-solid fa-paper-plane"></i>')
                            arr.push('</a>')
                        } 
                        arr.push('<a class="deleteVerification" href="javascript:void(0)" title="Delete verification request">')
                        arr.push('<i class="fa fa-trash" style="padding-left: 5px"></i>')
                        arr.push('</a>')
                        return arr.join('')
                    }
                }]
            ]
        })

        hideVerificationHistorySpinner();

    } catch (error) {
        console.log(error);
        // showGenericModalContent("Error", error.result)
    }
}

function showModal(header, body) {
    document.getElementById("modalHeaderTitle").innerHTML = header;
    document.getElementById("modalHeaderBody").innerHTML = body;
    $("#myModal").modal();
}

$(document).ready(function() {
    getListOfConnections();
    getListOfPolicies();
    window.loadVerificationHistory();
    hideSpinnerG("connectionInvitationSpinner");
    hideResult("connection-invitation-form")


    $("#refreshVerificationHistoryTable").on('click', function() {
        window.loadVerificationHistory();
    })

    $("#issue-submit").on('click', function(e) {
        e.preventDefault();

        // validate if input fields have values
        const credentialCreationForm = document.getElementById('credentialCreationForm')
        credentialCreationForm.classList.add('was-validated');
        if (credentialCreationForm.checkValidity() === false) {
            return;
        }

        const data = {
            fullname: document.getElementById("fullname").value,
            email: document.getElementById("email").value,
        }

        openModal("Scan this code to accept credential");
        hideQRCode();
        showSpinner();

        $.ajax({
                type: 'post',
                url: '/createCredential',
                data: data,
                dataType: 'text'
            })
            .done(function(response) {
                const result = JSON.parse(response)
                const offerUrl = result.result.offerUrl;
                setQRCodeImage(offerUrl);
                hideSpinner();
                showQRCode();
                qrcodetext.innerHTML = offerUrl;
            });
    });

    $("#submitAutoVerification").on('click', async function(e) {
        e.preventDefault();

        showSubmitVerificationSpinner();

        try {
            //
            let response = await Promise.resolve($.ajax({
                type: 'post',
                url: '/submitVerificationToConnectionFromPolicyId',
                data: {
                    connectionId: $("#connectionList option:selected").val(),
                    policyId: $("#policyList option:selected").val()
                },
                dataType: 'json'
            }))

            console.log(response);

            showModal("Success", JSON.stringify(response.result));

            window.loadVerificationHistory();

        } catch (error) {
            // hide spinner

            console.log(error)

            // show modal with error
            showModal("Error", "Verification failed: " + error);
        }

        hideSubmitVerificationSpinner();

    });

    $("#create-connection-invitation").on('click', async function(e) {
        e.preventDefault();

        showSpinnerG("connectionInvitationSpinner");

        try {
            
            let response = await Promise.resolve($.ajax({
                type: 'post',
                url: '/createConnectionInvitation',
                data: {},
                dataType: 'json'
            }))

            console.log(response)

            document.getElementById("connection-invitation-result").value = response.result.invitationUrl;

            showResult("connection-invitation-form")

        } catch (error) {
            console.log(error)
        }

        hideSpinnerG("connectionInvitationSpinner");

    })

    $("#verify-submit").on('click', async function(e) {
        e.preventDefault();

        hideAccepted();
        openModal("Scan this code to verify credential");
        hideQRCode();
        showSpinner();

        let response = await Promise.resolve($.ajax({
            type: 'post',
            url: '/createVerification',
            dataType: 'text'
        }))

        const result = JSON.parse(response);
        console.log(result);
        let verificationId = result.result.verificationId;
        setQRCodeImage(result.result.verificationRequestUrl);
        qrcodetext.innerHTML = result.result.verificationRequestUrl;
        hideSpinner();
        showQRCode();

        let verification = { state: "Requested" };
        let timedOut = false;
        setTimeout(() => timedOut = true, 1000 * 60);
        while (!timedOut && verification.state === "Requested") {
            let checkResponse = await Promise.resolve($.ajax({
                type: 'post',
                url: '/getVerification',
                data: { verificationId: verificationId },
                dataType: 'text'
            }))
            let _checkResponse = JSON.parse(checkResponse);
            verification = _checkResponse.result;
        }
        hideQRCode();
        closeModal();
        if (verification.state === "Accepted") {
            showAccepted();
            // should this be calld proof.passport ?  check lucas code
            setAcceptedData(
                verification.proof['Email Registration'].attributes["Full name"],
                verification.proof['Email Registration'].attributes["Email"]
            );
        }
    });

    async function getListOfConnections() {
        showSubmitVerificationSpinner();
        try {
            let response = await Promise.resolve($.ajax({
                type: 'post',
                url: '/listAllConnectionsForCredentialIssuer',
                data: { state: null },
                dataType: 'json'
            }))

            console.log("listAllConnectionsForCredentialIssuer", response)

            let arr = [];

            for (item in response.result) {
                arr.push("<option value=" + response.result[item].connectionId + ">" + response.result[item].name + " - " + response.result[item].connectionId + "</option>");
            }

            document.getElementById('connectionList').innerHTML = arr.join("");
            hideSubmitVerificationSpinner();

        } catch (error) {
            console.log(error)
            hideSubmitVerificationSpinner();

        }
    }

    async function getListOfPolicies() {
        showSubmitVerificationSpinner();
        try {
            let response = await Promise.resolve($.ajax({
                type: 'get',
                url: '/listAllPoliciesForCredentialIssuer'
            }))

            let arr = [];

            for (item in response.result) {
                arr.push("<option value=" + response.result[item].policyId + ">" + response.result[item].name + " - " + response.result[item].policyId + "</option>");
            }

            document.getElementById('policyList').innerHTML = arr.join("");

            hideSubmitVerificationSpinner();

        } catch (error) {
            console.log(error)
            hideSubmitVerificationSpinner();

        }
    }
});

// todo: build list of connections
// todo: build list of policy ids


// todo: jquery selector for list value

function openModal(text) {
    $("#modal").modal();
    $("#modal").css("z-index", "1500");
    modalText.innerText = text;
}

function closeModal() {
    $("#modal").modal("hide");
}

function hideQRCode() {
    qr.style.display = "none";
}

function showQRCode() {
    qr.style.display = "block";
}

function setQRCodeImage(url) {
    console.log("setQRCodeImage")
    qr.src = 'https://chart.googleapis.com/chart?cht=qr&chl=' + url + '&chs=300x300&chld=L|1';
}

function hideSpinner() {
    spinner.style.display = "none";
}

function showSpinner() {
    spinner.style.display = "block";
}

function showSubmitVerificationSpinner() {
    document.getElementById("submitVerificationSpinner").style.display = "block";
}

function hideSubmitVerificationSpinner() {
    document.getElementById("submitVerificationSpinner").style.display = "none";
}

function showResult(name) {
    document.getElementById(name).style.display = "block";
}

function hideResult(name) {
    document.getElementById(name).style.display = "none";
}

function showSpinnerG(name) {
    document.getElementById(name).style.display = "block";
}

function hideSpinnerG(name) {
    document.getElementById(name).style.display = "none";
}

function showVerificationHistorySpinner() {
    document.getElementById("verificationHistorySpinner").style.display = "block";
}

function hideVerificationHistorySpinner() {
    document.getElementById("verificationHistorySpinner").style.display = "none";
}

function hideAccepted() {
    accepted.style.display = "none";
}

function showAccepted() {
    accepted.style.display = "block";
}

function setAcceptedData(name, passportNumber) {
    acceptedName.value = name;
    acceptedNumber.value = passportNumber;
}

function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function showGenericModalContent(header, body) {
    document.getElementById("genericModalHeader").innerText = header;
    document.getElementById("genericModalBody").innerHTML = "<p>" + body + "</p>";
    $("#genericModal").modal()
}
