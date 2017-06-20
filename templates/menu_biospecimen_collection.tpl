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
                <li class="statsTab active"><a class="statsTabLink" id="onLoad"><strong>Collection</strong></a></li>
                <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?submenu=biospecimen_extraction&biospecimen_id={$info[0].id}">Extraction</a></li>
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
				    <th class="col-xs-2 info">Number of Samples</th><td class="col-xs-2">{$info[0].nb_samples}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Sample Status</th><td class="col-xs-2">{$info[0].status}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Date of Collection</th><td class="col-xs-2">{$info[0].collection_date}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Collection RA</th><td class="col-xs-2">{$info[0].collection_ra}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Time</th><td class="col-xs-2">{$info[0].time}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Woke</th><td class="col-xs-2">{$info[0].woke}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Freezer</th><td class="col-xs-2">{$info[0].freezer_id}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Bag Name</th><td class="col-xs-2">{$info[0].bag_name}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Buccal Rack ID</th><td class="col-xs-2">{$info[0].buccal_rack_id}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Buccal Rack Coordinates</th><td class="col-xs-2">{$info[0].buccal_rack_coordinates}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Shelf #</th><td class="col-xs-2">{$info[0].shelf_num}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Rack #</th><td class="col-xs-2">{$info[0].rack_num}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Box Name</th><td class="col-xs-2">{$info[0].box_name}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Box Coordinates</th><td class="col-xs-2">{$info[0].box_coordinates}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Oragene Location</th><td class="col-xs-2">{$info[0].oragene_location}</td>
			    </tr>
			    <tr>
				    <th class="col-xs-2 info">Collection notes</th><td class="col-xs-2">{$info[0].collection_notes}</td>
			    </tr>
            </table>
	      </div> <!--tab-pane -->
	    </div> <!--tab-content -->
    </div>  <!--- panel-body -->
    
    <center>
        <button class="btn btn-primary" onclick="location.href='{$baseurl}/biobanking/?submenu=edit_biospecimen_collection&identifier={$info[0].id}'">Edit</button>
    </center>
    
    <br>
</div> <!--panel panel-default -->


