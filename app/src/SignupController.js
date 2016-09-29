/**
 * Main App Controller for the Angular Material Starter App
 * @constructor
 */
function SignupController( $mdSidenav, $http, $state, $mdToast) {
  var self = this;
  self.signup = function (credentials) {
    credentials.email = credentials.email.toLowerCase();
    $http.post('http://mapstest.raleighnc.gov/parks-form-api/signup', credentials).then(function (result) {
      if (result.data.success) {
        $state.go('login', {email: credentials.email});
      } else {
        showToast(result.data.msg);
      }
    });
  };
  var showToast = function (message) {
    var toast = $mdToast.simple().position('top').textContent(message);
    $mdToast.show(toast);
  };  
}
export default [ '$mdSidenav', '$http', '$state', '$mdToast', SignupController ];