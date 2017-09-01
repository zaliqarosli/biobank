<!-- TODO: move this into javascript files? -->
{literal}
<script type="text/javascript">
    $(document).ready(function(){
        $("#cand").DynamicTable({ "freezeColumn" : "pscid" });
        
        $('input[name=dob]').datepicker({
  			yearRange: 'c-70:c',
            dateFormat: 'dd-M-yy',
            changeMonth: true,
            changeYear: true
        });
        
        $('input[name=collectionDate]').datepicker({
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
		var pscids = $("textarea[name='pscId']").val();
		if(!pscids.match(/^\s*([\w-]+)?(\s+[\w-]+)*\s*$/)) {
			document.getElementById('error_message').innerHTML = 
			    '<font color="red">&nbsp;&nbsp;&nbsp;Invalid PSCIDs. Please enter a list of pscids separated by spaces or leave this field blank</font>';
			return false;
		} 
		
		var dob = $("input[name='dob']").val();
		if(!dob.match(/^\s*$/) 
		   && !dob.match(/^\s*(\d|\d\d)-(Jan|Feb|Mar|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d\d\d\d\s*$/i)) {
			document.getElementById('error_message').innerHTML = 
			    '<font color="red">&nbsp;&nbsp;&nbsp;The Date of birth should be in the form "dd-AbbreviatedMonth-YYYY" (e.g 03-Jul-2011, 11-Nov-2013, etc...)</font>';
			return false;
		} 
		
		var doc = $("input[name='collectionDate']").val();
		if(!doc.match(/^\s*$/) 
		   && !doc.match(/^\s*(\d|\d\d)-(Jan|Feb|Mar|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d\d\d\d\s*$/i)) {
			document.getElementById('error_message').innerHTML = 
			    '<font color="red">&nbsp;&nbsp;&nbsp;The Date of collection should be in the form "dd-AbbreviatedMonth-YYYY" (e.g 03-Jul-2011, 11-Nov-2013, etc...)</font>';
			return false;
		} 

		var doe = $("input[name='extractionDate']").val();
		if(!doe.match(/^\s*$/) 
		   && !doe.match(/^\s*(\d|\d\d)-(Jan|Feb|Mar|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d\d\d\d\s*$/i)) {
			document.getElementById('error_message').innerHTML = 
			    '<font color="red">&nbsp;&nbsp;&nbsp;The Date of extraction should be in the form "dd-AbbreviatedMonth-YYYY" (e.g 03-Jul-2011, 11-Nov-2013, etc...)</font>';
			return false;
		} 

		document.getElementById('error_message').innerHTML = '';
		return true;
	}
</script>

    <div id="tabs"> 
        <ul class="nav nav-tabs">
            <li class="statsTab"><a class="statsTabLink" id="onLoad" href="{$baseurl}/biobanking/?reset=true">Search by PSCID</a></li>
            <li class="statsTab active"><a class="statsTabLink"><strong>Search by Specimen</strong></a></li>
            {if $create_biobanking}
            <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?submenu=addBiospecimen">Add Specimen</a></li>
            {/if}
            {if $upload_biobanking}
            <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?submenu=upload_biospecimens">Upload Specimens</a></li>
            {/if}
        </ul>
        <br>
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
    <!-- TODO: change this to 'pretty URL' scheme -->
        <form method="post" action="{$baseurl}/biobanking/?submenu=biospecimen_search">
			<div class="row">
                    &nbsp;&nbsp;&nbsp;&nbsp;<label id="error_message"></label>
            </div>
            
            <div class="row">

                <div class="form-group col-sm-4">
                    <label class="col-sm-12 col-md-4">
                        {$form.biospecimenId.label}
                    </label>
                    <div class="col-sm-12 col-md-8">
                        {$form.biospecimenId.html}
                    </div>
                </div>

                <div class="form-group col-sm-4">
                    <label class="col-sm-12 col-md-4">
                        {$form.zepsomId.label}
                    </label>
                    <div class="col-sm-12 col-md-8">
                        {$form.zepsomId.html}
                    </div>
                </div>

                <div class="form-group col-sm-4">
                    <label class="col-sm-12 col-md-4">
                        {$form.dob.label}
                    </label>
                    <div class="col-sm-12 col-md-8">
                        {$form.dob.html}
                    </div>
                </div>
            </div>

            <div class="row">


                <div class="form-group col-sm-4">
                    <label class="col-sm-12 col-md-4">
                        {$form.sampleType.label}
                    </label>
                    <div class="col-sm-12 col-md-8">
                        {$form.sampleType.html}
                    </div>
                </div>


                <div class="form-group col-sm-4">
                    <label class="col-sm-12 col-md-4">
                        {$form.collectionDate.label}
                    </label>
                    <div class="col-sm-12 col-md-8">
                        {$form.collectionDate.html}
                    </div>
                </div>
            </div> <!-- End second row -->
            
            <!-- Note: this is currently hidden -->
            <div class="advancedOptions" id="advanced-options" style="display:none">
                <div class="row">
                    <div class="form-group col-sm-4">
                       <label class="col-sm-12 col-md-4">
                        {$form.parent_id.label}
                    </label>
                    <div class="col-sm-12 col-md-8">
                        {$form.parent_id.html}
                    </div>
                  </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.Participant_Status.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.Participant_Status.html}
                        </div>
                    </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.exp_date.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.exp_date.html}
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.gender.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.gender.html}
                        </div>
                    </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.Visit_Count.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.Visit_Count.html}
                        </div>
                    </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.edc.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.edc.html}
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.Latest_Visit_Status.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.Latest_Visit_Status.html}
                        </div>
                    </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            &nbsp;
                        </label>
                        <div class="col-sm-12 col-md-8">
                            &nbsp;
                        </div>
                    </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.Feedback.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.Feedback.html}
                        </div>
                    </div>
                </div>
            </div>
            <br class="visible-xs">
            <div id="advanced-buttons">
                <!-- <div class="form-group col-sm-6 col-sm-offset-6"> -->
                        <!-- <div class="col-sm-6"> -->
                            <div class="col-sm-4 col-md-3 col-xs-12 col-md-offset-3">
                                <input type="submit" name="filter" value="Apply Filters" id="showdata_advanced_options" class="btn btn-sm btn-primary col-xs-12"  onClick="return validateForm();"/>
                            </div>

                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="col-sm-4 col-md-3 col-xs-12">
                                <input type="button" name="reset" value="Clear Active Filters" class="btn btn-sm btn-primary col-xs-12" onclick="location.href='{$baseurl}/biobanking/?submenu=biospecimen_search&reset=true'" />
                            </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                        <!-- </div> -->
                    <!-- </div> -->
            </div>
        </form>
    </div>
