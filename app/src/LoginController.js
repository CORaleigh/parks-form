/**
 * Main App Controller for the Angular Material Starter App
 * @param UsersDataService
 * @param $mdSidenav
 * @constructor
 */
function LoginController(UsersDataService, $mdSidenav, $http, $filter, $scope, $timeout, $location, $state, $stateParams, $mdToast, $window) {
  var self = this;
  self.login = function (credentials) {
    credentials.email = credentials.email.toLowerCase();
    $http.post('http://mapstest.raleighnc.gov/parks-form-api/login', credentials).then(function (result) {
      if (result.data.success) {
        $state.go('form', {user: result.data.user, token: result.data.token});
        $window.localStorage.setItem('credentials', JSON.stringify(result.data));
      } else {
        showToast(result.data.msg);
      }
    });
  }; 
  var showToast = function (message) {
    var toast = $mdToast.simple().position('top').textContent(message);
    $mdToast.show(toast);
  };

  if ($stateParams.message)
    showToast($stateParams.message);
}
export default [ 'UsersDataService', '$mdSidenav', '$http', '$filter', '$scope',  '$timeout', '$location', '$state', '$stateParams', '$mdToast', '$window', LoginController ];