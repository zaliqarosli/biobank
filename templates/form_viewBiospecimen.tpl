<script type="text/javascript" src="{$baseurl}/js/invalid_form_scroll.js"></script>

{if $smarty.get.success && !($form.errors)}
    <div id="success-message" class="alert alert-success text-center" role="alert" style="display: block;">Biospecimen has been successfully updated.</div>
{/if}

<form method="post" name="view_biospecimen">

    {*Zepsom ID*}
    <div class="row form-group form-inline">
        <label class="col-xs-2">
            {$form.zepsom_id.label}
        </label>
        <div class="col-xs-10">
            {$form.zepsom_id.html}
        </div>
        {if $form.errors.pscid}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.pscid}</font>
            </div>
        {/if}
    </div>

    {*PSCID*}
    <div class="row form-group form-inline">
        <label class="col-xs-2">
            {$form.pscid.label}
        </label>
        <div class="col-xs-10">
            {$form.pscid.html}
        </div>
        {if $form.errors.pscid}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.pscid}</font>
            </div>
        {/if}
    </div>

    {*Date of Birth*}
    <div class="row form-group form-inline">
        <label class="col-xs-2">
            {$form.dob.label}
        </label>
        <div class="col-xs-10">
            {$form.dob.html}
        </div>
        {if $form.errors.dob}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.dob}</font>
            </div>
        {/if}
    </div>

    {*Biospecimen ID*}
    <div class="row form-group form-inline">
        <label class="col-xs-2">
            {$form.specimen_label.label}
        </label>
        <div class="col-xs-10">
            {$form.specimen_label.html}
        </div>
        {if $form.errors.specimen_label}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.specimen_label}</font>
            </div>
        {/if}
    </div>

    {*Biospecimen ID*}
    <div class="row form-group form-inline">
        <label class="col-xs-2">
            {$form.biospecimen_id.label}
        </label>
        <div class="col-xs-10">
            {$form.biospecimen_id.html}
        </div>
        {if $form.errors.biospecimen_id}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.biospecimen_id}</font>
            </div>
        {/if}
    </div>

    {*Sample Status*}
    <div class="row form-group form-inline">
        <label class="col-xs-2">
            {$form.status_id.label}
        </label>
        <div class="col-xs-10">
            {$form.status_id.html}
        </div>
        {if $form.errors.status_id}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.status_id}</font>
            </div>
        {/if}
    </div>

    {*Collection RA*}
    <div class="row form-group form-inline">
        <label class="col-xs-2">
            {$form.collection_ra_id.label}
        </label>
        <div class="col-xs-10">
            {$form.collection_ra_id.html}
        </div>
        {if $form.errors.collection_ra_id}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.collection_ra_id}</font>
            </div>
        {/if}
    </div>

    {*Collection Date*}
    <div class="row form-group form-inline">
        <label class="col-xs-2">
            {$form.collection_date.label}
        </label>
        <div class="col-xs-10">
            {$form.collection_date.html}
        </div>
        {if $form.errors.collection_date}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.collection_date}</font>
            </div>
        {/if}
    </div>

    {*Collection Time*}
    <div class="row form-group form-inline">
        <label class="col-xs-2">
            {$form.collection_time.label}
        </label>
        <div class="col-xs-10">
            {$form.collection_time.html}
        </div>
        {if $form.errors.collection_time}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.collection_time}</font>
            </div>
        {/if}
    </div>

    {*Freezer ID*}
    <div class="row form-group form-inline">
        <label class="col-xs-2">
            {$form.freezer_id.label}
        </label>
        <div class="col-xs-10">
            {$form.freezer_id.html}
        </div>
        {if $form.errors.freezer_id}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.freezer_id}</font>
            </div>
        {/if}
    </div>

    {*Box ID*}
    <div class="row form-group form-inline">
        <label class="col-xs-2">
            {$form.box_id.label}
        </label>
        <div class="col-xs-10">
            {$form.box_id.html}
        </div>
        {if $form.errors.box_id}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.box_id}</font>
            </div>
        {/if}
    </div>

    {*Box Coordinates*}
    <div class="row form-group form-inline form-inline">
        <label class="col-xs-2">
            {$form.box_coordinates.label}
        </label>
        <div class="col-xs-10">
            {$form.box_coordinates.html}
        </div>
        {if $form.errors.box_coordinates}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.box_coordinates}</font>
            </div>
        {/if}
    </div>

    {*Collection Notes*}
    <div class="row form-group form-inline form-inline">
        <label class="col-xs-2">
            {$form.collection_notes.label}
        </label>
        <div class="col-xs-10">
            {$form.collection_notes.html}
        </div>
        {if $form.errors.collection_notes}
            <div class="col-xs-offset-2 col-xs-12">
                <font class="form-error">{$form.errors.collection_notes}</font>
            </div>
        {/if}
    </div>

    {*Save and Back Button*}
    <div class="row form-group form-inline">
        {if $edit_biobanking}
            <div class="col-sm-2">
                <input id="edit-button" class="btn btn-sm btn-primary col-xs-12" name="fire_away" value="Edit" type="button" onclick="location.href='{$baseurl}/biobanking/editBiospecimen/?bid={$smarty.get.bid}';"/>
            </div>
        {/if}
        <div class="col-sm-2">
            <input class="btn btn-sm btn-primary col-xs-12" value="Back" type="button" onclick="location.href='{$baseurl}/biobanking';"/>
        </div>
    </div>

    <div><input type="hidden" id="baseurl" value="{$baseurl}"></div>
</form>
