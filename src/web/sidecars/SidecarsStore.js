import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch, { fetchPeriodically } from 'logic/rest/FetchProvider';

import SidecarsActions from './SidecarsActions';

const SidecarsStore = Reflux.createStore({
  listenables: [SidecarsActions],
  sourceUrl: '/plugins/org.graylog.plugins.collector/collectors',
  sidecars: undefined,

  init() {
    this.trigger({ sidecars: this.sidecars });
  },

  list() {
    const promise = fetchPeriodically('GET', URLUtils.qualifyUrl('/plugins/org.graylog.plugins.collector/altcollectors'));
    promise
      .then(
        response => {
          this.sidecars = response.collectors;
          this.trigger({ sidecars: this.sidecars });

          return this.sidecars;
        },
        error => {
          UserNotification.error(`Fetching Sidecars failed with status: ${error}`,
            'Could not retrieve Sidecars');
        });
    SidecarsActions.list.promise(promise);
  },

  getSidecar(sidecarId) {
    const promise = fetchPeriodically('GET', URLUtils.qualifyUrl(`/plugins/org.graylog.plugins.collector/altcollectors/${sidecarId}`));
    promise
      .catch(
        error => {
          UserNotification.error(`Fetching Sidecar failed with status: ${error}`,
            'Could not retrieve Sidecar');
        });
    SidecarsActions.getSidecar.promise(promise);
  },

  restartCollector(sidecarId, collector) {
    const action = {};
    action.backend = collector;
    action.properties = {};
    action.properties.restart = true;
    const promise = fetch('PUT', URLUtils.qualifyUrl(`${this.sourceUrl}/${sidecarId}/action`), [action]);
    promise
      .catch(
        error => {
          UserNotification.error(`Restarting Sidecar failed with status: ${error}`,
            'Could not restart Sidecar');
        });
    SidecarsActions.restartCollector.promise(promise);
  },

  getSidecarActions(sidecarId) {
    const promise = fetchPeriodically('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/${sidecarId}/action`));
    promise
      .catch(
        error => {
          UserNotification.error(`Fetching Sidecar actions failed with status: ${error}`,
            'Could not retrieve Sidecar actions');
        });
    SidecarsActions.getSidecarActions.promise(promise);
  },

  assignConfigurations(sidecars, configurations) {
    const body = { assignments: [] };
    sidecars.forEach((sidecar) => {
      configurations.forEach((configuration) => {
        body.assignments.push({
          node_id: sidecar.node_id,
          backend_id: configuration.backend_id,
          configuration_id: configuration.id,
        });
      });
    });

    const promise = fetch('PUT', URLUtils.qualifyUrl('/plugins/org.graylog.plugins.collector/altcollectors/configurations'), body)
      .then(
        (response) => {
          UserNotification.success('Collectors will change their configurations shortly.',
            `Configuration change for ${sidecars.length} collectors requested`);
          this.list();
          return response;
        },
        (error) => {
          UserNotification.error(`Fetching Sidecar actions failed with status: ${error}`,
            'Could not retrieve Sidecar actions');
        },
      );
    SidecarsActions.assignConfigurations.promise(promise);
  },
});

export default SidecarsStore;
