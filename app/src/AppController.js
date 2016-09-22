/**
 * Main App Controller for the Angular Material Starter App
 * @param UsersDataService
 * @param $mdSidenav
 * @constructor
 */
function AppController(UsersDataService, $mdSidenav, $http, $filter, $rootScope, $scope, $timeout, $location, $state, $mdMedia) {
  var self = this;
  $rootScope.$on("UserAuthenticated", function(e, params){
    self.params = params;
    self.admin = $location.path().indexOf('admin') > -1
  });
  self.admin = $location.path().indexOf('admin') > -1
  self.adminClicked = function () {
    self.admin = !self.admin;
    if (self.admin) {
      $state.go('admin', self.params);
    } else {
      $state.go('form', self.params);
    }
  }
  self.logout = function () {
    self.params = null;
    $state.go('login');
  };
  self.toggleList = function () {
    $mdSidenav('left').toggle();
  };
  $scope.$mdMedia = $mdMedia
}
export default [ 'UsersDataService', '$mdSidenav', '$http', '$filter', '$rootScope', '$scope', '$timeout', '$location', '$state', '$mdMedia', AppController ];