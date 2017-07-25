<!-- TODO: move this into javascript files? -->
{literal}
    <script type="text/javascript">
        $(document).ready(function(){
            $("#cand").DynamicTable({ "freezeColumn" : "pscid" });

            $('input[name=dob_1]').datepicker({
                yearRange: 'c-70:c',
                dateFormat: 'dd-M-yy',
                changeMonth: true,
                changeYear: true
            });
        });
    </script>
{/literal}
<script type="text/javascript" src="{$baseurl}/js/advancedMenu.js"></script>

<script type="text/javascript">
    function validateForm() {
        var pscids = $("textarea[name='pscid']").val();
        if(!pscids.match(/^\s*([\w-]+)?(\s+[\w-]+)*\s*$/)) {
            document.getElementById('error_message').innerHTML =
                '<font color="red">&nbsp;&nbsp;&nbsp;Invalid PSCIDs. Please enter a list of pscids separated by spaces or leave this field blank</font>';
            return false;
        }

        var dob = $("input[name='dob']").val();
        if(!dob.match(/^\s*$/)
            && !dob.match(/^\s*(\d|\d\d)-(Jan|Feb|Mar|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d\d\d\d\s*$/i)) {
            document.getElementById('error_message').innerHTML =
                '<font color="red">&nbsp;&nbsp;&nbsp;The Date of  birth should be in the form "dd-AbbreviatedMonth-YYYY" (e.g 03-Jul-2011, 11-Nov-2013, etc...)</font>';
            return false;
        }

        document.getElementById('error_message').innerHTML = '';
        return true;
    }
</script>

<div class="row">
    <div id="tabs">
        <ul class="nav nav-tabs">
            <li class="statsTab active"><a class="statsTabLink" id="onLoad"><strong>Search by PSCID</strong></a></li>
            <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?submenu=biospecimen_search&reset=true">Search by Specimen</a></li>
            <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?submenu=addBiospecimen">Add Specimen</a></li>
        </ul>
        <br>
    </div>
</div>

<div class="row">
    <div class="col-sm-12">
        <div class="panel panel-primary">
            <div class="panel-heading" onclick="hideFilter(this)">

                Selection Filter

                <!--Note: this label is currently hidden (display:none) -->
                <label class="advancedOptions" id="advanced-label" style="display:none">(Advanced Options)</label>
                <span class="glyphicon arrow glyphicon-chevron-up pull-right"></span>
            </div>

            <div class="panel-body">
                <form method="post" action="{$baseurl}/biobanking/">
                    <div class="row">
                        &nbsp;&nbsp;&nbsp;&nbsp;<label id="error_message"></label>
                    </div>
                    <br>

                    <div class="row">
                        <div class="form-group col-sm-3">
                            <label class="col-sm-5 col-md-5">
                                {$form.pscid.label}
                            </label>
                            <div class="col-sm-4 col-md-7">
                                {$form.pscid.html}
                            </div>
                        </div>
                        <div class="form-group col-sm-3">
                            <label class="col-sm-5 col-md-5">
                                {$form.dob.label}
                            </label>
                            <div class="col-sm-4 col-md-7">
                                {$form.dob.html}
                            </div>
                        </div>
                    </div>

                    <div class="row">

                        <div class="form-group col-sm-3">
                            <label class="col-sm-5 col-md-5">
                                {$form.iswab.label}
                            </label>
                            <div class="col-sm-4 col-md-7">
                                {$form.iswab.html}
                            </div>
                        </div>

                        <div class="form-group col-sm-3">
                            <label class="col-sm-5 col-md-5">
                                {$form.oragene.label}
                            </label>
                            <div class="col-sm-4 col-md-7">
                                {$form.oragene.html}
                            </div>
                        </div>

                        <div class="form-group col-sm-3">
                            <label class="col-sm-5 col-md-5">
                                {$form.wb.label}
                            </label>
                            <div class="col-sm-4 col-md-7">
                                {$form.wb.html}
                            </div>
                        </div>

                        <div class="form-group col-sm-3">
                            <label class="col-sm-5 col-md-5">
                                {$form.paxgene.label}
                            </label>
                            <div class="col-sm-4 col-md-7">
                                {$form.paxgene.html}
                            </div>
                        </div>

                    </div> <!-- End second row -->

                    <div class="row">

                    </div> <!-- End third row -->


                    <br class="visible-xs">

                    <div id="advanced-buttons">
                        <!-- <div class="form-group col-sm-6 col-sm-offset-6"> -->
                        <!-- <div class="col-sm-6"> -->
                        <div class="col-sm-4 col-md-3 col-xs-12 col-md-offset-3">
                            <input type="submit" name="filter" value="Apply Filters" id="showdata_advanced_options" class="btn btn-sm btn-primary col-xs-12" onClick="return validateForm();"/>
                        </div>
                        <div class="visible-xs col-xs-12"> </div>
                        <div class="visible-xs col-xs-12"> </div>
                        <div class="visible-xs col-xs-12"> </div>
                        <div class="visible-xs col-xs-12"> </div>
                        <div class="col-sm-4 col-md-3 col-xs-12">
                            <input type="button" name="reset" value="Clear Active Filters" class="btn btn-sm btn-primary col-xs-12" onclick="location.href='{$baseurl}/main.php?test_name=biobanking&reset=true'" />
                        </div>
                        <div class="visible-xs col-xs-12"> </div>
                        <div class="visible-xs col-xs-12"> </div>
                        <div class="visible-xs col-xs-12"> </div>
                        <div class="visible-xs col-xs-12"> </div>
                    </div>
            </div>
        </div>
    </div>
</div>


<div id="datatable">

    <script>
        var table = RDynamicDataTable({
            "DataURL" : "{$baseurl}/biobanking/?format=json",
            "getFormattedCell" : formatColumn,
            "freezeColumn" : "subject_id"
        });

        React.render(table, document.getElementById("datatable"));
    </script>
</div>