import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Tabs, TabPane} from 'Tabs';

import SpecimenTab from './specimenTab';
import ContainerTab from './containerTab';
import PoolTab from './poolTab';

class BiobankFilter extends Component {
  render() {
    const specimenTab = (
      <SpecimenTab
        data={this.props.data}
        options={this.props.options}
        saveBatchEdit={this.props.saveBatchEdit}
        createPool={this.props.createPool}
        createSpecimens={this.props.createSpecimens}
        updateSpecimens={this.props.updateSpecimens}
        history={this.props.history}
        increaseCoordinate={this.props.increaseCoordinate}
      />
    );

    const containerTab = (
      <ContainerTab
        data={this.props.data}
        options={this.props.options}
        createContainers={this.props.createContainers}
        history={this.props.history}
      />
    );

    const poolTab = (
      <PoolTab
        data={this.props.data}
        options={this.props.options}
        createSpecimens={this.props.createSpecimens}
        increaseCoordinate={this.props.increaseCoordinate}
      />
    );

    const tabInfo = [];
    const tabList = [];
    if (loris.userHasPermission('biobank_specimen_view')) {
      tabInfo.push({id: 'specimens', content: specimenTab});
      tabList.push({id: 'specimens', label: 'Specimens'});
    }
    if (loris.userHasPermission('biobank_container_view')) {
      tabInfo.push({id: 'containers', content: containerTab});
      tabList.push({id: 'containers', label: 'Containers'});
    }
    if (loris.userHasPermission('biobank_pool_view')) {
      tabInfo.push({id: 'pools', content: poolTab});
      tabList.push({id: 'pools', label: 'Pools'});
    }

    const tabContent = Object.keys(tabInfo).map((key) => {
      return (
        <TabPane key={key} TabId={tabInfo[key].id}>
          {tabInfo[key].content}
        </TabPane>
      );
    });

    return (
      <div id='biobank-page'>
        <Tabs tabs={tabList} defaultTab={tabList[0].id} updateURL={true}>
          {tabContent}
        </Tabs>
      </div>
    );
  }
}

BiobankFilter.propTypes = {
  data: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
};

BiobankFilter.defaultProps = {
};

export default BiobankFilter;
