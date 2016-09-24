function AdminController($mdSidenav, $http, $stateParams, $state, $mdDialog, $window) {
  var self = this;
  if (!$window.sessionStorage.getItem('credentials')) {//!$stateParams.user) {
    $state.go('login');
    return false;
  } else if ($window.sessionStorage.getItem('credentials').expires > new Date()){
    $state.go('login');
    return false;    
  }
  var api = 'http://mapstest.raleighnc.gov/parks-form-api/';
  var creds = JSON.parse($window.sessionStorage.getItem('credentials'));
  var token = creds.token;
  self.user = creds.user;
  self.selectedTab = $stateParams.tab ? $stateParams.tab : 0;
  self.$window = $window;
  self.tabSelected = function (index) {
  	if (!self.user)
      return false;
  	$state.go('admin.tab', {tab: index, user: self.user});
  }
  if (!token) {
    return false;
  }
  if (!self.facilities) {
	  $http.get(api + "facilities", {params: {token: token}}).then(function (response) {
	    if (response.data.success) {
      self.facilities = response.data.results;
      } else {
        $state.go('login', {message: response.data.message});
      }
	  });  	
  }
  if (!self.jobs) {
	  $http.get(api + "jobs", {params: {token: token}}).then(function (response) {
	    if (response.data.success) {
      self.jobs = response.data.results;
      } else {
        $state.go('login', {message: response.data.message});
      }
	  });
  }
  if (!self.targets) {
   $http.get(api + "targets", {params: {token: token}}).then(function (response) {
    if (response.data.success) {
    self.targets = response.data.results;
    } else {
        $state.go('login', {message: response.data.message});
    }
   });  	
  } 
   $http.get(api + "users", {params: {token: token}}).then(function (response) {
    if (response.data.success) {
    self.users = response.data.results;
    } else {
        $state.go('login', {message: response.data.message});
    }
   });  

  self.addFacility = function () {
    if (self.newFacility) {
      var url = api + "facilities";
      $http.post(url, {name: self.newFacility, token: token}).then(function (response) {
        self.facilities.push({name: self.newFacility, _id: response._id});
        self.newFacility = null;
      });      
    }
  } 
  self.addTarget = function () {
    if (self.newTarget) {
      var url = api + "targets";
      $http.post(url, {name: self.newTarget, token: token}).then(function (response) {
        self.targets.push({name: self.newTarget, _id: response.data._id, services: []});
        self.newTarget = null;
      });      
    }
  }
  self.addService = function (target) {
    if (target.newServiceName && target.newServiceValue) {
      var url = api + "targets/" + target._id;
      $http.post(url, {name: target.newServiceName, value: target.newServiceValue, token: token}).then(function (response) {
        target.services.push({name: target.newServiceName, value: target.newServiceValue});
        target.newServiceName = null;
        target.newServiceValue = null;
      });
    }
  }  
  self.updateService = function (service) {
      var url = api + "targets/service/" + service._id;
      $http.post(url, {name: service.name, value: service.value, token: token}).then(function (response) {
        //self.targets.push({name: self.newTarget});
        //self.newTarget = null;
      });      
    
  }  
  
  self.addJob = function () {
    if (self.newJob) {
      var url = api + "jobs";
      $http.post(url, {name: self.newJob, token: token}).then(function (response) {
        self.jobs.push({name: self.newJob});
        self.newJob = null;
      });      
    }
  }

  self.showConfirm = function(ev, type, field, item, item2) {
    var confirm = $mdDialog.confirm()
          .title('Would you like to delete ' + type + ': ' + item[field] + '?')
          .ariaLabel('Delete')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      switch (type) {
        case 'facility':
          self.deleteFacility(item);
        break;
        case 'target':
          self.deleteTarget(item);
        break;
        case 'job':
          self.deleteJob(item);
        break;
        case 'service':
          self.deleteService(item, item2)
        break;
        case 'user':
          self.deleteUser(item);
        break;
      }
    }, function() {
      
    });
  };

  self.deleteFacility = function (facility) {
    $http({
        method: 'DELETE',
        url: api + 'facilities',
        data: {id: facility._id, token: token},
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(function (results) {
      var index = self.facilities.indexOf(facility);
      self.facilities.splice(index, 1);
    });     
  }
  self.deleteJob = function (job) {
    $http({
        method: 'DELETE',
        url: api + 'jobs',
        data: {id: job._id, token: token},
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(function (results) {
      var index = self.jobs.indexOf(job);
      self.jobs.splice(index, 1);
    });     
  }
  self.deleteTarget = function (target) {
    $http({
        method: 'DELETE',
        url: api + 'targets',
        data: {id: target._id, token: token},
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(function (results) {
      var index = self.targets.indexOf(target);
      self.targets.splice(index, 1);
    });     
  }  
  self.deleteService = function (service, target) {
    $http({
        method: 'DELETE',
        url: api + 'targets/service/' + service._id,
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(function (results) {
      var index = target.services.indexOf(service);
      target.services.splice(index, 1);
    }); 
  }
  self.deleteUser = function (user) {
    $http({
        method: 'DELETE',
        url: api + 'users/' + user._id,
        data: {token: token},
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(function (results) {
      var index = self.users.indexOf(user);
      self.users.splice(index, 1);
    });     
  }      
  self.changeAdmin = function (user) {
      var url = api + "users/" + user._id;
      $http.post(url, {admin: user.admin, token: token}).then(function (response) {
        //self.targets.push({name: self.newTarget});
        //self.newTarget = null;
      });   
  }         
}
export default [ '$mdSidenav', '$http', '$stateParams', '$state', '$mdDialog', '$window', AdminController ];