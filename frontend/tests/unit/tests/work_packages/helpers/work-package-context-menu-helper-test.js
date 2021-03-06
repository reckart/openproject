//-- copyright
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
//++

/*jshint expr: true*/

describe('WorkPackageContextMenuHelper', function() {
  var PERMITTED_CONTEXT_MENU_ACTIONS = [
    {
      icon: 'edit',
      link: 'update'
    },
    {
      icon: 'log_time',
      link: 'logTime'
    },
    {
      icon: 'move',
      link: 'move'
    },
    {
      icon: 'copy',
      link: 'copy'
    },
    {
      icon: 'delete',
      link: 'delete'
    }];
  var WorkPackageContextMenuHelper;
  var stateParams = {};

  var expectPermitted = function(workPackages, expected) {
    var calculatedPermittedActions = WorkPackageContextMenuHelper.getPermittedActions(
                                       workPackages,
                                       PERMITTED_CONTEXT_MENU_ACTIONS);

    expect(_.filter(calculatedPermittedActions,
                    function(o) { return o.icon === expected.icon; })[0].link)
      .to.equal(expected.link);
  };

  var expectNotPermitted = function(workPackages, expected) {
    var calculatedPermittedActions = WorkPackageContextMenuHelper.getPermittedActions(
                                       workPackages,
                                       PERMITTED_CONTEXT_MENU_ACTIONS);

    expect(_.filter(calculatedPermittedActions,
                    function(o) { return o.icon === expected.icon; }))
      .to.be.empty;
  };

  beforeEach(angular.mock.module('openproject.workPackages.helpers',
                    'openproject.models',
                    'openproject.api',
                    'openproject.layout',
                    'openproject.services'));

  beforeEach(angular.mock.module('openproject.templates', function($provide) {
    var configurationService = {};

    configurationService.isTimezoneSet = sinon.stub().returns(false);

    $provide.constant('$stateParams', stateParams);
    $provide.constant('ConfigurationService', configurationService);
  }));

  beforeEach(inject(function(_WorkPackageContextMenuHelper_) {
    WorkPackageContextMenuHelper = _WorkPackageContextMenuHelper_;
  }));

  describe('getPermittedActions', function() {
    var actionLinks = {
      update: {
        href: '/work_packages/123/edit'
      },
      move: {
        href: '/work_packages/move/new?ids%5B%5D=123'
      }
    };

    var workPackage = Factory.build('PlanningElement');
    workPackage.$source = { _links : actionLinks };
    workPackage.$links = actionLinks;

    describe('when an array with a single work package is passed as an argument', function() {
      var workPackages = new Array(workPackage);

      it('returns the link of a listed action', function() {
        expectPermitted(workPackages, { icon: 'move',
                                        link: '/work_packages/move/new?ids%5B%5D=123' });
      });

      it('returns the link of a listed action that has an alias', function() {
        expectPermitted(workPackages, { icon: 'edit',
                                        link: '/work_packages/123/edit' });
      });

      it('does not return the link of an action which is not listed', function() {
        expectNotPermitted(workPackages, { icon: 'non existent',
                                           link: 'who cares' });
      });
    });

    describe('when more than one work package is passed as an argument', function() {
      var anotherWorkPackage = Factory.build('PlanningElement');
      anotherWorkPackage.$source = {
        _links: {
          update: {
            href: '/work_packages/234/edit'
          }
        }
      };
      anotherWorkPackage.$links = { update: '/work_packages/234/edit' };
      var workPackages = [anotherWorkPackage, workPackage];

      beforeEach(inject(function(_WorkPackagesTableService_) {
        var WorkPackagesTableService = _WorkPackagesTableService_;
        WorkPackagesTableService.setBulkLinks({
          update: '/work_packages/bulk/edit',
          move: '/work_packages/bulk/move',
          delete: '/work_packages/bulk/delete'
        });
      }));

      it('does not return the action if it is not permitted on all work packages', function() {
        expectNotPermitted(workPackages, { icon: 'update',
                                           link: 'who cares' });
      });

      it('links to the bulk action and passes all work package ids', function() {
        var key = encodeURIComponent('ids[]');
        var queryString = key + '=' + anotherWorkPackage.id + '&' + key + '=' + workPackage.id;

        expectPermitted(workPackages, { icon: 'edit',
                                        link: '/work_packages/bulk/edit?' + queryString });
      });
    });
  });
});
