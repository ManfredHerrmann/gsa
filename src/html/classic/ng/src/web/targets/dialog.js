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

import {autobind, extend} from '../../utils.js';
import _ from '../../locale.js';
import logger from '../../log.js';

import Layout from '../layout.js';

import Dialog from '../dialog/dialog.js';

import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import FileField from '../form/filefield.js';
import YesNoRadio from '../form/yesnoradio.js';
import Radio from '../form/radio.js';
import Select2 from '../form/select2.js';

import NewIcon from '../icons/newicon.js';

import {SSH_CREDENTIAL_TYPES, SMB_CREDENTIAL_TYPES, ESXI_CREDENTIAL_TYPES,
  SNMP_CREDENTIAL_TYPES, USERNAME_PASSWORD_CREDENTIAL_TYPE,
  ssh_credential_filter, snmp_credential_filter,
} from '../../gmp/models/credential.js';

import CredentialsDialog from '../credentials/dialog.js';
import PortListsDialog from '../portlists/dialog.js';

import PromiseFactory from '../../gmp/promise.js';

const log = logger.getLogger('web.targets.dialog');

const DEFAULT_PORT_LIST_ID = 'c7e03b6c-3bbe-11e1-a057-406186ea4fc5';
const ALIVE_TESTS_DEFAULT = 'Scan Config Default';

export class TargetDialog extends Dialog {

  constructor(...args) {
    super(...args);

    autobind(this, 'on');
  }

  defaultState() {
    return extend(super.defaultState(), {
      error: undefined,
      visible: false,
      width: 800,
      credentials: [],
      port_lists: [],
      comment: '',
      target_source: 'manual',
      reverse_lookup_only: 0,
      reverse_lookup_unify: 0,
      port_list_id: DEFAULT_PORT_LIST_ID,
      port: 22,
      alive_tests: ALIVE_TESTS_DEFAULT,
      ssh_credential_id: 0,
      smb_credential_id: 0,
      esxi_credential_id: 0,
      snmp_credential_id: 0,
      title: this.props.title,
    });
  }

  show() {
    this.loadData();
  }

  loadData() {
    let {gmp} = this.context;

    // load all data and show dialog after data is loaded

    PromiseFactory.all([
      gmp.portlists.get(),
      gmp.credentials.get(),
    ]).then(([port_lists, credentials]) => {
      this.setState({
        error: undefined,
        name: _('unnamed'),
        visible: true,
        port_lists,
        credentials,
      });
    });
  }

  save() {
    let {gmp} = this.context;
    return gmp.target.create(this.state).then(target => {
      this.close();
      return target;
    }, xhr => {
      this.showErrorMessage(xhr.action_result.message);
      throw new Error('Target creation failed. Reason: ' +
        xhr.action_result.message);
    });
  }

  onAddCredential(credential) {
    let {credentials} = this.state;

    credentials.push(credential);
    let state = {credentials};
    state[this.cred_id_field] = credential.id;
    log.debug('adding credential', state);
    this.setState(state);
  }

  onAddPortList(portlist) {
    let {port_lists} = this.state;

    port_lists.push(portlist);
    log.debug('adding port list', port_lists, portlist);
    this.setState({port_lists, port_list_id: portlist.id});
  }

  showCredentialsDialog(which) {
    let types;
    let title;
    switch (which) {
      case 'ssh':
        this.cred_id_field = 'ssh_credential_id';
        types = SSH_CREDENTIAL_TYPES;
        title = _('Create new SSH credential');
        break;
      case 'smb':
        this.cred_id_field = 'smb_credential_id';
        title = _('Create new SMB credential');
        types = SMB_CREDENTIAL_TYPES;
        break;
      case 'esxi':
        this.cred_id_field = 'esxi_credential_id';
        title = _('Create new ESXi credential');
        types = ESXI_CREDENTIAL_TYPES;
        break;
      case 'snmp':
        this.cred_id_field = 'snmp_credential_id';
        title = _('Create new SNMP credential');
        types = SNMP_CREDENTIAL_TYPES;
        break;
      default:
        break;

    }
    this.credentials_dialog.show(types, title);
  }

  renderContent() {
    let {name, comment, hosts, target_source, exclude_hosts,
      reverse_lookup_only, reverse_lookup_unify, port_lists,
      port_list_id, alive_tests, port, credentials, ssh_credential_id,
      smb_credential_id, esxi_credential_id, snmp_credential_id} = this.state;
    let {capabilities} = this.context;

    let ssh_credentials = credentials.filter(ssh_credential_filter);
    let up_credentials = credentials.filter(value =>
      value.type === USERNAME_PASSWORD_CREDENTIAL_TYPE);
    let snmp_credentials = credentials.filter(snmp_credential_filter);

    let port_list_opts = this.renderOptions(port_lists);

    let ssh_credential_opts = this.renderOptions(ssh_credentials, 0);
    let smb_credential_opts = this.renderOptions(up_credentials, 0);
    let esxi_credential_opts = this.renderOptions(up_credentials, 0);
    let snmp_credential_opts = this.renderOptions(snmp_credentials, 0);

    return (
      <Layout flex="column">

        <FormGroup title={_('Name')}>
          <TextField name="name"
            grow="1"
            value={name} size="30"
            onChange={this.onValueChange}
            maxLength="80"/>
        </FormGroup>

        <FormGroup title={_('Comment')} flex="column">
          <TextField name="comment" value={comment}
            size="30" maxLength="400"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Hosts')} flex="column">
          <Layout flex box>
            <Radio
              value="manual"
              title={_('Manual')}
              name="target_source"
              onChange={this.onValueChange}
              checked={target_source === 'manual'}/>
            <TextField
              grow="1"
              disabled={target_source !== 'manual'}
              value={hosts}
              name="hosts"
              onChange={this.onValueChange}/>
          </Layout>

          <Layout flex box>
            <Radio
              value="file" title={_('From file')}
              onChange={this.onValueChange}
              name="target_source"
              checked={target_source === 'file'}/>
            <FileField
              name="file"
              onChange={this.onValueChange}/>
          </Layout>
        </FormGroup>

        <FormGroup title={_('Exclude Hosts')}>
          <TextField value={exclude_hosts}
            grow="1"
            name="exclude_hosts"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Reverse Lookup Only')}>
          <YesNoRadio value={reverse_lookup_only}
            name="reverse_lookup_only"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Reverse Lookup Unify')}>
          <YesNoRadio value={reverse_lookup_unify}
            name="reverse_lookup_unify"
            onChange={this.onValueChange}/>
        </FormGroup>

        {capabilities.mayOp('get_port_lists') &&
          <FormGroup title={_('Port List')}>
            <Select2
              onChange={this.onValueChange}
              name="port_list_id"
              value={port_list_id}>
              {port_list_opts}
            </Select2>
            <Layout box flex>
              <NewIcon
                title={_('Create a new port list')}
                onClick={() => { this.portlist_dialog.show(); }}/>
            </Layout>
          </FormGroup>
        }

        <FormGroup title={_('Alive Test')}>
          <Select2
            name="alive_tests"
            onChange={this.onValueChange}
            value={alive_tests}>
            <option value="Scan Config Default">
              {_('Scan Config Default')}
            </option>
            {['ICMP Ping', 'TCP-ACK Service Ping', 'TCP-SYN Service Ping',
              'ARP Ping', 'ICMP & TCP-ACK Service Ping',
              'ICMP & ARP Ping', 'TCP-ACK Service & ARP Ping',
              'ICMP, TCP-ACK Service & ARP Ping', 'Consider Alive',
            ].map(value =>
              <option key={value} value={value}>{value}</option>)
            }
          </Select2>
        </FormGroup>

        {capabilities.mayOp('get_credentials') &&
          <h4>
            {_('Credentials for authenticated checks')}
          </h4>
        }

        {capabilities.mayOp('get_credentials') &&
          <FormGroup title={_('SSH')}>
            <Select2
              box
              name="ssh_credential_id"
              onChange={this.onValueChange}
              value={ssh_credential_id}>
              {ssh_credential_opts}
            </Select2>
            <Layout box flex>
              {_('on port')}
            </Layout>
            <TextField size="6"
              name="port" value={port}
              onChange={this.onValueChange}/>
            <Layout box flex>
              <NewIcon
                onClick={() => this.showCredentialsDialog('ssh')}
                title={_('Create a new credential')}/>
            </Layout>
          </FormGroup>
        }

        {capabilities.mayOp('get_credentials') &&
          <FormGroup title={_('SMB')}>
            <Select2
              onChange={this.onValueChange}
              name="smb_credential_id"
              value={smb_credential_id}>
              {smb_credential_opts}
            </Select2>
            <Layout box flex>
              <NewIcon
                onClick={() => this.showCredentialsDialog('smb')}
                title={_('Create a new credential')}/>
            </Layout>
          </FormGroup>
        }

        {capabilities.mayOp('get_credentials') &&
          <FormGroup title={_('ESXi')}>
            <Select2
              onChange={this.onValueChange}
              name="esxi_credential_id"
              value={esxi_credential_id}>
              {esxi_credential_opts}
            </Select2>
            <Layout box flex>
              <NewIcon
                onClick={() => this.showCredentialsDialog('esxi')}
                title={_('Create a new credential')}/>
            </Layout>
          </FormGroup>
        }

        {capabilities.mayOp('get_credentials') &&
          <FormGroup title={_('SNMP')}>
            <Select2
              onChange={this.onValueChange}
              name="snmp_credential_id"
              value={snmp_credential_id}>
              {snmp_credential_opts}
            </Select2>
            <Layout box flex>
              <NewIcon
                onClick={() => this.showCredentialsDialog('snmp')}
                title={_('Create a new credential')}/>
            </Layout>
          </FormGroup>
        }
      </Layout>
    );
  }

  renderSubDialogs() {
    return (
      <div>
        <CredentialsDialog onSave={this.onAddCredential}
          ref={ref => this.credentials_dialog = ref}/>
        <PortListsDialog onSave={this.onAddPortList}
          title={_('Create new Port List')}
          ref={ref => this.portlist_dialog = ref}/>
      </div>
    );
  }
}

TargetDialog.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

export default TargetDialog;

// vim: set ts=2 sw=2 tw=80: