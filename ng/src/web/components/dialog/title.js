/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import Layout from '../layout/layout.js';

import Button from './button.js';

const DialogTitleBar = glamorous(Layout)({
  padding: '5px 5px 5px 10px',
  marginBottom: '15px',
  borderRadius: '4px',
  border: '1px solid #519032',
  color: '#fff',
  fontWeight: 'bold',
  background: '#66c430 50% 50% repeat-x',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: '0',
  cursor: 'move',
});

const DialogCloseButton = glamorous(Button)({
  background: 'none',
  opacity: '.7',
  height: '20px',
  width: '20px',
  lineHeight: '0',
  padding: '0',
});

const DialogTitle = ({
  showClose = true,
  title,
  onCloseClick,
  onMouseDown,
}) => {
  return (
    <DialogTitleBar
      align={['space-between', 'center']}
      onMouseDown={onMouseDown}>
      <span>{title}</span>
      {showClose &&
        <DialogCloseButton
          onClick={onCloseClick}
          title={_('Close')}>x</DialogCloseButton>
      }
    </DialogTitleBar>
  );
};

DialogTitle.propTypes = {
  showClose: PropTypes.bool,
  title: PropTypes.string,
  onCloseClick: PropTypes.func,
  onMouseDown: PropTypes.func,
};

export default DialogTitle;

// vim: set ts=2 sw=2 tw=80:
