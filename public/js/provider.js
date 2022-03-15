function showModal(header, body) {
	document.getElementById("modalHeaderTitle").innerHTML = header;
	document.getElementById("modalHeaderBody").innerHTML = body;
	$("#myModal").modal();
}

function showSpinner() {
  spinner.style.display = "block";
}

function hideSpinner() {
  spinner.style.display = "none";
}

function showOrganisationCreationSpinner() {
  document.getElementById("organisationCreateSpinner").style.display = "block";
}

function hideOrganisationCreationSpinner() {
  document.getElementById("organisationCreateSpinner").style.display = "none";
}

window.loadOrganisations = async function () {
	var $table = $('#table')

	showSpinner();

	let response = await Promise.resolve($.ajax({
	    type: 'get',
	    url: '/listOrganisations',
	    data: {},
	    dataType: 'json'
	}))

	hideSpinner();

	var data = response.result;

	operateFormatter = function (value, row, index) {
    return [
      '<a class="delete" href="javascript:void(0)" title="Remove">',
      '<i class="fa fa-trash"></i>',
      '</a>'
    ].join('')
	}

	let operateEvents =  {
		'click .delete': async function(e, value, row, index) {
			// todo: show spinner
			showSpinner();

			console.log(row.tenantId);
			
			try 
			{
				//
				let response = await Promise.resolve($.ajax({
				    type: 'post',
				    url: '/deleteOrganisation',
				    data: {
				    	tenantId: row.tenantId
						},
			    	dataType: 'json'
				}))

				// hide spinner
				hideSpinner();

				// show modal
				showModal("Success", "Organisation: <u>" + row.tenantId + "</u> has been removed.");

				// reload table
				window.loadOrganisations();
			} 
			catch(error) 
			{
				// hide spinner
				hideSpinner();
				
				console.log(error)

				// show modal with error
				showModal("Error", "Organisation failed to delete.");
			}
		}
	}

	$table.bootstrapTable('destroy').bootstrapTable({
	  data: data,
      columns: [
      [{
        field: 'tenantId',
        title: 'tenantId',
        visible: false
      },{
        field: 'name',
        title: 'Organisation'
      }, {
        title: 'Network',
        field: 'network.networkId'
      }, {
        title: 'Access Token',
        field: 'extendedInformation.agentKey',
        formatter: function(value, row, index) {
        	let arr = [];
        	
        	arr.push("<u>" + row.extendedInformation.agentKey + "</u>");

			    return arr.join('')
				}
      }, {
        field: '',
        title: 'Actions',
        align: 'center',
        events: operateEvents,
        formatter: operateFormatter        
      }]
    ]
  })
}

$(document).ready(async function() {
	hideSpinner();
	hideOrganisationCreationSpinner();

	window.loadOrganisations();

	$("#createOrganisation").on("click", async function(e) {
		e.preventDefault();

		// show spinner
		showOrganisationCreationSpinner();

		// validate input fields
		const createOrganisationForm = document.getElementById('createOrganisationForm')
	  createOrganisationForm.classList.add('was-validated');
	  if (createOrganisationForm.checkValidity() === false) {
	    return;
	  }

		try 
		{
			//
			let response = await Promise.resolve($.ajax({
			    type: 'post',
			    url: '/createOrganisation',
			    data: {
			    	name: document.getElementById("organisationName").value,
						region: "SouthAfrica"
					},
		    	dataType: 'json'
			}))

			// hide spinner
			hideOrganisationCreationSpinner();

			// show modal
			showModal("Success", "Organisation: <u>" + response.result.name + "</u> created successfully.");

			// reload table
			window.loadOrganisations();
		} 
		catch(error) 
		{
			// hide spinner
			hideOrganisationCreationSpinner();
			console.log(error)
			// show modal with error
			showModal("Error", "Transaction against server failed. Please try again.");
		}
	})
});