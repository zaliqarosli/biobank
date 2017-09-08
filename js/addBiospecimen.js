$(document).ready(function() {

        /*Date Selector*/
        $(function () {
            $('input[name*=date], input[name=dob]').datepicker({
                yearRange: 'c-70:c+10',
                dateFormat: 'dd-M-yy',
                changeMonth: true,
                changeYear: true,
                gotoCurrent: true
            });
        });

        if(location.href.includes("addBiospecimen")) {

            /*Header Colours*/
            document.getElementsByName("type_id_iswab")[0].style.backgroundColor = "gray";
            document.getElementsByName("type_id_oragene")[0].style.backgroundColor = "lightskyblue";
            document.getElementsByName("type_id_wb")[0].style.backgroundColor = "purple";
            document.getElementsByName("type_id_paxgene")[0].style.backgroundColor = "darkred";

            //zepsomAutoPopulate(), biospecimenAutoPopulate() and focusBiospecimen() run on every page load
            resetSampleNb();
            if (document.getElementById('error')) {
                returnZID();
                zepsomAutoPopulate();
                returnConsent();
                returnSampleNb();
                revealForm();
            } else if (document.getElementById('success-message')) {
                returnZID();
                returnDob();
                zepsomAutoPopulate();
                revealForm();
                $('#success-message').fadeTo(5000, 0, 'easeInExpo', {});
            } else {
                clearZID();

            }
            biospecimenAutoPopulate();

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

//Hide Form
function hideForm() {
    $('#panel-form').prop('hidden', true);
}

//Reveal Form
function revealForm() {
    $('#panel-form').prop('hidden', false);
}

//stores zepsom ID
function storeZID() {
    sessionStorage.removeItem("zid");
    var zid = document.getElementsByName('zepsom_id')[0];
    if (zid) {
        zid = zid.value;
    };
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

function returnDob() {
    var candInfo = JSON.parse(document.getElementsByName('data')[0].value);
    var currentVal = document.getElementsByName('zepsom_id')[0].value;

    document.getElementsByName('dob')[0].value = candInfo[currentVal].dob;
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

//Autopopulate defaults
function setDefaults() {
    var defaultInfo = JSON.parse(document.getElementsByName('data3')[0].value);
    var sampleStatus=$("select[name^='status_id_']");
    var name=$("select[name^='collection_ra_id_']");
    var date=$("input[name^='collection_date_']");

    $.each(sampleStatus, function(key, el) {
        // if (element.value == '') {
        el.value = defaultInfo.status;
        // }
    });

    $.each(name, function(key, el) {
        if (el.value == '') {
            el.value = defaultInfo.ra;
        }
    });

    $.each(date, function(key, el) {
        if (el.value == '') {
            el.value = defaultInfo.date;
        }
    });
}

//This function verifies that the 4 digit suffix of the entered Biospecimen ID
//matches those already submitted or a given Zepsom ID
function validateBID(el, zid) {
    var bidFormat = /^(iSW|ORA|WB|PAX)\d{6}$/
    var candInfo = JSON.parse(document.getElementsByName('bidInfo')[0].value);
    var currentBIDSuffix = el.value.slice(-4);

    if (bidFormat.test(el.value)) {
        if (location.href.includes("addBiospecimen")) {
            var bidEls = $("input[name^='biospecimen_id']")
            $.each(bidEls, function (key, element) {
                    var displayedBIDSuffix = element.value.slice(-4);
                    if (displayedBIDSuffix != '' && currentBIDSuffix != displayedBIDSuffix) {
                        confirm('WARNING: The last four digits of the entered Bispecomen'+
                            ' ID do not match a previous or ongoing submission for this' +
                            ' candidate. Proceed with caution.');
                        return false;
                    }
                }
            );
        }
        if (location.href.includes("editBiospecimen")) {
            var currentVal = zid;
            $.each(candInfo[currentVal], function (type, info) {
                    var storedBIDSuffix = info['biospecimen_id_' + type].slice(-4);
                    if (currentBIDSuffix != storedBIDSuffix) {
                        confirm('WARNING: The last four digits of the entered Biospecimen'+
                            ' ID do not match a previous submission for this candidate' +
                            '. Proceed with caution.');
                        return false;
                    }
                }
            );
        }
    }
}

//Zepsom ID Validation
function validateZID(el) {
    var candInfo = JSON.parse(document.getElementsByName('data')[0].value);
    var currentVal = document.getElementsByName('zepsom_id')[0].value;

    if (!candInfo[currentVal]) {
        alert('Zepsom ID does not exist in database');
        returnZID();
    }
    //If valid then form is autopopulated
    else {
        resetForm();
        zepsomAutoPopulate();
        resetSampleNb();
        biospecimenAutoPopulate();
        setDefaults();
        $('#error').remove();
        hideForm();
    }
}

//Date of Birth Validation
function validateDob() {
    var candInfo = JSON.parse(document.getElementsByName('data')[0].value);
    var currentVal = document.getElementsByName('zepsom_id')[0].value;
    var dob = document.getElementsByName('dob')[0].value;

    var dobFormat = /^(([0-9])|([0-2][0-9])|([3][0-1]))\-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\-\d{4}$/
    var dobArray = dob.split("-");
    var day = dobArray[0];
    var dayLength = day.length;
    if (dayLength == 1) {
        dob = "0"+dob;
    }

    if (currentVal == '') {
        alert('Zepsom ID is not set')
        document.getElementsByName('dob')[0].value = '';
    } else if (!dobFormat.test(dob)) {
        alert('Date of Birth must by in the format DD-Mon-YYYY')
    } else if (candInfo[currentVal].dob !== dob) {
        alert('Zepsom ID and Date of Birth do not match');
    } else if (document.getElementsByName('participant_consent')[0].value !== '') {
        revealForm();
        focusBiospecimen();
    }

}

function formatDob(el) {
    var dobFormat = /^(([0-9])|([0-2][0-9])|([3][0-1]))\-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\-\d{4}$/
    if (dobFormat.test(el.value)) {
        el.blur();
    }
}

//Check Consent
function checkConsent(el) {
    if (document.getElementsByName('zepsom_id')[0].value == '') {
        alert('Zepsom ID is not set');
        el.value = ''
    }
    if (document.getElementsByName('zepsom_id')[0].value !== ''
        && document.getElementsByName('dob')[0].value !== '') {
        revealForm();
    }
}

//Autopopulate candidate info
function zepsomAutoPopulate() {
    var candInfo = JSON.parse(document.getElementsByName('data')[0].value);
    var currentVal = document.getElementsByName('zepsom_id')[0].value;

    if (currentVal !== '') {
        document.getElementsByName('pscid')[0].value = candInfo[currentVal].pscid;
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

//Autopopulate biospecimen info for each specimen type; disable form for specimen types that are filled out
function biospecimenAutoPopulate() {
    var specimenInfo= JSON.parse(document.getElementsByName('bidInfo')[0].value);
    var zid= document.getElementsByName('zepsom_id')[0].value;

    if(specimenInfo[zid]) {
        $.each(specimenInfo[zid], function (type, info) {
            if (specimenInfo[zid][type]['nb_samples_'+type] == '1') {
                var fieldNames = $.merge($("select[name$='"+type+"']"), $("input[name$='"+type+"']"));
                $.each (fieldNames, function (key, element) {
                    if (!($(element).attr('name') == 'type_id_' + type)) {
                        element.value = specimenInfo[zid][type][$(element).attr('name')];
                    }
                });
                $(document.getElementsByName('nb_samples_'+type)[0]).prop("disabled", true);
                accessForm(type, true);
            }
        });
    }
}

