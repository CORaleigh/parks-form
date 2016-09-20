/**
 * Main App Controller for the Angular Material Starter App
 * @param UsersDataService
 * @param $mdSidenav
 * @constructor
 */
function AppController(UsersDataService, $mdSidenav, $http, $filter, $scope, $timeout, $location, $state) {
  var self = this;
  self.admin = $location.path().indexOf('admin') > -1
  self.adminClicked = function () {
    self.admin = !self.admin;
    if (self.admin) {
      $state.go('admin');
    } else {
      $state.go('form');
    }
  }
}
export default [ 'UsersDataService', '$mdSidenav', '$http', '$filter', '$scope',  '$timeout', '$location', '$state', AppController ];