</div>
</div>
<!-- TODO: Is this necessary? Should be biobanking always....?? -->
{if not $biobanking}
<div class="col-sm-3">
    <div class="panel panel-primary">
    <div class="panel-heading" onclick="hideFilter(this)">
        Open Profile
        <span class="glyphicon arrow glyphicon-chevron-up pull-right"></span>
    </div>
    <div class="panel-body" id="panel-body">
    <form class="form-horizontal" id="biobankingForm" name="biobankingForm" method="get" action="main.php">
        <input type="hidden" name="test_name" value="timepoint_list">
        <div class="form-group col-sm-12">
            <label class="col-sm-12 col-md-4">
                {$form.candID.label}
            </label>
            <div class="col-sm-12 col-md-8">
                {$form.candID.html}
            </div>
        </div>
        <div class="form-group col-sm-12">
            <label class="col-sm-12 col-md-4">
                 {$form.PSCID.label}
            </label>
            <div class="col-sm-12 col-md-8">
                 {$form.PSCID.html}
            </div>
        </div>
        <input type="submit" value="Open Profile" class="btn btn-sm btn-primary col-md-5 col-sm-12 col-md-offset-5">
    </form>
   </div>
</div> <!--closing col-sm-3 tag -->
</div>
{/if}
</div>


<div id="datatable" />
<script>
  var table = RDynamicDataTable({
      "DataURL" : "{$baseurl}/biobanking/?submenu=biospecimen_search&format=json",
      "getFormattedCell" : formatColumn,
      "freezeColumn" : "id"
  });

  React.render(table, document.getElementById("datatable"));
</script>
