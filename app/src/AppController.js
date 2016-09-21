/**
 * Main App Controller for the Angular Material Starter App
 * @param UsersDataService
 * @param $mdSidenav
 * @constructor
 */
function AppController(UsersDataService, $mdSidenav, $http, $filter, $rootScope, $timeout, $location, $state) {
  var self = this;
  $rootScope.$on("UserAuthenticated", function(e, user){
    self.user = user;
  });
  self.admin = $location.path().indexOf('admin') > -1
  self.adminClicked = function () {
    self.admin = !self.admin;
    if (self.admin) {
      $state.go('admin', {user: self.user});
    } else {
      $state.go('form', {user: self.user});
    }
  }
  self.logout = function () {
    self.user = null;
    $state.go('login');
  };
  self.toggleList = function () {
    $mdSidenav('left').toggle();
  };
}
export default [ 'UsersDataService', '$mdSidenav', '$http', '$filter', '$scope',  '$timeout', '$location', '$state', AppController ];