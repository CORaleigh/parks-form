/**
 * Main App Controller for the Angular Material Starter App
 * @param UsersDataService
 * @param $mdSidenav
 * @constructor
 */
function SignupController(UsersDataService, $mdSidenav, $http, $filter, $scope, $timeout, $location, $state) {
  var self = this;
  self.signup = function (credentials) {
    credentials.email = credentials.email.toLowerCase();
    $http.post('http://mapstest.raleighnc.gov/parks-form-api/signup', credentials).then(function (result) {
      if (result.data.success)
        $state.go('login');
    });
  };
}
export default [ 'UsersDataService', '$mdSidenav', '$http', '$filter', '$scope',  '$timeout', '$location', '$state', SignupController ];