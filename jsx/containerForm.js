import React, {Component} from 'react';

import Modal from 'Modal';
import {ListForm, ListItem} from './listForm.js';
import {clone, mapFormOptions} from './helpers.js';

/**
 * Biobank Container Form
 *
 * Fetches data from Loris backend and displays a form allowing
 * to specimen a biobank file attached to a specific instrument
 * */
class BiobankContainerForm extends Component {
  constructor() {
    super();
    this.state = {
      current: {},
      list: {},
      errors: {list: {}},
    };

    this.setCurrent = this.setCurrent.bind(this);
    this.setList = this.setList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  setCurrent(name, value) {
    const {current} = clone(this.state);
    current[name] = value;
    this.setState({current});
  }

  setList(list) {
    this.setState({list});
  }

  handleSubmit() {
    const {list, current, errors} = this.state;
    return this.props.onSubmit(list, current, errors)
    .catch((errors) => {
      this.setState({errors});
      return Promise.reject();
    })
    .then(() => Promise.resolve());
  }

  render() {
    const {current, errors, list} = this.state;
    const {options} = this.props;
    return (
      <Modal
        title='Add New Container'
        show={this.props.show}
        onClose={this.props.onClose}
        onSubmit={this.handleSubmit}
        throwWarning={true}
      >
        <FormElement>
          <div className="row">
            <div className="col-xs-11">
              <SelectElement
                name="projectIds"
                label="Project"
                options={options.projects}
                onUserInput={this.setCurrent}
                required={true}
                multiple={true}
                emptyOption={false}
                value={current.projectIds}
                errorMessage={(errors.container||{}).projectIds}
              />
              <SelectElement
                name="centerId"
                label="Site"
                options={options.centers}
                onUserInput={this.setCurrent}
                required={true}
                value={current.centerId}
                errorMessage={(errors.container||{}).centerId}
              />
            </div>
          </div>
          <ListForm
            list={list}
            errors={errors.list}
            setList={this.setList}
            listItem={{}}
          >
            <ContainerSubForm options={options}/>
          </ListForm>
        </FormElement>
      </Modal>
    );
  }
}

BiobankContainerForm.propTypes = {
};

/**
 * Container Barcode Form
 *
 * Acts a subform for ContainerForm
 **/
class ContainerSubForm extends Component {
  constructor() {
    super();

    this.setContainer = this.setContainer.bind(this);
  }

  setContainer(name, value) {
    this.props.setListItem(name, value, this.props.ItemKey);
  }

  render() {
    const {item, errors, options} = this.props;

    const containerTypesNonPrimary = mapFormOptions(
      options.container.typesNonPrimary, 'label'
    );
    return (
      <ListItem {...this.props}>
        <TextboxElement
          name='barcode'
          label='Barcode'
          onUserInput={this.setContainer}
          required={true}
          value={item.barcode}
          errorMessage={errors.barcode}
        />
        <SelectElement
          name='typeId'
          label='Container Type'
          options={containerTypesNonPrimary}
          onUserInput={this.setContainer}
          required={true}
          value={item.typeId}
          errorMessage={errors.typeId}
        />
        <TextboxElement
          name='lotNumber'
          label='Lot Number'
          onUserInput={this.setContainer}
          value={item.lotNumber}
          errorMessage={errors.lotNumber}
        />
        <DateElement
          name='expirationDate'
          label='Expiration Date'
          onUserInput={this.setContainer}
          value={item.expirationDate}
          errorMessage={errors.expirationDate}
        />
      </ListItem>
    );
  }
}

ContainerSubForm.propTypes = {
};

ContainerSubForm.defaultProps = {
};

export default BiobankContainerForm;
