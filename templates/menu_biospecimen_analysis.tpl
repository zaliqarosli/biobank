<!-- main table -->
<div class="row">
	{$headerTable}
</div>

<!-- Details view panel -->
<div class="panel panel-default">
	<div class="panel-heading" id="panel-main-heading">
		<p>Detailed Biospecimen Properties</p>
	</div> <!-- closing panel-heading div-->
	
    <div class="panel-body"> 
        <div id="tabs"> 
            <ul class="nav nav-tabs">
                <li class="statsTab"><a class="statsTabLink" id="onLoad" href="{$baseurl}/biobanking/?submenu=biospecimen_collection&biospecimen_id={$info[0].id}">Collection</a></li>
                <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?submenu=biospecimen_extraction&biospecimen_id={$info[0].id}">Extraction</a></li>
                <li class="statsTab active"><a class="statsTabLink"><strong>Analysis</strong></a></li>
            </ul>
        </div>
	    <div class="tab-content">
  	        <div class="tab-pane active">
			    <table class="table table-hover table-bordered header-info col-xs-12 dynamictable">
			        <tr>
				        <th class="col-xs-2 info">Barcode ID</th><td class="col-xs-2">{$info[0].id}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">PSCID</th><td class="col-xs-2">{$info[0].subject_id}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Participant Type</th><td class="col-xs-2">{$info[0].participant_type}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Date of Birth</th><td class="col-xs-2">{$info[0].dob}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Sample Type</th><td class="col-xs-2">{$info[0].sample_type}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Analysis Type</th><td class="col-xs-2">{$info[0].analysis_type}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Experimental Name</th><td class="col-xs-2">{$info[0].experimental_name}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Technical Batch Number</th><td class="col-xs-2">{$info[0].technical_batch_num}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Sample Name</th><td class="col-xs-2">{$info[0].sample_name}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Chip Position</th><td class="col-xs-2">{$info[0].chip_position}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Sentrix ID</th><td class="col-xs-2">{$info[0].sentrix_id}</td>
			        </tr>
			        <tr>
                    {if $info[0].session_id != null && $info[0].candid != null}
				        <th class="col-xs-2 info">5MC ID</th>
				        <td class="col-xs-2">
                            <a id="visitLink" href="{$baseurl}/instrument_list/?candID={$info[0].candid}&sessionID={$info[0].session_id}">{$info[0].5MC_id}</a>
                        </td>
                    {else}
				        <th class="col-xs-2 info">5MC ID</th>
				        <td class="col-xs-2">{$info[0].5MC_id}</td>
                    {/if}
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Analysis Notes</th><td class="col-xs-2">{$info[0].analysis_notes}</td>
			        </tr>
			</table>
            </div>  <!-- tab-pane -->
	    </div> <!--tab-content -->

        <center>
            <button class="btn btn-primary" onclick="location.href='{$baseurl}/biobanking/?submenu=edit_biospecimen_analysis&identifier={$info[0].id}'">Edit</button>
         </center>
         
        <br>
    </div>  <!-- panel-body -->
</div> <!--panel panel-default -->


