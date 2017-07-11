$(document).ready(function() {
        console.log('test');
        var candInfo= JSON.parse(document.getElementsByName('data')[0].value);

        $(".biospecimen-link").click(function(e){
            loris.loadFilteredMenuClickHandler(
                'biobanking&submenu=biospecimen_search',
                {'pscid': $(this).attr("pscid") }
            )(e);
        });

        consentRequired();
        var nb_samples=$(":input[name^='nb_samples_']");
        $.each(nb_samples, function() {
            this.onchange();
        });



        //DATE PICKER GUI FOR COLLECTION DATE
    $(function(){
        $('[name=collection_date_iswab],[name=collection_date_edta], [name=collection_date_paxgene], [name=collection_date_oragene]').datepicker({
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
    }
);

//ENABLES FORM WHEN SAMPLE NUMBER IS SET TO 1, DISABLES WHEN SET TO 0
function sampleRequired(specimenType) {
    var fieldNames = [
        "biospecimen_id_", "status_id_", "collection_date_", "collection_ra_id_",
        "time_", "freezer_id_", "box_id_", "box_coordinates_", "collection_notes_"];
    var fieldNamesLength = fieldNames.length;

    var x = document.getElementsByName("nb_samples_" + specimenType)[0];

    for (var i = 0; i < fieldNamesLength; i++) {
        if (x.value == "1") {
            $(document.getElementsByName(fieldNames[i] + specimenType)[0]).prop("disabled", false);
        }
        if (x.value == "0") {
            $(document.getElementsByName(fieldNames[i] + specimenType)[0]).prop("disabled", true);
        }
    }
}

//DOES NOT ALLOW FORM TO BE SAVED IF CONSENT IS NOT GIVEN
function consentRequired() {
            var x = document.getElementsByName("participant_consent")[0];
            if (x.value !== "") {
                $("#save").prop("disabled", false);
                $("#consent_alert").hide();
            }
            if (x.value == "") {
                $("#save").prop("disabled", true);
                $("#consent_alert").show();
            }

}

function zepsomAutoPopulate() {

    var candInfo= JSON.parse(document.getElementsByName('data')[0].value);
    var currentVal= document.getElementsByName('zepsom_id')[0].value;

    document.getElementsByName('pscid')[0].value = candInfo[currentVal].pscid;
    document.getElementsByName('dob')[0].value = candInfo[currentVal].dob;
    document.getElementsByName('participant_consent')[0].value = candInfo[currentVal].participant_consent;
    document.getElementsByName('consent_date')[0].value = candInfo[currentVal].consent_date;



}

// AUTOPOPULATE CONSENT DEFAULTS --- WORK IN PROGRESS
// function consentAutoPopulate() {
//
//     document.getElementsByName('participant_consent')[0].value = ;
//     document.getElementsByName('consent_date')[0].value = ;
// }