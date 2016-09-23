/**
 * Main App Controller for the Angular Material Starter App
 * @param UsersDataService
 * @param $mdSidenav
 * @constructor
 */
function MainController(UsersDataService, $mdSidenav, $http, $filter, $rootScope,$scope, $timeout, $state, $stateParams, $mdDialog, $mdMedia, $window) {
  var self = this;
  if (!$window.localStorage.getItem('credentials')) {//!$stateParams.user) {
    $state.go('login');
    return false;
  } else if ($window.localStorage.getItem('credentials').expires > new Date()){
    $state.go('login');
    return false;    
  }
  var api = 'http://localhost:8081/parks-form-api/';
  var creds = JSON.parse($window.localStorage.getItem('credentials'));
  var token = creds.token;
  self.user = creds.user;

  $rootScope.$emit("UserAuthenticated", $stateParams);

  var FICA = 1.0765;
  self.selected     = null;
  self.selectedTab = 0;
  self.cityFacility = true;
  self.payTypes = [{name: "Per Student"},{name: "Hourly"}];  
  self.statuses = [{name: "Contractor"},{name: "Payroll"}];    
  self.data = {preparer: self.user.email, target: {}, personnel: [{visible: true, cost: null}], cityFacility: true, full: false, newProgram: false, comments: ''};
  self.costEstimate = 0;
  self.revenueEstimate = 0;  
  $scope.$mdMedia = $mdMedia;
  //get Facilities, Targets, and Jobs from database
  $http.get(api + "targets", {params: {token: token}}).then(function (response) {
    if (response.data.success) {
      self.targets = response.data.results;
    } else {
      $state.go('login', {message: response.data.message});
    }
    $http.get(api + "facilities", {params: {token: token}}).then(function (response) {
      if (response.data.success) {
        self.facilities = response.data.results;
      } else {
        $state.go('login', {message: response.data.message});
      }      
      $http.get(api + "jobs", {params: {token: token}}).then(function (response) {
        if (response.data.success) {
          self.jobs = response.data.results;
        } else {
          $state.go('login', {message: response.data.message});
        }           

        //if ID set in URL, select entry by id
        if ($stateParams.id) {
          self.getEntryById($stateParams.id);
        }
      });       
    });    
  }); 

  //check if division is NaN
  self.checkNaN = function (value) {
    return isNaN(value) || !isFinite(value);
  }

  //calculation functions
  self.residentialRateChanged = function (rate) {
    //if rate great than 15, add 15 for non-residental rate
    self.data.nonResidentialRate = (rate <= 15) ? rate : rate + 15;
  }
  self.calcRevenue = function () {
    var value = self.data.residentialRate * self.data.minParticipants;
    // if (self.data.full)
    //   value = self.data.residentialRate * ((self.data.minParticipants + self.data.maxParticipants)/2);
    if (isNaN(value)) {
      value = 0;
    }
    if (self.data.altRevAmt)
      value += self.data.altRevAmt;
    self.revenueEstimate = value;
    return value;
  }
  self.calcCost = function () {
    var personnel = {};
    var value = 0;
    for (var i = 0;i < self.data.personnel.length;i++) {
      personnel = self.data.personnel[i];
      personnel.cost = null;
      if (personnel.payType === 'Hourly') {
        personnel.cost = personnel.rate * personnel.count * (self.data.weeks * self.data.hours);
      } else if (personnel.payType === 'Per Student') {
        personnel.cost = personnel.rate * personnel.count * self.data.minParticipants;        
      }
      if (personnel.status === "Payroll") {
        personnel.cost *= FICA;
      } 
      value += personnel.cost; 
    }
    if (isNaN(value)) {
      value = 0;
    }
    if (self.data.supplyAmt)
      value += self.data.supplyAmt
    if (self.data.programArea === 'Athletics') {
      value *= 1.4256
    } else {
      value *= 1.4503;
    }
    self.costEstimate = value;
    return value;
  }
  //personnel functions
  self.addPersonnel = function () {
    self.data.personnel.unshift({});
    for (var i = 0;i < self.data.personnel.length;i++) {
      self.data.personnel[i].visible = (i === 0);
    }
  }
  self.removePersonnel = function (id) {
    self.data.personnel.splice(id, 1);
    if (self.data.personnel.length > 0) {
      self.data.personnel[0].visible = true;
    }
  }

  //submit new entry
  self.submit = function (isCopy) {
    var url = api + "form/"
    if (self.id) {
      url += self.id
    }
    console.log(self.data);
      $http.post(url, 
        { programArea: self.data.target.name,
          title: self.data.title,
          category: self.data.category,
          cityFacility: self.data.cityFacility,
          facility: self.data.facility.name,
          start: self.data.start,
          preparer: self.user.email,
          comments: self.data.comments,
          newProgram: self.data.newProgram,
          minParticipants: self.data.minParticipants,
          maxParticipants: self.data.maxParticipants,
          full: self.data.full,
          weeks: self.data.weeks,
          hours: self.data.hours,
          residentialRate: self.data.residentialRate,
          nonResidentialRate: self.data.nonResidentialRate,
          altRevDesc: self.data.altRevDesc,
          altRevAmt: self.data.altRevAmt,
          supplyDesc: self.data.supplyDesc,
          supplyAmt: self.data.supplyAmt,
          personnel: JSON.stringify(self.data.personnel),
          submitted: new Date(),
          needsReview: ((self.revenueEstimate / self.costEstimate) < self.data.category.value) || self.checkNaN(self.revenueEstimate / self.costEstimate) || self.checkNaN(self.data.category.value),
          revenue: self.revenueEstimate,
          cost: self.costEstimate,
          recoveryProjected: self.revenueEstimate / self.costEstimate,
          recoveryTarget: self.data.category.value,
          token: token
        }
    ).then(function (response) {
      if (isCopy) {
        self.selectedTab = 1;
      } else {
        self.selectedTab = 4;
      }
      
      if (response.data.success) {
        self.id = response.data._id;
        $state.go('form.id', {id: self.id});
      } else {
        $state.go('login', {message: response.data.message});
      }  


    });
  }

  //get all entries when History tab selected
  self.getHistory = function () {
    $http.get(api + "form", {params:{token: token}}).then(function (response) {
      if (response.data.success) {
        self.history = response.data.results;
      } else {
        $state.go('login', {message: response.data.message});
      }        
    });
  }

  //get entry by ID
  self.getEntryById = function (id) {
    $http.get(api + "form/" + id, {params:{token: token}}).then(function (response) {
      if (response.data.results.length > 0) {
        self.selectEntry(response.data.results[0]);        
      }
    });
  }  

  //delete entry functions
  self.deleteEntry = function (entry) {
    $http({
        method: 'DELETE',
        url: api + 'form',
        data: {id: entry._id, token: token},
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(function (response) {
      self.getHistory();
    });     
  }
  self.showConfirm = function(ev, entry) {
    var confirm = $mdDialog.confirm()
          .title('Would you like to delete this entry?')
          .ariaLabel('Delete')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      self.deleteEntry(entry);
    }, function() {
      
    });
  };

  //handle cloning of entry
  self.copyEntry = function (entry) {
    self.selectEntry(entry);   
    self.id = null;
    $timeout(function (){
      self.submit(true);
    }, 2000);
  }

  //handle select button click
  self.selectEntry = function (entry) {
   // location.skipReload().path(entry._id);
    $state.go('form.id', {id: entry._id});
    self.id = entry._id;
    self.data.target = $filter('filter')(self.targets, entry.programArea)[0];
    self.data.category = $filter('filter')(self.data.target.services, entry.category)[0];
    self.data.title = entry.title;
    self.data.start = new Date(entry.start);
    self.data.cityFacility = entry.cityFacility;
    self.data.facility = $filter('filter')(self.facilities, entry.facility)[0];    
    self.data.preparer = self.user.email;//entry.preparer;
    self.data.comments = entry.comments;
    self.data.newProgram = entry.newProgram;
    self.data.minParticipants = entry.minParticipants;
    self.data.maxParticipants = entry.maxParticipants;
    self.data.full = entry.full;
    self.data.weeks = entry.weeks;
    self.data.hours = entry.hours;
    self.data.residentialRate = entry.residentialRate;
    self.data.nonResidentialRate = entry.nonResidentialRate;
    self.data.altRevAmt = entry.altRevAmt;
    self.data.altRevDesc = entry.altRevDesc;
    self.data.supplyAmt = entry.supplyAmt;
    self.data.supplyDesc = entry.supplyDesc;
    self.data.personnel = entry.personnel;
    self.selectedTab = 1;
    self.targetSelected = true;
  }

  //clear form
  self.clear = function () {
    self.data = {target: {}, personnel: [{}], full: false, newProgram: false, comments: '', facility: ''};
    self.id = null;
    self.selectedTab = 1;
  }

  //handle collapsing/expanding of personnel cards
  self.togglePersonnel = function (personnel, index) {
    personnel.visible = !personnel.visible;
    for (var i = 0; i < self.data.personnel.length; i++) {
      if (i != index) {
        self.data.personnel[i].visible = false;
      }
    }
  };
}
export default [ 'UsersDataService', '$mdSidenav', '$http', '$filter', '$rootScope', '$scope',  '$timeout', '$state', '$stateParams', '$mdDialog', '$mdMedia', '$window', MainController ];