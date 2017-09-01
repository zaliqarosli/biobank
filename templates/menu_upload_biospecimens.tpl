<script>
    {if $errors}
    $(document).ready(
        function() {
            var errors = [];
            {foreach from=$errors item=error}
            errors.push("{$error}");
            {/foreach}
            $('textarea[name=uploadStatusTextArea]').val(errors.join("\n"));
        }
    );
    {/if}
</script>

    <div id="tabs">
        <ul class="nav nav-tabs">
            <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?reset=true">Search by PSCID</a></li>
            <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?submenu=biospecimen_search&reset=true">Search by Specimen</a></li>
            {if $create_biobanking}
                <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?submenu=addBiospecimen">Add Specimen</a></li>
            {/if}
            <li class="statsTab active"><a class="statsTabLink" id="onLoad"><strong>Upload Specimens</strong></a></li>
        </ul>
        <br>
    </div>

<br>

<form method="post" name="specimen_upload" id="specimen_upload" enctype="multipart/form-data">
    <div class="row form-group form-inline col-sm-10 col-md-12">
        <label class="col-xs-3">{$form.specimenType.label}</label>{$form.specimenType.html}
    </div>

    <div class="col-sm-10 col-md-9">
        <div class="panel panel-primary">
            <div class="panel-heading">
                <div class="row">
                    <div class="col-sm-10 col-md-8">
                        Upload iSwab extractions
                    </div>
                </div>
            </div>

            <div class="panel-body" id="panel-body">
                <div class="row">
                    <div class="form-group col-sm-10 col-md-9">
                        <label class="col-sm-5 col-md-4">
                            {$form.stock.label}
                        </label>
                        <div id="file-input" class="col-sm-8 col-md-8">
                            {$form.stock.html}
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="form-group col-sm-10 col-md-9">
                        <label class="col-sm-5 col-md-4">
                            {$form.dilution.label}
                        </label>
                        <div id="file-input" class="col-sm-8 col-md-8">
                            {$form.dilution.html}
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="form-group col-sm-10 col-md-9">
                        <label class="col-sm-5 col-md-4">
                            {$form.bioanalizer.label}
                        </label>
                        <div id="file-input" class="col-sm-8 col-md-8">
                            {$form.bioanalizer.html}
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="form-group col-sm-10 col-md-12">
                        <div class="col-sm-12 col-sm-offset-5">
                            <input type="submit" name="fire_away" id="upload" value="Upload" class="btn btn-sm btn-primary submit-button" />
                        </div>
                    </div>
                </div>
            </div> <!-- panel body -->
        </div> <!- panel primary -->
    </div> <!-- closing tag for <div class="col-sm-10 col-md-8">  -->
</form>

<div class="row">
    <div class="col-sm-10 col-md-9">
        <div class="panel panel-primary">
            <div class="panel-heading">
                Upload Status
            </div>
            <div class="panel-body" id="upload_status_panel-body">
                <div class="row">
                    {$form.uploadStatusTextArea.html}
                </div>
            </div>
        </div>
    </div>
</div>

<!--  title table with pagination -->

<div id="datatable" />
<script>

    var freezers = {$freezers|json_encode};

    {if $upload_id}
    var dataUrl = "{$baseurl}/biobanking/?submenu=upload_biospecimens&upload_id={$upload_id}&format=json";
    {else}
    var dataUrl = "{$baseurl}/biobanking/?submenu=upload_biospecimens&format=json";
    {/if}

    var table = RDynamicDataTable({
        "DataURL" : dataUrl,
        "getFormattedCell" : formatColumn,
        "freezeColumn" : "Biospecimen ID"
    });

    React.render(table, document.getElementById("datatable"));
</script>

