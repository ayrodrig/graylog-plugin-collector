import React from 'react';
import Reflux from 'reflux';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import naturalSort from 'javascript-natural-sort';

import { Spinner } from 'components/common';

import SidecarsStore from './SidecarsStore';
import SidecarsActions from './SidecarsActions';
import SidecarRow from './SidecarRow';
import SidecarFilter from './SidecarFilter';

const SidecarList = React.createClass({
  mixins: [Reflux.connect(SidecarsStore)],

  getInitialState() {
    return {
      sidecars: undefined,
      filteredRows: undefined,
      sortBy: 'node_name',
      sortDesc: false,
      sort: (sidecar) => sidecar.node_id,
      showInactive: false,
    };
  },
  componentDidMount() {
    this.style.use();
    this._reloadSidecars();
    this.interval = setInterval(this._reloadSidecars, this.SIDECAR_DATA_REFRESH);
  },
  componentWillUnmount() {
    this.style.unuse();
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  style: require('!style/useable!css!styles/SidecarStyles.css'),
  SIDECAR_DATA_REFRESH: 5 * 1000,

  _reloadSidecars() {
    SidecarsActions.list();
  },
  _bySortField(sidecar1, sidecar2) {
    const sort = this.state.sort;
    const field1 = sort(sidecar1);
    const field2 = sort(sidecar2);
    return (this.state.sortDesc ? naturalSort(field2, field1) : naturalSort(field1, field2));
  },
  _getTableHeaderClassName(field) {
    return (this.state.sortBy === field ? (this.state.sortDesc ? 'sort-desc' : 'sort-asc') : 'sortable');
  },
  _formatSidecarList(sidecars) {
    return (
      <div className="table-responsive">
        <table className="table table-striped sidecars-list">
          <thead>
          <tr>
            <th className={this._getTableHeaderClassName('node_name')} onClick={this.sortByNodeName}>Name</th>
            <th className={this._getTableHeaderClassName('sidecar_status')} onClick={this.sortBySidecarStatus}>
              Status
            </th>
            <th className={this._getTableHeaderClassName('operating_system')} onClick={this.sortByOperatingSystem}>
              Operating System
            </th>
            <th className={this._getTableHeaderClassName('last_seen')} onClick={this.sortByLastSeen}>Last Seen</th>
            <th className={this._getTableHeaderClassName('node_id')} onClick={this.sortByNodeID}>
              Node Id
            </th>
            <th className={this._getTableHeaderClassName('sidecar_version')} onClick={this.sortBySidecarVersion}>
              Sidecar Version
            </th>
            <th className="actions">&nbsp;</th>
          </tr>
          </thead>
          <tbody>
          {sidecars}
          </tbody>
        </table>
      </div>
    );
  },
  toggleShowInactive() {
    this.setState({ showInactive: !this.state.showInactive });
  },
  sortByNodeId() {
    this.setState({
      sortBy: 'node_id',
      sortDesc: this.state.sortBy === 'node_id' && !this.state.sortDesc,
      sort: (sidecar) => {
        return sidecar.node_id;
      },
    });
  },
  sortByNodeName() {
    this.setState({
      sortBy: 'node_name',
      sortDesc: this.state.sortBy === 'node_name' && !this.state.sortDesc,
      sort: (sidecar) => {
        return sidecar.node_name;
      },
    });
  },
  sortByOperatingSystem() {
    this.setState({
      sortBy: 'operating_system',
      sortDesc: this.state.sortBy === 'operating_system' && !this.state.sortDesc,
      sort: (sidecar) => {
        return sidecar.node_details.operating_system;
      },
    });
  },
  sortByLastSeen() {
    this.setState({
      sortBy: 'last_seen',
      sortDesc: this.state.sortBy === 'last_seen' && !this.state.sortDesc,
      sort: (sidecar) => {
        return sidecar.last_seen;
      },
    });
  },
  sortBySidecarVersion() {
    this.setState({
      sortBy: 'sidecar_version',
      sortDesc: this.state.sortBy === 'sidecar_version' && !this.state.sortDesc,
      sort: (sidecar) => {
        return sidecar.collector_version;
      },
    });
  },
  sortBySidecarStatus() {
    this.setState({
      sortBy: 'sidecar_status',
      sortDesc: this.state.sortBy === 'sidecar_status' && !this.state.sortDesc,
      sort: (sidecar) => {
        if (sidecar.status) {
          return sidecar.status.status;
        } else {
          return null;
        }
      },
    });
  },
  _formatEmptyListAlert() {
    const showInactiveHint = (this.state.showInactive ? null : ' and/or click on "Include inactive sidecars"');
    return <Alert>There are no sidecars to show. Try adjusting your search filter{showInactiveHint}.</Alert>;
  },
  _onFilterChange(filteredRows) {
    this.setState({ filteredRows });
  },
  _isLoading() {
    return !this.state.sidecars;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const sidecars = (this.state.filteredRows || this.state.sidecars)
      .filter((sidecar) => {
        return (this.state.showInactive || sidecar.active);
      })
      .sort(this._bySortField)
      .map((sidecar) => {
        return <SidecarRow key={sidecar.node_id} sidecar={sidecar} />;
      });

    const showOrHideInactive = (this.state.showInactive ? 'Hide' : 'Include');

    const sidecarList = (sidecars.length > 0 ? this._formatSidecarList(sidecars) : this._formatEmptyListAlert());

    return (
      <Row>
        <Col md={12}>
          <div className="pull-right">
            <Button bsStyle="primary" bsSize="small" onClick={this.toggleShowInactive}>
              {showOrHideInactive} inactive sidecars
            </Button>
          </div>
          <div className="form-inline sidecars-filter-form">
            <SidecarFilter label="Filter sidecars"
                             data={this.state.sidecars}
                             filterBy={'tags'}
                             displayKey={'tags'}
                             searchInKeys={['id', 'name', 'operating_system', 'tags', 'status']}
                             onDataFiltered={this._onFilterChange} />
          </div>
          {sidecarList}
        </Col>
      </Row>
    );
  },
});

export default SidecarList;