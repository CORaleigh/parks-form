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
  self.users        = [ ];
  self.selectUser   = selectUser;
  self.toggleList   = toggleUsersList;
  self.selectedTab = 1;
  self.jobs = [
            {name: 'Afterschool Counselor'},
            {name: 'Afterschool Director'},
            {name: 'Afterschool Specialist'},
            {name: 'Aquatics Instructor Trainer'},
            {name: 'Assistant Camp Director'},
            {name: 'Assistant Pool Manager'},
            {name: 'Assistant Swim Coach'},
            {name: 'Athletic Site Manger'},
            {name: 'Baseball Official'},
            {name: 'Basketball Official'},
            {name: 'Basketball Scorekeeper'},
            {name: 'Year Round Director'},
            {name: 'Bus Driver'},
            {name: 'Camp Director'},
            {name: 'Camp Junior Counselor'},
            {name: 'Camp Specialist'},
            {name: 'Cashier'},
            {name: 'Counselor'},
            {name: 'Dodgeball Official'},
            {name: 'Football Official'},
            {name: 'Head Swim Coach'},
            {name: 'Inclusion Specialist'},
            {name: 'Inline Hockey Official'},
            {name: 'Kickball Official'},
            {name: 'Lifeguard'},
            {name: 'Lifeguard Training Instructor'},
            {name: 'Off Duty Security Officer'},
            {name: 'Pool Manager'},
            {name: 'Private Swim Lessons Instructor'},
            {name: 'Recreation Aide'},
            {name: 'Recreation Instructor'},
            {name: 'Recreation Leader'},
            {name: 'Scorekeeper'},
            {name: 'Softball Official'},
            {name: 'Staff Support'},
            {name: 'Staff Support Analyst'},
            {name: 'Trackout Counselor'},
            {name: 'Trolley Driver'},
            {name: 'Van Driver'},
            {name: 'Volleyball Official'},
            {name: 'Volunteer'},
            {name: 'Water Fitness Instructor'},
            {name: 'Water Safety Instructor'},
            {name: 'Year Round Counselor'},
            {name: 'Youth Program Manager'},
            {name: 'Trip Chaperone'}
        ];
  self.payTypes = [{name: "Per Student"},{name: "Hourly"}];  
  self.statuses = [{name: "Contractor"},{name: "Payroll"}];    
  self.data = {target: {}, personnel: [{}], full: false, newProgram: false, comments: ''};
  self.costEstimate = 0;
  self.revenueEstimate = 0;
  self.checkNaN = function (value) {
    return isNaN(value) || !isFinite(value);
  }
  self.addPersonnel = function () {
    self.data.personnel.push({});
  }
  self.removePersonnel = function (id) {
    self.data.personnel.splice(id, 1);
  }
  self.residentialRateChanged = function (rate) {
    self.data.nonResidentialRate = (rate <= 15) ? rate : rate + 15;
  }
  self.calcRevenue = function () {
    var value = self.data.residentialRate * self.data.minParticipants;
    if (self.data.full)
      value = self.data.residentialRate * ((self.data.minParticipants + self.data.maxParticipants)/2);
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
      if (personnel.payType === 'Hourly') {
        value += personnel.rate * FICA * personnel.count * (self.data.weeks * self.data.hours);
      } else if (personnel.payType === 'Per Student') {
        value += personnel.rate * FICA * personnel.count * self.data.minParticipants;        
      }
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
  self.submit = function () {
    var url = "http://localhost:8080/api/form/"
    if (self.id) {
      url += self.id
    }
      $http.post(url, 
        { programArea: self.data.target.name,
          title: self.data.title,
          category: self.data.category,
          facility: self.data.facility,
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
      self.selectedTab = 5;
      self.id = response.data.message._id;
    });
  }
  self.getHistory = function () {
    $http.get("http://localhost:8080/api/form").then(function (results) {
      self.history = results.data;
    });
  }
  self.selectEntry = function (entry) {
    //self.data.programArea = $filter('filter')(self.targets, entry.programArea);
    self.id = entry._id;
    self.data.target = $filter('filter')(self.targets, entry.programArea)[0];
    self.data.category = $filter('filter')(self.data.target.services, entry.category)[0];
    self.data.title = entry.title;
    self.data.start = new Date(entry.start);
    self.data.facility = entry.facility;
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
  self.targets = [{
  "name": "Active Adults",
  "services": [{
    "name": "Senior Advanced",
    "value": 0.06
  }, {
    "name": "Senior Beginner",
    "value": 0.18
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.40
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.00
  }, {
    "name": "Trips",
    "value": 0.56
  }]
}, {
  "name": "Aquatics",
  "services": [{
    "name": "Adult Advanced",
    "value": 0.40
  }, {
    "name": "Adult Beginner",
    "value": 0.17
  }, {
    "name": "Private/Semi Private Lesson",
    "value": 0.25
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.20
  }, {
    "name": "Youth Advanced",
    "value": 0.27
  }, {
    "name": "Youth Beginner",
    "value": 0.53
  }, {
    "name": "Youth Leagues",
    "value": 0.53
  }]
}, {
  "name": "Art Centers",
  "services": [{
    "name": "Adult Advanced",
    "value": 1.00
  }, {
    "name": "Adult Beginner",
    "value": 1.19
  }, {
    "name": "Merchandise for Resale",
    "value": 1.07
  }, {
    "name": "Private/Semi Private Lesson",
    "value": 0.20
  }, {
    "name": "Senior Beginner",
    "value": 0.51
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.07
  }, {
    "name": "Specialty Camps",
    "value": 0.87
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.02
  }, {
    "name": "Trips",
    "value": 0.26
  }, {
    "name": "Youth Beginner",
    "value": 0.50
  }]
}, {
  "name": "Athletics",
  "services": [{
    "name": "Adult League",
    "value": 0.21
  }, {
    "name": "Adult Tournament",
    "value": 0.05
  }, {
    "name": "Staffed Park/Facility Usag",
    "value": 0.00
  }, {
    "name": "Youth Beginner",
    "value": 0.07
  }, {
    "name": "Youth League",
    "value": 0.26
  }]
}, {
  "name": "Camp Ranoca",
  "services": [{
    "name": "School Calender based Programs/General Camps",
    "value": 0.68
  }, {
    "name": "Specialty Camps",
    "value": 0.23
  }]
}, {
  "name": "Community Centers",
  "services": [{
    "name": "Adult Advanced",
    "value": 0.20
  }, {
    "name": "Adult Beginner",
    "value": 0.94
  }, {
    "name": "Adult Leagues",
    "value": 0.26
  }, {
    "name": "Adult Tournaments",
    "value": 0.09
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.09
  }, {
    "name": "Private/Semi Private Lesson",
    "value": 0.28
  }, {
    "name": "School Calender based Programs/General Camps",
    "value": 0.28
  }, {
    "name": "Senior Beginner",
    "value": 0.07
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.03
  }, {
    "name": "Specialty Camps",
    "value": 1.15
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.01
  }, {
    "name": "Trips",
    "value": 0.01
  }, {
    "name": "Youth Advanced",
    "value": 0.10
  }, {
    "name": "Youth Beginner",
    "value": 1.15
  }, {
    "name": "Youth Leagues",
    "value": 0.08
  }, {
    "name": "Youth Tournaments",
    "value": 0.00
  }]
}, {
  "name": "ESL Programs",
  "services": [{
    "name": "Adult Beginner",
    "value": 0.01
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.00
  }, {
    "name": "Youth Beginner",
    "value": 0.00
  }]
}, {
  "name": "Historic Resources and Museums",
  "services": [{
    "name": "Attractions",
    "value": 2.21
  }, {
    "name": "Consessions and Vending",
    "value": 0.88
  }, {
    "name": "Merchandise for Resale",
    "value": 1.16
  }, {
    "name": "School Calender based Programs/General Camps",
    "value": 0.03
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.09
  }, {
    "name": "Specialty Camps",
    "value": 0.59
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.00
  }]
}, {
  "name": "Nature Camp",
  "services": [{
    "name": "Adult Beginner",
    "value": 0.01
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.14
  }, {
    "name": "Youth Beginner",
    "value": 0.04
  }]
}, {
  "name": "Nature Centers",
  "services": [{
    "name": "Adult Advanced",
    "value": 0.00
  }, {
    "name": "Adult Beginner",
    "value": 0.04
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.05
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.00
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.00
  }, {
    "name": "Youth Beginner",
    "value": 0.23
  }]
}, {
  "name": "Nature Programs",
  "services": [{
    "name": "Adult Beginner",
    "value": 0.00
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.00
  }, {
    "name": "Youth Beginner",
    "value": 0.06
  }]
}, {
  "name": "Outdoor Rec & Lakes",
  "services": [{
    "name": "Adult Beginner",
    "value": 0.39
  }, {
    "name": "Merchandise for Resale",
    "value": 1.42
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.02
  }, {
    "name": "Private/Semi Private Lesson",
    "value": 0.04
  }, {
    "name": "School Calender based Programs/General Camps",
    "value": 0.03
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.00
  }, {
    "name": "Specialty Camps",
    "value": 0.36
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.04
  }, {
    "name": "Trips",
    "value": 0.07
  }, {
    "name": "Youth Beginner",
    "value": 0.09
  }]
}, {
  "name": "Pullen Amusements",
  "services": [{
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.48
  }]
}, {
  "name": "School Based Programs",
  "services": [{
    "name": "School Calender based Programs/General Camps",
    "value": 0.73
  }]
}, {
  "name": "Specialized Recreation",
  "services": [{
    "name": "Adult Advanced",
    "value": 0.01
  }, {
    "name": "Adult Beginner",
    "value": 0.07
  }, {
    "name": "Inclusion Services",
    "value": 0.14
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.06
  }, {
    "name": "School Calender based Programs/General Camps",
    "value": 0.59
  }, {
    "name": "Specialty Camps",
    "value": 0.14
  }, {
    "name": "Trips",
    "value": 0.09
  }, {
    "name": "Youth Beginner",
    "value": 0.02
  }]
}, {
  "name": "Teen Programs",
  "services": [{
    "name": "School Calender based Programs/General Camps",
    "value": 0.50
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.00
  }, {
    "name": "Specialty Camps",
    "value": 0.29
  }, {
    "name": "Youth Beginner",
    "value": 0.04
  }]
}, {
  "name": "Tennis",
  "services": [{
    "name": "Adult Advanced",
    "value": 2.64
  }, {
    "name": "Adult Beginner",
    "value": 1.22
  }, {
    "name": "Adult Leagues",
    "value": 0.19
  }, {
    "name": "Merchandise for Resale",
    "value": 0.65
  }, {
    "name": "Private/Semi Private Lesson",
    "value": 0.81
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.00
  }, {
    "name": "Youth Advanced",
    "value": 0.78
  }, {
    "name": "Youth Beginner",
    "value": 0.85
  }, {
    "name": "Youth Leagues",
    "value": 0.10
  }, {
    "name": "Youth Tournaments",
    "value": 1.21
  }]
}, {
  "name": "VHIP",
  "services": [{
    "name": "Adult Beginner",
    "value": 0.17
  }, {
    "name": "Adult Leagues",
    "value": 0.16
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.16
  }, {
    "name": "Trips",
    "value": 0.26
  }]
}, {
  "name": "Youth Programs",
  "services": [{
    "name": "School Calender based Programs/General Camps",
    "value": 0.21
  }, {
    "name": "Specialty Camps",
    "value": 0.47
  }]
}];  
  // Load all registered users

  UsersDataService
        .loadAllUsers()
        .then( function( users ) {
          self.users    = [].concat(users);
          self.selected = users[0];
        });

  // *********************************
  // Internal methods
  // *********************************

  /**
   * Hide or Show the 'left' sideNav area
   */
  function toggleUsersList() {
    $mdSidenav('left').toggle();
  }

  /**
   * Select the current avatars
   * @param menuId
   */
  function selectUser ( user ) {
    self.selected = angular.isNumber(user) ? $scope.users[user] : user;
  }
}

export default [ 'UsersDataService', '$mdSidenav', '$http', '$filter', '$scope',  '$timeout', AppController ];
