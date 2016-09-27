/**
 * Main App Controller for the Angular Material Starter App
 * @param UsersDataService
 * @param $mdSidenav
 * @constructor
 */
function ResetController($mdSidenav, $http, $filter, $scope, $timeout, $location, $state, $stateParams, $mdToast, $window) {
  console.log($stateParams.token);
  var self = this;
  self.reset = function (credentials) {
    credentials.email = credentials.email.toLowerCase();
    credentials.token = $stateParams.token;
    $http.post('http://localhost:8081/parks-form-api/reset', credentials).then(function (result) {
      if (result.data.success) {
        console.log(result);
        $state.go('login', {user: result.data.user});
        //$window.sessionStorage.setItem('credentials', JSON.stringify(result.data));
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
export default ['$mdSidenav', '$http', '$filter', '$scope',  '$timeout', '$location', '$state', '$stateParams', '$mdToast', '$window', ResetController ];