$(document).ready(function() {
        var BAR_CODE_LENGTH = 9;
        
        var candInfo= JSON.parse(document.getElementsByName('data')[0].value);

        //reset zepsom id to that of prior submission
        document.getElementsByName('zepsom_id')[0].value = JSON.parse(sessionStorage.getItem("zid"));


        //reset form if submission is successful
        if (document.getElementById('success')) {
            resetForm();
        };

        $(".biospecimen-link").click(function(e){
            loris.loadFilteredMenuClickHandler(
                'biobanking&submenu=biospecimen_search',
                {'pscid': $(this).attr("pscid") }
            )(e);
        });

        //RIDA'S SUPERHACK
        var nb_samples=$(":input[name^='nb_samples_']");
        $.each(nb_samples, function() {
            this.onchange();
        });

        //SET HEADER COLOURS
        document.getElementsByName("type_id_iswab")[0].style.backgroundColor = "gray";
        document.getElementsByName("type_id_oragene")[0].style.backgroundColor = "lightskyblue";
        document.getElementsByName("type_id_wb")[0].style.backgroundColor = "purple";
        document.getElementsByName("type_id_paxgene")[0].style.backgroundColor = "darkred";

        //DATE PICKER GUI FOR COLLECTION DATE
        $(function(){
            $('[name=collection_date_iswab],[name=collection_date_wb], [name=collection_date_paxgene], [name=collection_date_oragene]').datepicker({
                yearRange: 'c-70:c+10',
                dateFormat: 'd-M-yy',
                changeMonth: true,
                changeYear: true,
                gotoCurrent: true
            });
        });

        //DATE PICKER GUI FOR CONSENT DATE
        $(function(){
            $('input[name=consent_date]').datepicker({
                yearRange: 'c-70:c+10',
                dateFormat: 'd-M-yy',
                changeMonth: true,
                changeYear: true,
            });
        });

        //zepsomAutoPopulate() and biospecimenAutoPopulate() run on every page load
        zepsomAutoPopulate();
        biospecimenAutoPopulate();

        //passes to next biospecimen field once input is given
        var biospecimenIdFields = $("input[name^='biospecimen_id']");
        $("input[name^=biospecimen_id]").keyup(function(e) {
            // define variables
            var currentName = $(':focus').attr('name');
            
            //--------------------------------------------
            // Find index of current bar code text field
            //--------------------------------------------
            var currentI = -1;
            var current = null;
            for (i=0; i<biospecimenIdFields.length; i++) {
                if ($(biospecimenIdFields[i]).attr('name') == currentName) {
					currentI = i;
					current = $(biospecimenIdFields[currentI]);
					break;
				}
			}
			
			//--------------------------------------------------------------------
			// Scan the other bar code text fields from left to right, starting
			// at currentI and set nextField to be the first non-empty one (will
			// be null if they are all non-empty)
			//--------------------------------------------------------------------
			nextField = null;
			if(currentI != -1) {
				for (i=1; i<=biospecimenIdFields.length; i++) {
                    var nextFieldIndex = (currentI + i) % biospecimenIdFields.length;
                    if($(biospecimenIdFields[nextFieldIndex]).val() === '') {
						nextField = $(biospecimenIdFields[nextFieldIndex]);
						break;
					}
                }
            }
            
            if(current.val().length >= BAR_CODE_LENGTH) {
				if(nextField != null && nextField.val() === "") {
                        nextField.focus();
			    }
			}
//            // check if its a delete (46) or a backspace (8). erase time if field is erased
//            // Do not go to next line
//            if (e.keyCode == 8 || e.keyCode == 46) {
//            } else {
//                // wait .5 sec after a keyup event in the barcode field
//                setTimeout(function () {
//                    if (nextField.val() === "") {
//                        nextField.focus();
//                    }
//                }, 500);
            })

        });

//refreshes the entire page after submission
function storeZID() {
    sessionStorage.removeItem("zid");
    var zid = document.getElementsByName('zepsom_id')[0].value;
    sessionStorage.setItem("zid", JSON.stringify(zid));
}

function resetForm() {
    setTimeout(function(){location.href=loris.BaseURL+'/biobanking/?submenu=addBiospecimen&reset=true'}, 3000);
    // setTimeout(function(){window.location.reload();},1000);
}

