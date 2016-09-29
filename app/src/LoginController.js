/**
 * Main App Controller for the Angular Material Starter App
 * @param UsersDataService
 * @param $mdSidenav
 * @constructor
 */
function LoginController($mdSidenav, $http, $filter, $scope, $timeout, $location, $state, $stateParams, $mdToast, $window) {
  var self = this;
  if ($stateParams.email)
    self.credentials = {email: $stateParams.email};
  self.login = function (credentials) {
    credentials.email = credentials.email.toLowerCase();
    $http.post('http://mapstest.raleighnc.gov/parks-form-api/login', credentials).then(function (result) {
      if (result.data.success) {
        $state.go('form', {user: result.data.user, token: result.data.token});
        $window.sessionStorage.setItem('credentials', JSON.stringify(result.data));
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
export default ['$mdSidenav', '$http', '$filter', '$scope',  '$timeout', '$location', '$state', '$stateParams', '$mdToast', '$window', LoginController ];