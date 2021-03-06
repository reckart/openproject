// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {wpButtonsModule} from '../../../angular-modules';
import WorkPackageCreateButtonController from '../wp-create-button/wp-create-button.controller';
import {HalResource} from "../../api/api-v3/hal-resources/hal-resource.service";

class WorkPackageInlineCreateButtonController extends WorkPackageCreateButtonController {
  public query: op.Query;
  public rows:any[];
  public hidden:boolean = false;

  // Template create form
  protected form: HalResource;

  private _wp;

  constructor(
    protected $state,
    protected $scope,
    protected $rootScope,
    protected $element,
    protected FocusHelper,
    protected I18n,
    protected WorkPackageResource,
    protected apiWorkPackages
  ) {
    super($state, I18n);

    $rootScope.$on('workPackageSaved', (event, savedWp) => {
      if (savedWp === this._wp) {
        this.addWorkPackageRow();
      }
    });

    // Need to reset the state when the work package is refreshed hard
    $rootScope.$on('workPackagesRefreshRequired', _ => {
      this.show();
    });

    $rootScope.$on('inlineWorkPackageCreateCancelled', (event, index, row) => {
      if (row.object === this._wp) {
        this.rows.splice(index, 1);
        this.show();
        FocusHelper.focusElement(this.$element);
      }
    });
  }

  public addWorkPackageRow() {
    this.getForm().then(form => {
      this._wp = this.WorkPackageResource.fromCreateForm(form);
      this._wp.inlineCreated = true;

      this.query.applyDefaultsFromFilters(this._wp);
      this.rows.push({ level: 0, ancestors: [], object: this._wp, parent: void 0 });
      this.hide();
    });
  }

  public hide() {
    return this.hidden = true;
  }

  public show() {
    return this.hidden = false;
  }

  private getForm() {
    if (!this.form) {
      this.form = this.apiWorkPackages.emptyCreateForm(this.projectIdentifier);
    }

    return this.form;
  }

}

wpButtonsModule.controller(
  'WorkPackageInlineCreateButtonController', WorkPackageInlineCreateButtonController);