//set ZepsomID based on prior submission
// function setZepsomID(zid) {
//     document.getElementsByName('zepsom_id')[0].value = zid;
// }


//sets focus to first biospecimen field
function focusBiospecimen() {
    document.getElementsByName('biospecimen_id_iswab')[0].focus();
}


//ENABLES OR DISABLES FORM COLUMN DEPENDING ON VALIDITY PARAMETER. SPECIMEN TYPE MUST BE PASSED INTO FUNCTION.
function accessForm(specimenType, validity) {
    var fieldNames = $.merge($("select[name$='"+specimenType+"']"), $("input[name$='"+specimenType+"']"));

    $.each(fieldNames, function(key, value) {
        //bypasses nb_samples and type_id
        if ( ($(value).attr('name') == 'nb_samples_'+specimenType+'') || ($(value).attr('name') == 'type_id_'+specimenType+'' ) ) {
        } else {
            $(value).prop("disabled", validity);
        }


    });
}

//ENABLES FORM WHEN SAMPLE NUMBER IS SET TO 1, DISABLES WHEN SET TO 0
function sampleRequired(specimenType) {
    var x = document.getElementsByName("nb_samples_" + specimenType)[0];
    if (x.value == '1') {
        accessForm(specimenType, false);
    } if (x.value == "0") {
        accessForm(specimenType, true);
    }
}


// DOES NOT ALLOW FORM TO BE SAVED IF CONSENT IS NOT GIVEN - DEACTIVATED
function consentRequired() {
    var x = document.getElementsByName("participant_consent")[0].value;
    if (x == "yes") {
        $(document.getElementsByName('participant_consent_biobank')[0]).prop("disabled", false);
    }
    if (x !== "yes") {
        $(document.getElementsByName('participant_consent_biobank')[0]).prop("disabled", true);
    }
}

//Autopopulate candidate info
function zepsomAutoPopulate() {
    var candInfo = JSON.parse(document.getElementsByName('data')[0].value);
    var currentVal = document.getElementsByName('zepsom_id')[0].value;

    if (currentVal !== '') {
        document.getElementsByName('pscid')[0].value = candInfo[currentVal].pscid;
        document.getElementsByName('dob')[0].value = candInfo[currentVal].dob;
        // document.getElementsByName('participant_consent')[0].value = candInfo[currentVal].participant_consent;
        // document.getElementsByName('participant_consent_biobank')[0].value = candInfo[currentVal].participant_consent_biobank;
        document.getElementsByName('consent_date')[0].value = candInfo[currentVal].consent_date;

        if (candInfo[currentVal].participant_consent == 'yes' && candInfo[currentVal].participant_consent_biobank == 'yes') {
            document.getElementsByName('participant_consent')[0].value = 'yes_project_biobank';
        } else if (candInfo[currentVal].participant_consent == 'yes' && candInfo[currentVal].participant_consent_biobank !== 'yes') {
            document.getElementsByName('participant_consent')[0].value = 'yes_project';
        } else {
            document.getElementsByName('participant_consent')[0].value = '';
        }
    }
}

//Autopopulate biospecimen info
function biospecimenAutoPopulate() {

    var specimenInfo= JSON.parse(document.getElementsByName('data2')[0].value);
    var zid= document.getElementsByName('zepsom_id')[0].value;

    var nb_samples=$(":input[name^='nb_samples_']");
    $.each(nb_samples, function() {
        this.value='1';
        $(this).prop("disabled", false);
        this.onchange();
    });

    if(specimenInfo[zid]) {
        $.each(specimenInfo[zid], function (key, value) {
            if (specimenInfo[zid][key]['nb_samples_' + key] == '1') {
                document.getElementsByName('nb_samples_' + key)[0].value = specimenInfo[zid][key]['nb_samples_' + key];
                // document.getElementsByName('biospecimen_id_' + key)[0].value = specimenInfo[zid][key]['biospecimen_id_' + key];
                $(document.getElementsByName('nb_samples_' + key)[0]).prop("disabled", true);
                accessForm(key, true);
            }
        })
    }
}

