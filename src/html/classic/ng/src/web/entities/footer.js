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

import _ from '../../locale.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import SelectionType from '../selectiontype.js';

import DeleteIcon from '../icons/deleteicon.js';
import ExportIcon from '../icons/exporticon.js';
import TrashIcon from '../icons/trashicon.js';

import Select2 from '../form/select2.js';

import TableRow from '../table/row.js';

import './css/footer.css';

export const EntitiesFooter = props => {

  let {span, selectionType, download, trash, children, onTrashClick,
    onDeleteClick, onSelectionTypeChange, onDownloadClick,
    selection = true} = props;
  let deleteEntities = props.delete;
  return (
    <TableRow>
      <td colSpan={span}>
        <Layout flex align={['end', 'center']}>
          {selection &&
            <Select2
              value={selectionType}
              onChange={onSelectionTypeChange}>
              <option value={SelectionType.SELECTION_PAGE_CONTENTS}>
                {_('Apply to page contents')}
              </option>
              <option value={SelectionType.SELECTION_USER}>
                {_('Apply to selection')}
              </option>
              <option value={SelectionType.SELECTION_FILTER}>
                {_('Apply to all filtered')}
              </option>
            </Select2>
          }
          <Layout flex box>
            {trash &&
              <TrashIcon onClick={onTrashClick}
                selectionType={selectionType}/>
            }
            {download &&
              <ExportIcon onClick={onDownloadClick}
                selectionType={selectionType}
                value={download}/>
            }
            {deleteEntities &&
              <DeleteIcon onClick={onDeleteClick}
                selectionType={selectionType}/>
            }
            {children}
          </Layout>
        </Layout>
      </td>
    </TableRow>
  );
};

EntitiesFooter.propTypes = {
  span: PropTypes.number.isRequired,
  selection: React.PropTypes.bool,
  selectionType: React.PropTypes.string,
  download: PropTypes.stringOrFalse,
  delete: React.PropTypes.bool,
  trash: React.PropTypes.bool,
  onSelectionTypeChange: React.PropTypes.func,
  onDownloadClick: React.PropTypes.func,
  onTrashClick: React.PropTypes.func,
  onDeleteClick: React.PropTypes.func,
};


export default EntitiesFooter;

// vim: set ts=2 sw=2 tw=80: