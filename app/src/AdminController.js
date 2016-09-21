function AdminController(UsersDataService, $mdSidenav, $http, $filter, $scope, $timeout, $stateParams, $state, $mdDialog) {
  var self = this;
  if (!$stateParams.user)
    $state.go('login');
  self.user = $stateParams.user;
  self.selectedTab = $stateParams.tab ? $stateParams.tab : 0;
  self.tabSelected = function (index) {
  	if (!self.user)
      return false;
  	$state.go('admin.tab', {tab: index, user: self.user});
  }
  if (!self.facilities) {
	  $http.get("http://mapstest.raleighnc.gov/parks-form-api/facilities").then(function (result) {
	    self.facilities = result.data;
	  });  	
  }
  if (!self.jobs) {
	  $http.get("http://mapstest.raleighnc.gov/parks-form-api/jobs").then(function (result) {
	    self.jobs = result.data;
	  });
  }
  if (!self.targets) {
   $http.get("http://mapstest.raleighnc.gov/parks-form-api/targets").then(function (result) {
    self.targets = result.data;
   });  	
  } 

  self.addFacility = function () {
    if (self.newFacility) {
      var url = "http://mapstest.raleighnc.gov/parks-form-api/facilities";
      $http.post(url, {name: self.newFacility}).then(function (response) {
        self.facilities.push({name: self.newFacility, _id: response._id});
        self.newFacility = null;
      });      
    }
  } 
  self.addTarget = function () {
    if (self.newTarget) {
      var url = "http://mapstest.raleighnc.gov/parks-form-api/targets";
      $http.post(url, {name: self.newTarget}).then(function (response) {
        self.targets.push({name: self.newTarget, _id: response.data._id, services: []});
        self.newTarget = null;
      });      
    }
  }
  self.addService = function (target) {
    if (target.newServiceName && target.newServiceValue) {
      var url = "http://mapstest.raleighnc.gov/parks-form-api/targets/" + target._id;
      $http.post(url, {name: target.newServiceName, value: target.newServiceValue}).then(function (response) {
        target.services.push({name: target.newServiceName, value: target.newServiceValue});
        target.newServiceName = null;
        target.newServiceValue = null;
      });
    }
  }  
  self.updateService = function (service) {
      var url = "http://mapstest.raleighnc.gov/parks-form-api/targets/service/" + service._id;
      $http.post(url, {name: service.name, value: service.value}).then(function (response) {
        //self.targets.push({name: self.newTarget});
        //self.newTarget = null;
      });      
    
  }  
  
  self.addJob = function () {
    if (self.newJob) {
      var url = "http://mapstest.raleighnc.gov/parks-form-api/jobs";
      $http.post(url, {name: self.newJob}).then(function (response) {
        self.jobs.push({name: self.newJob});
        self.newJob = null;
      });      
    }
  }

  self.showConfirm = function(ev, type, item, item2) {
    var confirm = $mdDialog.confirm()
          .title('Would you like to delete ' + type + ': ' + item.name + '?')
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
      }
    }, function() {
      
    });
  };

  self.deleteFacility = function (facility) {
    $http({
        method: 'DELETE',
        url: 'http://mapstest.raleighnc.gov/parks-form-api/facilities',
        data: {id: facility._id},
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(function (results) {
      var index = self.facilities.indexOf(facility);
      self.facilities.splice(index, 1);
    });     
  }
  self.deleteJob = function (job) {
    $http({
        method: 'DELETE',
        url: 'http://mapstest.raleighnc.gov/parks-form-api/jobs',
        data: {id: job._id},
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(function (results) {
      var index = self.facilities.indexOf(job);
      self.jobs.splice(index, 1);
    });     
  }
  self.deleteTarget = function (target) {
    $http({
        method: 'DELETE',
        url: 'http://mapstest.raleighnc.gov/parks-form-api/targets',
        data: {id: target._id},
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(function (results) {
      var index = self.targets.indexOf(target);
      self.targets.splice(index, 1);
    });     
  }  
  self.deleteService = function (service, target) {
    $http({
        method: 'DELETE',
        url: 'http://mapstest.raleighnc.gov/parks-form-api/targets/service/' + service._id,
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(function (results) {
      var index = target.services.indexOf(service);
      target.services.splice(index, 1);
    }); 
  }              
}
export default [ 'UsersDataService', '$mdSidenav', '$http', '$filter', '$scope',  '$timeout', '$stateParams', '$state', '$mdDialog',AdminController ];