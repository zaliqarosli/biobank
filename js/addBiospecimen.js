$(document).ready(function() {

        //Date Selector
        $(function () {
            $('input[name*=date], input[name=dob]').datepicker({
                yearRange: 'c-70:c+10',
                dateFormat: 'd-M-yy',
                changeMonth: true,
                changeYear: true,
                gotoCurrent: true
            });
        });

        $('#success-message').fadeTo(5000, 0, 'easeInExpo', {});

        if(location.href.includes("addBiospecimen")) {

            ///todo: is this necessary?
            $(".biospecimen-link").click(function (e) {
                loris.loadFilteredMenuClickHandler(
                    'biobanking&submenu=biospecimen_search',
                    {'pscid': $(this).attr("pscid")}
                )(e);
            });

            //todo: is this necesssary?
            // trigger onchange of nb_samples at document ready
            var nb_samples = $(":input[name^='nb_samples_']");
            $.each(nb_samples, function () {
                this.onchange();
            });

            //Header Colours
            document.getElementsByName("type_id_iswab")[0].style.backgroundColor = "gray";
            document.getElementsByName("type_id_oragene")[0].style.backgroundColor = "lightskyblue";
            document.getElementsByName("type_id_wb")[0].style.backgroundColor = "purple";
            document.getElementsByName("type_id_paxgene")[0].style.backgroundColor = "darkred";

            //zepsomAutoPopulate(), biospecimenAutoPopulate() and focusBiospecimen() run on every page load
            resetSampleNb();
            if (document.getElementById('error')) {
                zepsomAutoPopulate();
                returnConsent();
                returnZID();
                returnSampleNb();
                $('#panel-form').attr('hidden', false);
            } else if (document.getElementById('success-message')) {
                returnZID();
                zepsomAutoPopulate();
                $('#panel-form').attr('hidden', false);
            } else {
                clearZID();
            }
            biospecimenAutoPopulate();
            // focusBiospecimen();

            //passes to next biospecimen field once input is given
            $(function () {
                var biospecimenIdFields = $("input[name^='biospecimen_id']");
                $("input[name^='biospecimen_id']").keyup(function (e) {
                    // define variables
                    let current = $(':focus').attr('name');

                    for (i = 0; i < (biospecimenIdFields.length - 1); i++) {
                        if ($(biospecimenIdFields[i]).attr('name') == current) {
                            var nextField = $(biospecimenIdFields[i + 1]);
                        }
                    }

                    // check if its a delete (46), backspace (8) and if it does not end in 6 digits.
                    // if so, do not go to next line
                    if (e.keyCode == 8 || e.keyCode == 46 || /^.{2,3}\d{6}$/.test($("input[name='" + current + "']").val()) == false) {
                    } else {
                        // wait .5 sec after a keyup event in the barcode field
                        setTimeout(function () {
                            if (!(nextField == null)) {
                                if (nextField.val() === "") {
                                    nextField.focus();
                                }
                            } else {
                                $("input[name='" + current + "']").blur();          //unfocus if next field is undefined
                            }
                        }, 0);
                    }
                });
            });
        }
    }
);


// function editForm() {
//     $('#edit-form').prop("disabled", false);
//     $('#edit-save').css("display", "inline-block");
//     $('#edit-button').css("display","none");
// }

//stores zepsom ID
function storeZID() {
    sessionStorage.removeItem("zid");
    var zid = document.getElementsByName('zepsom_id')[0];
    if (zid) {
        zid = zid.value;
    };
    console.log(zid);
    sessionStorage.setItem("zid", zid);
}

function returnZID() {
    document.getElementsByName('zepsom_id')[0].value = JSON.parse(sessionStorage.getItem("zid"));
}

function clearZID() {
    sessionStorage.removeItem("zid");
}


function storeConsent() {
    sessionStorage.removeItem('consent');
    var consent = document.getElementsByName('participant_consent')[0];
    if (consent) {
        consent = consent.value;
    };
    sessionStorage.setItem('consent', JSON.stringify(consent));
}

function returnConsent() {
    document.getElementsByName('participant_consent')[0].value = JSON.parse(sessionStorage.getItem("consent"));
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
        clearZID();
    }
    location.href=url;
}

//Stores zepsom id, resets form and returns zepsom id value to it's field.
//specific fields such as hidden and with name starting with 'type_id' are not affected.
function resetForm() {
    storeZID();
    $(':input').not(":button, :submit, :reset, :hidden, :checkbox, :radio, :input[name^='type_id']").val('');
    document.getElementsByName('zepsom_id')[0].value = JSON.parse(sessionStorage.getItem("zid"));
}

function resetSampleNb() {
    var nb_samples=$(":input[name^='nb_samples_']");
    $.each(nb_samples, function() {
        this.value='1';
        $(this).prop("disabled", false);
        this.onchange();
    });
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

//Autopopulate defaults
function setDefaults() {
    var defaultInfo = JSON.parse(document.getElementsByName('data3')[0].value);
    var sampleStatus=$("select[name^='status_id_']");
    var name=$("select[name^='collection_ra_id_']");
    var date=$("input[name^='collection_date_']");

    $.each(sampleStatus, function(key, element) {
        // if (element.value == '') {
        element.value = defaultInfo.status;
        // }
    });

    $.each(name, function(key, element) {
        if (element.value == '') {
            element.value = defaultInfo.ra;
        }
    });

    $.each(date, function(key, element) {
        if (element.value == '') {
            element.value = defaultInfo.date;
        }
    });
}

//Autopopulate candidate info
function zepsomAutoPopulate() {
    console.log('zepautopop');
    var candInfo = JSON.parse(document.getElementsByName('data')[0].value);
    var currentVal = document.getElementsByName('zepsom_id')[0].value;

    if (currentVal !== '') {
        document.getElementsByName('pscid')[0].value = candInfo[currentVal].pscid;
        // document.getElementsByName('dob')[0].value = candInfo[currentVal].dob;
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

//Date of Birth Validation
function validateDob() {
    var candInfo = JSON.parse(document.getElementsByName('data')[0].value);
    var currentVal = document.getElementsByName('zepsom_id')[0].value;

    if (currentVal == '') {
        alert('Zepsom ID is not set')
    } else if (candInfo[currentVal].dob !== document.getElementsByName('dob')[0].value) {
        alert('Zepsom ID and Date of Birth do not match');
        document.getElementsByName('dob')[0].value = '';
    } else {
        $('#panel-form').attr('hidden', false);
    }

}

//Zepsom ID Validation
function validateZID() {
    var candInfo = JSON.parse(document.getElementsByName('data')[0].value);
    var currentVal = document.getElementsByName('zepsom_id')[0].value;

    if (!candInfo[currentVal]) {
        alert('Zepsom ID does not exist in database');
        returnZID();
    }
    //If valid then form is revealed and autopopulated
    else {
        resetForm();
        zepsomAutoPopulate();
        resetSampleNb();
        biospecimenAutoPopulate();
        setDefaults();
        focusBiospecimen();
        $('#error').remove();
        $('#panel-form').attr('hidden', true);
    }
}

//Autopopulate biospecimen info for each specimen type; disable form for specimen types that are filled out
function biospecimenAutoPopulate() {
    console.log('bioautopop');
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

