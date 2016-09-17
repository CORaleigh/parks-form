/**
 * Main App Controller for the Angular Material Starter App
 * @param UsersDataService
 * @param $mdSidenav
 * @constructor
 */
function AppController(UsersDataService, $mdSidenav, $http, $filter, $scope, $timeout) {
  var self = this;
  var FICA = 1.0765;
  self.selected     = null;
  self.selectedTab = 0;
  self.cityFacility = true;
  $http.get("http://mapstest.raleighnc.gov/parks-form-api/targets").then(function (result) {
    self.targets = result.data;
  });
  $http.get("http://mapstest.raleighnc.gov/parks-form-api/facilities").then(function (result) {
    self.facilities = result.data;
  });
  $http.get("http://mapstest.raleighnc.gov/parks-form-api/jobs").then(function (result) {
    self.jobs = result.data;
  });  
  self.payTypes = [{name: "Per Student"},{name: "Hourly"}];  
  self.statuses = [{name: "Contractor"},{name: "Payroll"}];    
  self.data = {target: {}, personnel: [{visible: true, cost: null}], cityFacility: true, full: false, newProgram: false, comments: ''};
  self.costEstimate = 0;
  self.revenueEstimate = 0;
  self.checkNaN = function (value) {
    return isNaN(value) || !isFinite(value);
  }
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
  self.residentialRateChanged = function (rate) {
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
  self.submit = function (isCopy) {
    var url = "http://mapstest.raleighnc.gov/parks-form-api/form/"
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
          preparer: self.data.preparer,
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
          recoveryTarget: self.data.category.value
        }
    ).then(function (response) {
      if (isCopy) {
        self.selectedTab = 1;
      } else {
        self.selectedTab = 4;
      }
      
      self.id = response.data.message._id;
    });
  }
  self.getHistory = function () {
    $http.get("http://mapstest.raleighnc.gov/parks-form-api/form").then(function (results) {
      self.history = results.data;
    });
  }
  self.deleteEntry = function (entry) {
    $http({
        method: 'DELETE',
        url: 'http://mapstest.raleighnc.gov/parks-form-api/form',
        data: {id: entry._id},
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }).then(function (results) {
      console.log(results);
      self.getHistory();
    });     
  }  
  self.copyEntry = function (entry) {
    self.selectEntry(entry);   
    self.id = null;
    $timeout(function (){
      self.submit(true);
    }, 2000);
  }
  self.selectEntry = function (entry) {
    //self.data.programArea = $filter('filter')(self.targets, entry.programArea);
    self.id = entry._id;
    self.data.target = $filter('filter')(self.targets, entry.programArea)[0];
    self.data.category = $filter('filter')(self.data.target.services, entry.category)[0];
    self.data.title = entry.title;
    self.data.start = new Date(entry.start);
    self.data.cityFacility = entry.cityFacility;
    self.data.facility = {name: entry.facility};
    self.data.preparer = entry.preparer;
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
  }
  self.clear = function () {
    self.data = {target: {}, personnel: [{}], full: false, newProgram: false, comments: '', facility: ''};
    self.id = null;
    self.selectedTab = 1;
  }
  self.togglePersonnel = function (personnel, index) {
    personnel.visible = !personnel.visible;
    for (var i = 0; i < self.data.personnel.length; i++) {
      if (i != index) {
        self.data.personnel[i].visible = false;
      }
    }
  };
}
export default [ 'UsersDataService', '$mdSidenav', '$http', '$filter', '$scope',  '$timeout', AppController ];