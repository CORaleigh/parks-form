/**
 * Main App Controller for the Angular Material Starter App
 * @param UsersDataService
 * @param $mdSidenav
 * @constructor
 */
function LoginController(UsersDataService, $mdSidenav, $http, $filter, $scope, $timeout, $location, $state) {
  var self = this;
  self.login = function (credentials) {
    credentials.email.toLowerCase();
    $http.post('http://mapstest.raleighnc.gov/parks-form-api/login', credentials).then(function (result) {
      if (result.data.success)
        $state.go('form', {user: result.data.user});
    });
  };  
}
export default [ 'UsersDataService', '$mdSidenav', '$http', '$filter', '$scope',  '$timeout', '$location', '$state', LoginController ];