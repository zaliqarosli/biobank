<script type="text/javascript" src="{$baseurl}/js/invalid_form_scroll.js"></script>

<script type="text/javascript">
$(function(){
        $('input[name=collection_date]').datepicker({
  			yearRange: 'c-70:c+10',
            dateFormat: 'dd-M-yy',
            changeMonth: true,
            changeYear: true
        });
});
</script>

<form method="post" name="edit_biospecimen">
    {if $form.errors}
    <div class="alert alert-danger" role="alert">
        The form you submitted contains data entry errors:
   	    {foreach from=$form.errors item=error key=k}
   	        {if $k eq 'collection_date'}
	        <br>&nbsp;<b>Collection Date</b>: {$error}
	        {else}
	        <br>&nbsp;<b>{$k}</b>: {$error}
	        {/if}
        {/foreach}
    </div>
    {/if}
    <div class="panel panel-default">

        <div class="panel-heading" id="panel-main-heading">
            <p>Edit Collection Data for Biospecimen {$biospecimenId}</p>
        </div> <!-- closing panel-heading div-->

        <div class="panel-body">
            <table class="table col-xs-12">
                <tr>
                    <th class="col-xs-2 info">{$form.id.label}</th><td class="col-xs-2">{$form.id.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.pscid.label}</th><td class="col-xs-2">{$form.pscid.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.participant_type.label}</th><td class="col-xs-2">{$form.participant_type.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.dob.label}</th><td class="col-xs-2">{$form.dob.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.type_id.label}</th><td class="col-xs-2">{$form.type_id.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.nb_samples.label}</th><td class="col-xs-2">{$form.nb_samples.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.status_id.label}</th><td class="col-xs-2">{$form.status_id.html}</td>
                </tr>
                <tr>
					{if $form.errors.collection_date}
                    <th class="col-xs-2 info"><font color="red">{$form.collection_date.label}</font></th>
					{else}
                    <th class="col-xs-2 info">{$form.collection_date.label}</th>
                    {/if}
                    <td class="col-xs-2">{$form.collection_date.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.collection_ra_id.label}</th><td class="col-xs-2">{$form.collection_ra_id.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.time.label}</th><td class="col-xs-2">{$form.time.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.woke.label}</th><td class="col-xs-2">{$form.woke.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.freezer_id.label}</th><td class="col-xs-2">{$form.freezer_id.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.bag_name.label}</th><td class="col-xs-2">{$form.bag_name.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.buccal_rack_id.label}</th><td class="col-xs-2">{$form.buccal_rack_id.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.buccal_rack_coordinates.label}</th><td class="col-xs-2">{$form.buccal_rack_coordinates.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.shelf_num.label}</th><td class="col-xs-2">{$form.shelf_num.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.rack_num.label}</th><td class="col-xs-2">{$form.rack_num.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.box_name.label}</th><td class="col-xs-2">{$form.box_name.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.box_coordinates.label}</th><td class="col-xs-2">{$form.box_coordinates.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.oragene_location.label}</th><td class="col-xs-2">{$form.oragene_location.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.collection_notes.label}</th><td class="col-xs-2">{$form.collection_notes.html}</td>
                </tr>
            </table>
        </div>
    </div>
      
    <div class="row form-group form-inline">
        <div class="col-sm-2">
            <input class="btn btn-sm btn-primary col-xs-12" name="fire_away" value="Save" type="submit" />
        </div>
        <div class="col-sm-2">
            <input class="btn btn-sm btn-primary col-xs-12" value="Reset" type="reset" />
        </div>
        <div class="col-sm-2">
            <input class="btn btn-sm btn-primary col-xs-12" onclick="location.href='{$baseurl}/biobanking/?submenu=biospecimen_collection&biospecimen_id={$biospecimenId}'" value="Back" type="button" />
        </div>
    </div>

</form>
