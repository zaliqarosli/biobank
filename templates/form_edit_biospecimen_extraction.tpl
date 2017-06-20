<script type="text/javascript" src="{$baseurl}/js/invalid_form_scroll.js"></script>

<script type="text/javascript">
$(function(){
        $('input[name=extraction_date]').datepicker({
  			yearRange: 'c-70:c+10',
            dateFormat: 'dd-M-yy',
            changeMonth: true,
            changeYear: true
        });

        $('input[name=shipment_date]').datepicker({
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
   	        {if $k eq 'extraction_date'}
	        <br>&nbsp;<b>Extraction Date</b>: {$error}
	        {elseif $k eq 'shipment_date'}}
	        <br>&nbsp;<b>Shipment Date</b>: {$error}
	        {else}
	        <br>&nbsp;<b>{$k}</b>: {$error}
	        {/if}
        {/foreach}
    </div>
    {/if}
    <div class="panel panel-default">

        <div class="panel-heading" id="panel-main-heading">
	    <p>Edit Extraction Data for Biospecimen {$biospecimenId}</p>
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
					{if $form.errors.extraction_date}
                    <th class="col-xs-2 info"><font color="red">{$form.extraction_date.label}</font></th>
					{else}
                    <th class="col-xs-2 info">{$form.extraction_date.label}</th>
                    {/if}
                    <td class="col-xs-2">{$form.extraction_date.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.batch_name.label}</th><td class="col-xs-2">{$form.batch_name.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.protocol.label}</th><td class="col-xs-2">{$form.protocol.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.elution_volume.label}</th><td class="col-xs-2">{$form.elution_volume.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.pass_fail.label}</th><td class="col-xs-2">{$form.pass_fail.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.lab_ra_id.label}</th><td class="col-xs-2">{$form.lab_ra_id.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.dna_concentration.label}</th><td class="col-xs-2">{$form.dna_concentration.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.two_sixty_two_eighty.label}</th><td class="col-xs-2">{$form.two_sixty_two_eighty.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.two_sixty_two_thirty.label}</th><td class="col-xs-2">{$form.two_sixty_two_thirty.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.available_sample_volume.label}</th><td class="col-xs-2">{$form.available_sample_volume.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.dna_amount.label}</th><td class="col-xs-2">{$form.dna_amount.html}</td>
                </tr>
                <tr>
					{if $form.errors.shipment_date}
                    <th class="col-xs-2 info"><font color="red">{$form.shipment_date.label}</font></th>
					{else}
                    <th class="col-xs-2 info">{$form.shipment_date.label}</th>
                    {/if}
                    <td class="col-xs-2">{$form.shipment_date.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.ul_for_kobar_lab.label}</th><td class="col-xs-2">{$form.ul_for_kobar_lab.html}</td>
                </tr>
                <tr>
                    <th class="col-xs-2 info">{$form.extraction_notes.label}</th><td class="col-xs-2">{$form.extraction_notes.html}</td>
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
          <input class="btn btn-sm btn-primary col-xs-12" onclick="location.href='{$baseurl}/biobanking/?submenu=biospecimen_extraction&biospecimen_id={$biospecimenId}'" value="Back" type="button" />
       </div>
    </div>
</form>
