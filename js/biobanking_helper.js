$(document).ready(function() {
        var BAR_CODE_LENGTH = 9;
        
        var candInfo= JSON.parse(document.getElementsByName('data')[0].value);

        //reset zepsom id to that of prior submission
        document.getElementsByName('zepsom_id')[0].value = JSON.parse(sessionStorage.getItem("zid"));

    $('#success-message').fadeTo(5000, 0, 'easeInExpo', {
    });

        ///todo: is this necessary?
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

        //zepsomAutoPopulate(), biospecimenAutoPopulate() and focusBiospecimen() run on every page load

        resetSampleNb();
        if (document.getElementById('error')) {
            returnSampleNb();
        }
        zepsomAutoPopulate();
        biospecimenAutoPopulate();
        focusBiospecimen();

        //passes to next biospecimen field once input is given
        var biospecimenIdFields = $("input[name^='biospecimen_id']");
        $("input[name^='biospecimen_id']").keyup(function(e) {
            // define variables
            let current = $(':focus').attr('name');

            for (i=0; i<(biospecimenIdFields.length - 1); i++) {
                if ($(biospecimenIdFields[i]).attr('name') == current)
                {
                    var nextField = $(biospecimenIdFields[i+1]);
                }
            }

            // check if its a delete (46), backspace (8) and if it does not end in 6 digits.
            // if so, do not go to next line
            if ( e.keyCode == 8 || e.keyCode == 46 || /\d{6}$/.test($("input[name='"+current+"']").val()) == false ) {
            } else {
                // wait .5 sec after a keyup event in the barcode field
                setTimeout(function () {
                    if (!(nextField == null)) {
                        if (nextField.val() === "") {
                            nextField.focus();
                        }
                    } else {
                        $("input[name='"+current+"']").blur();          //unfocus if next field is undefined
                    }
                }, 0);
            }

        });

    }
);

//
function submitForm() {
    document.getElementsByName("edit_biospecimen")[0].submit();
    storeZID()
}


// setTimeout(function() {
//     $("#success-message").fadeOut('slow', 'linear');
// }, 3000);

function successFade() {

}


//stores zepsom id after sucessful submission
function storeZID() {
    sessionStorage.removeItem("zid");
    var zid = document.getElementsByName('zepsom_id')[0];
    if (zid) {
        zid = zid.value;
    };
    sessionStorage.setItem("zid", JSON.stringify(zid));
}

function storeSampleNb() {
    var nb_samples=$(":input[name^='nb_samples_']");
    $.each(nb_samples, function() {
        sessionStorage.setItem($(this).attr('name'), JSON.stringify(this.value));
    });
}

function returnSampleNb() {
    var nb_samples=$(":input[name^='nb_samples_']");
    $.each(nb_samples, function() {
        this.value = JSON.parse(sessionStorage.getItem($(this).attr('name')));;
        this.onchange();
    });
}

//refreshes page
function refreshForm(success) {
    var url = loris.BaseURL+'/biobanking/?submenu=addBiospecimen&reset=true';
    if (success) {
        url += '&success=true'
    } else {
        sessionStorage.removeItem("zid");
    }
    location.href=url;
}

//Stores zepsom id, resets form and returns zepsom id value to it's field
function resetForm() {
    storeZID();
    document.getElementsByName("edit_biospecimen")[0].reset();
    document.getElementsByName('zepsom_id')[0].value = JSON.parse(sessionStorage.getItem("zid"));

}

//Sets focus to first enabled biospecimen field
function focusBiospecimen() {
    var biospecimenIdFields = $("input[name^='biospecimen_id']");
    for (i=0; i<(biospecimenIdFields.length); i++) {
        if ($(biospecimenIdFields[i]).is(':enabled'))
        {
            $(biospecimenIdFields[i]).focus();
            break;
        }
    }
}

//Enables/disables form column based on validity parameter. Specimen type must be passed into this function.
function accessForm(specimenType, validity) {
    var fieldNames = $.merge($("select[name$='"+specimenType+"']"), $("input[name$='"+specimenType+"']"));

    $.each(fieldNames, function(key, value) {
        //bypasses nb_samples and type_id
        if (($(value).attr('name') == 'nb_samples_'+specimenType) || ($(value).attr('name') == 'type_id_'+specimenType)) {
        } else {
            $(value).prop("disabled", validity);
            // $(value).empty();
        }
    });
}

//Enables form when nb_samples is set to 1, disables if set to 0
function sampleRequired(specimenType) {
    var x = document.getElementsByName("nb_samples_" + specimenType)[0];
    if (x.value == '1') {
        accessForm(specimenType, false);
    } if (x.value == "0") {
        accessForm(specimenType, true);
    }
}


// Function Not in Use
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

function resetSampleNb() {
    var nb_samples=$(":input[name^='nb_samples_']");
    $.each(nb_samples, function() {
        this.value='1';
        $(this).prop("disabled", false);
        this.onchange();
    });
}

//Autopopulate biospecimen info for each specimen type; disable form for specimen types that are filled out
function biospecimenAutoPopulate() {

    var specimenInfo= JSON.parse(document.getElementsByName('data2')[0].value);
    var zid= document.getElementsByName('zepsom_id')[0].value;

    if(specimenInfo[zid]) {
        $.each(specimenInfo[zid], function (type, info) {
            if (specimenInfo[zid][type]['nb_samples_' + type] == '1') {
                var fieldNames = $.merge($("select[name$='"+type+"']"), $("input[name$='"+type+"']"));
                $.each (fieldNames, function (key, element) {
                    if (!($(element).attr('name') == 'type_id_' + type)) {
                        element.value = specimenInfo[zid][type][$(element).attr('name')];
                    }
                });

                $(document.getElementsByName('nb_samples_' + type)[0]).prop("disabled", true);
                accessForm(type, true);
            }

        });
    }
}

