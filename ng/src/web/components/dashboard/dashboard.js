/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import {is_defined} from 'gmp/utils.js';
import logger from 'gmp/log.js';
import PromiseFactory from 'gmp/promise.js';

import PropTypes from '../../utils/proptypes.js';
import compose from '../../utils/compose.js';
import withCache from '../../utils/withCache.js';
import withGmp from '../../utils/withGmp.js';

import DashboardClass from './legacy/dashboard.js';

import './css/dashboard.css';

const log = logger.getLogger('web.dashboard.dashboard');

class Dashboard extends React.Component {

  constructor(...args) {
    super(...args);

    const {id = 'dashboard'} = this.props;

    this.dashboard = new DashboardClass(id, undefined, {
      config_pref_id: this.props.configPrefId,
      default_heights_string: '280',
      default_controllers_string: this.props.defaultControllersString,
      default_controller_string: this.props.defaultControllerString,
      hide_filter_select: this.props.hideFilterSelect,
      max_components: this.props.maxComponents,
      dashboard_controls: '#dashboard-controls',
    });

    this.state = {
      initialized: false,
      id,
    };

    this.onConfigSaved = this.onConfigSaved.bind(this);
  }

  getChildContext() {
    return {
      dashboard: this.dashboard,
    };
  }

  componentDidMount() {
    const {gmp, usersettingsCache: cache, configPrefId: pref_id} = this.props;
    const {dashboard} = this;

    const promises = [
      gmp.user.currentChartPreferences({cache}),
    ];

    if (!this.props.hideFilterSelect) {
      promises.push(gmp.filters.getAll());
    }

    PromiseFactory.all(promises).then(([prefresp, filtersresp]) => {
      const filters = is_defined(filtersresp) ? filtersresp.data : [];

      const prefs = prefresp.data;
      const pref = prefs.get(pref_id);

      filters.forEach(filter =>
        dashboard.addFilter(filter.id, filter.name, filter.term, filter.type)
      );

      if (!is_defined(pref)) {
        log.warn('No dashboard preference config found for id', pref_id);
      }

      dashboard.setConfig(pref);

      dashboard.init();
      dashboard.initDisplays();
      dashboard.onConfigSaved = this.onConfigSaved;

      this.setState({initialized: true});
    });
  }

  onConfigSaved() {
    const {gmp, usersettingsCache: cache} = this.props;
    // override cache with current saved config
    // this is a bit "hackish" and should be obsolete when dashboards are
    // completely converted to react and gmp api
    gmp.user.currentChartPreferences({cache, force: true});
  }

  reload() {
    this.dashboard.reload();
  }

  render() {
    const {id} = this.state;
    return (
      <div className="dashboard">
        <div id={id}></div>
        {this.props.children}
      </div>
    );
  }
}

Dashboard.childContextTypes = {
  dashboard: PropTypes.object,
};

Dashboard.propTypes = {
  configPrefId: PropTypes.id,
  defaultControllerString: PropTypes.string,
  defaultControllersString: PropTypes.string,
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  hideFilterSelect: PropTypes.bool,
  id: PropTypes.id,
  maxComponents: PropTypes.numberOrNumberString,
  usersettingsCache: PropTypes.cache.isRequired,
};

export default compose(
  withCache({usersettingsCache: 'usersettings'}),
  withGmp,
)(Dashboard);

// vim: set ts=2 sw=2 tw=80:
