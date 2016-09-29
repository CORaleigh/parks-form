/**
 * Main App Controller for the Angular Material Starter App
 * @param UsersDataService
 * @param $mdSidenav
 * @constructor
 */
function ForgotController($mdSidenav, $http, $filter, $scope, $timeout, $location, $state, $stateParams, $mdToast, $window) {
  var self = this;
  self.forgot = function (email) {
    email = email.toLowerCase();
    $http.post('http://mapstest.raleighnc.gov/parks-form-api/forgot', {email: email}).then(function (result) {
      if (result.data.success) {
        $state.go('login', {email: email});
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
export default ['$mdSidenav', '$http', '$filter', '$scope',  '$timeout', '$location', '$state', '$stateParams', '$mdToast', '$window', ForgotController ];