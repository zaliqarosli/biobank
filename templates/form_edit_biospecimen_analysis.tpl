<script type="text/javascript" src="{$baseurl}/js/invalid_form_scroll.js"></script>

<form method="post" name="edit_biospecimen">
        {if $form.errors}
        <div class="alert alert-danger" role="alert">
            The form you submitted contains data entry errors
        </div>
        {/if}

        <div class="panel panel-default">

            <div class="panel-heading" id="panel-main-heading">
                <p>Edit Analysis Data for Biospecimen {$biospecimenId}</p>
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
                        <th class="col-xs-2 info">{$form.analysis_type.label}</th><td class="col-xs-2">{$form.analysis_type.html}</td>
                    </tr>
                    <tr>
                        <th class="col-xs-2 info">{$form.experimental_name.label}</th><td class="col-xs-2">{$form.experimental_name.html}</td>
                    </tr>
                    <tr>
                        <th class="col-xs-2 info">{$form.technical_batch_num.label}</th><td class="col-xs-2">{$form.technical_batch_num.html}</td>
                    </tr>
                    <tr>
                        <th class="col-xs-2 info">{$form.sample_name.label}</th><td class="col-xs-2">{$form.sample_name.html}</td>
                    </tr>
                    <tr>
                        <th class="col-xs-2 info">{$form.chip_position.label}</th><td class="col-xs-2">{$form.chip_position.html}</td>
                    </tr>
                    <tr>
                        <th class="col-xs-2 info">{$form.sentrix_id.label}</th><td class="col-xs-2">{$form.sentrix_id.html}</td>
                    </tr>
                    <tr>
                        <th class="col-xs-2 info">{$form.analysis_notes.label}</th><td class="col-xs-2">{$form.analysis_notes.html}</td>
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
                <input class="btn btn-sm btn-primary col-xs-12" onclick="location.href='{$baseurl}/biobanking/?submenu=biospecimen_analysis&biospecimen_id={$biospecimen_id}'" value="Back" type="button" />
            </div>
        </div>
</form>
