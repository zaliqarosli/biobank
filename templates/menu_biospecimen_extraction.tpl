<!-- main table -->
<div class="row">
	{$headerTable}
</div>

<!-- Detailed view panel -->
<div class="panel panel-default">
	<div class="panel-heading" id="panel-main-heading">
		<p>Detailed Biospecimen Properties</p>
	</div> 
	   
    <div class="panel-body"> 
        <div class="tabs">
            <ul class="nav nav-tabs">
                <li class="statsTab"><a class="statsTabLink" id="onLoad" href="{$baseurl}/biobanking/?submenu=biospecimen_collection&biospecimen_id={$info[0].id}">Collection</a></li>
                <li class="statsTab active"><a class="statsTabLink"><strong>Extraction</strong></a></li>
                <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?submenu=biospecimen_analysis&biospecimen_id={$info[0].id}">Analysis</a></li>
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
				        <th class="col-xs-2 info">Date of Extraction</th><td class="col-xs-2">{$info[0].extraction_date}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Batch Name</th><td class="col-xs-2">{$info[0].batch_name}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Protocol</th><td class="col-xs-2">{$info[0].protocol}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Elution Volume (&micro;l)</th><td class="col-xs-2">{$info[0].elution_volume}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Pass/Fail</th><td class="col-xs-2">{$info[0].pass_fail}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Lab RA</th><td class="col-xs-2">{$info[0].lab_ra}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">DNA Concentration (&eta;g/&micro;l)</th><td class="col-xs-2">{$info[0].dna_concentration}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">260/280</th><td class="col-xs-2">{$info[0].two_sixty_two_eighty}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">260/230</th><td class="col-xs-2">{$info[0].two_sixty_two_thirty}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Available Sample Volume (&micro;l)</th><td class="col-xs-2">{$info[0].available_sample_volume}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Total Volume of DNA (&eta;g)</th><td class="col-xs-2">{$info[0].dna_amount}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Shipment Date</th><td class="col-xs-2">{$info[0].shipment_date}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">&micro;l Sent to Kobar Lab</th><td class="col-xs-2">{$info[0].ul_for_kobar_lab}</td>
			        </tr>
			        <tr>
				        <th class="col-xs-2 info">Extraction Notes</th><td class="col-xs-2">{$info[0].extraction_notes}</td>
			        </tr>
			    </table>
	        </div>  <!-- tab-pane -->
	    </div> <!--closing panel-body -->

        <center>
            <button class="btn btn-primary" onclick="location.href='{$baseurl}/biobanking/?submenu=edit_biospecimen_extraction&identifier={$info[0].id}'">Edit</button>
         </center>
         
        <br>
        
    </div>  <!-- panel-body -->
</div> <!--panel panel-default -->


