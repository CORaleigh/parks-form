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

      if (personnel.payType === 'Hourly') {
        value += personnel.rate * personnel.count * (self.data.weeks * self.data.hours);
      } else if (personnel.payType === 'Per Student') {
        value += personnel.rate * personnel.count * self.data.minParticipants;        
      }
      if (personnel.status === "Payroll") {
        value *= FICA;
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
    var url = "http://mapstest.raleighnc.gov/parks-form-api/form/"
    if (self.id) {
      url += self.id
    }
      $http.post(url, 
        { programArea: self.data.target.name,
          title: self.data.title,
          category: self.data.category,
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
      self.selectedTab = 4;
      self.id = response.data.message._id;
    });
  }
  self.getHistory = function () {
    $http.get("http://mapstest.raleighnc.gov/parks-form-api/form").then(function (results) {
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
    "value": 0.75
  }, {
    "name": "Senior Beginner",
    "value": 0.50
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.25
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.05
  }, {
    "name": "Trips",
    "value": 1.00
  }]
}, {
  "name": "Aquatics",
  "services": [{
    "name": "Adult Advanced",
    "value": 0.75
  }, {
    "name": "Adult Beginner",
    "value": 0.50
  }, {
    "name": "Private/Semi Private Lesson",
    "value": 1.00
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.05
  }, {
    "name": "Youth Advanced",
    "value": 0.75
  }, {
    "name": "Youth Beginner",
    "value": 0.25
  }, {
    "name": "Youth Leagues",
    "value": 0.50
  }]
}, {
  "name": "Art Centers",
  "services": [{
    "name": "Adult Advanced",
    "value": 0.75
  }, {
    "name": "Adult Beginner",
    "value": 0.50
  }, {
    "name": "Merchandise for Resale",
    "value": 1.00
  }, {
    "name": "Private/Semi Private Lesson",
    "value": 1.00
  }, {
    "name": "Senior Beginner",
    "value": 0.50
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.25
  }, {
    "name": "Specialty Camps",
    "value": 0.75
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.05
  }, {
    "name": "Trips",
    "value": 1.00
  }, {
    "name": "Youth Beginner",
    "value": 0.25
  }]
}, {
  "name": "Athletics",
  "services": [{
    "name": "Adult League",
    "value": 0.50
  }, {
    "name": "Adult Tournament",
    "value": 1.00
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.05
  }, {
    "name": "Youth Beginner",
    "value": 0.25
  }, {
    "name": "Youth League",
    "value": 0.50
  }]
}, {
  "name": "Camp Ranoca",
  "services": [{
    "name": "School Calender based Programs/General Camps",
    "value": 0.50
  }, {
    "name": "Specialty Camps",
    "value": 0.75
  }]
}, {
  "name": "Community Centers",
  "services": [{
    "name": "Adult Advanced",
    "value": 0.75
  }, {
    "name": "Adult Beginner",
    "value": 0.50
  }, {
    "name": "Adult Leagues",
    "value": 0.50
  }, {
    "name": "Adult Tournaments",
    "value": 1.00
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.50
  }, {
    "name": "Private/Semi Private Lesson",
    "value": 1.00
  }, {
    "name": "School Calender based Programs/General Camps",
    "value": 0.50
  }, {
    "name": "Senior Beginner",
    "value": 0.50
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.25
  }, {
    "name": "Specialty Camps",
    "value": 0.75
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.05
  }, {
    "name": "Trips",
    "value": 1.00
  }, {
    "name": "Youth Advanced",
    "value": 0.75
  }, {
    "name": "Youth Beginner",
    "value": 1.25
  }, {
    "name": "Youth Leagues",
    "value": 0.50
  }, {
    "name": "Youth Tournaments",
    "value": 0.50
  }]
}, {
  "name": "ESL Programs",
  "services": [{
    "name": "Adult Beginner",
    "value": 0.50
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.25
  }, {
    "name": "Youth Beginner",
    "value": 0.25
  }]
}, {
  "name": "Historic Resources and Museums",
  "services": [{
    "name": "Attractions",
    "value": 0.50
  }, {
    "name": "Consessions and Vending",
    "value": 0.75
  }, {
    "name": "Merchandise for Resale",
    "value": 1.10
  }, {
    "name": "School Calender based Programs/General Camps",
    "value": 0.50
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.25
  }, {
    "name": "Specialty Camps",
    "value": 0.75
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.05
  }]
}, {
  "name": "Nature Camp",
  "services": [{
    "name": "Adult Beginner",
    "value": 0.50
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.50
  }, {
    "name": "Youth Beginner",
    "value": 0.25
  }]
}, {
  "name": "Nature Centers",
  "services": [{
    "name": "Adult Advanced",
    "value": 0.75
  }, {
    "name": "Adult Beginner",
    "value": 0.50
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.50
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.25
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.05
  }, {
    "name": "Youth Beginner",
    "value": 0.25
  }]
}, {
  "name": "Nature Programs",
  "services": [{
    "name": "Adult Beginner",
    "value": 0.50
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.50
  }, {
    "name": "Youth Beginner",
    "value": 0.25
  }]
}, {
  "name": "Outdoor Rec & Lakes",
  "services": [{
    "name": "Adult Beginner",
    "value": 0.50
  }, {
    "name": "Merchandise for Resale",
    "value": 1.40
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.50
  }, {
    "name": "Private/Semi Private Lesson",
    "value": 1.00
  }, {
    "name": "School Calender based Programs/General Camps",
    "value": 0.50
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.25
  }, {
    "name": "Specialty Camps",
    "value": 0.75
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.05
  }, {
    "name": "Trips",
    "value": 1.00
  }, {
    "name": "Youth Beginner",
    "value": 0.25
  }]
}, {
  "name": "Pullen Amusements",
  "services": [{
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.25
  }]
}, {
  "name": "School Based Programs",
  "services": [{
    "name": "School Calender based Programs/General Camps",
    "value": 0.50
  }]
}, {
  "name": "Specialized Recreation",
  "services": [{
    "name": "Adult Advanced",
    "value": 0.75
  }, {
    "name": "Adult Beginner",
    "value": 0.50
  }, {
    "name": "Inclusion Services",
    "value": 0.14
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.50
  }, {
    "name": "School Calender based Programs/General Camps",
    "value": 0.50
  }, {
    "name": "Specialty Camps",
    "value": 0.75
  }, {
    "name": "Trips",
    "value": 1.00
  }, {
    "name": "Youth Beginner",
    "value": 0.25
  }]
}, {
  "name": "Teen Programs",
  "services": [{
    "name": "School Calender based Programs/General Camps",
    "value": 0.50
  }, {
    "name": "Small-Scale/Large-Scale Special Events",
    "value": 0.25
  }, {
    "name": "Specialty Camps",
    "value": 0.75
  }, {
    "name": "Youth Beginner",
    "value": 0.25
  }]
}, {
  "name": "Tennis",
  "services": [{
    "name": "Adult Advanced",
    "value": 0.75
  }, {
    "name": "Adult Beginner",
    "value": 0.50
  }, {
    "name": "Adult Leagues",
    "value": 0.50
  }, {
    "name": "Merchandise for Resale",
    "value": 0.60
  }, {
    "name": "Private/Semi Private Lesson",
    "value": 1.00
  }, {
    "name": "Staffed Park/Facility Usage",
    "value": 0.05
  }, {
    "name": "Youth Advanced",
    "value": 0.75
  }, {
    "name": "Youth Beginner",
    "value": 0.25
  }, {
    "name": "Youth Leagues",
    "value": 0.50
  }, {
    "name": "Youth Tournaments",
    "value": 0.50
  }]
}, {
  "name": "VHIP",
  "services": [{
    "name": "Adult Beginner",
    "value": 0.50
  }, {
    "name": "Adult Leagues",
    "value": 0.50
  }, {
    "name": "Mixed Age/Family Muli-level",
    "value": 0.50
  }, {
    "name": "Trips",
    "value": 1.00
  }]
}, {
  "name": "Youth Programs",
  "services": [{
    "name": "School Calender based Programs/General Camps",
    "value": 0.50
  }, {
    "name": "Specialty Camps",
    "value": 0.75
  }]
}]; 

self.facilities = [
{name: "Abbotts Creek Community Center"},
{name: "Anderson Point"},
{name: "Anne Gordon Center for Active Adults"},
{name: "Annie Louise Wilkerson Nature Preserve"},
{name: "Baileywick Park"},
{name: "Barwell Road Community Center"},
{name: "Beaver Dam Creek Park"},
{name: "Biltmore Hills Community Center"},
{name: "Biltmore Pool"},
{name: "Brentwood Park"},
{name: "Brier Creek Community Center"},
{name: "Brookhaven Nature Park"},
{name: "Buffaloe Rd Aquatic Center"},
{name: "Buffaloe Road Athletic Park"},
{name: "Carolina Pines Community Center"},
{name: "Cedar Hills Park"},
{name: "Chavis Carousel"},
{name: "Chavis Community Center"},
{name: "Chavis Pool"},
{name: "City Plaza"},
{name: "Compiegne Park"},
{name: "Durant Nature Preserve"},
{name: "Eastgate Park"},
{name: "Eliza Pool Park"},
{name: "Fallon Park"},
{name: "Five Points Center for Active Adults"},
{name: "Fletcher Park"},
{name: "Frank E Evans Administrative Bldg."},
{name: "Gardner Park"},
{name: "Glen Eden Park"},
{name: "Green Road Community Center"},
{name: "Greystone Community Center"},
{name: "Halifax Community Center"},
{name: "Hill Street Center"},
{name: "Honeycutt Park"},
{name: "Horseshoe Farm Nature Preserve"},
{name: "Isabella Cannon"},
{name: "Jaycee Community Center"},
{name: "John P 'Top' Greene Center"},
{name: "Kentwood Park"},
{name: "Kiwanis Park"},
{name: "Lake Johnson"},
{name: "Lake Johnson Pool"},
{name: "Lake Lynn Community Center"},
{name: "Lake Wheeler"},
{name: "Laurel Hills Community Center"},
{name: "Lions Park Community Center"},
{name: "Longview Pool"},
{name: "Magnolia Cottage"},
{name: "Marsh Creek Maintenance"},
{name: "Marsh Creek Park"},
{name: "Method Road Community Center"},
{name: "Millbrook Exchange Community Center"},
{name: "Millbrook Pool"},
{name: "Millbrook Tennis Center"},
{name: "Moore Square"},
{name: "Mordecai Historic Park"},
{name: "Nash Square"},
{name: "Non-City Owned Site"},
{name: "North Hills Park"},
{name: "Northeast Outreach Center"},
{name: "Oakwood Park"},
{name: "Optimist Community Center"},
{name: "Optimist Pool"},
{name: "Peach Road"},
{name: "Powell Drive Park"},
{name: "Pullen Amusements"},
{name: "Pullen Aquatic Center"},
{name: "Pullen Arts Center"},
{name: "Pullen Community Center"},
{name: "Pullen Park Tennis Courts"},
{name: "Raleigh City Museum"},
{name: "Raleigh Little Theater"},
{name: "Ralph Campbell Community Center"},
{name: "Ridge Road Pool"},
{name: "Roberts Park Community Center"},
{name: "Sanderford Road Park"},
{name: "Sertoma Arts Center"},
{name: "Sgt. Courtney T. Johnson Center"},
{name: "Shelley Lake"},
{name: "Spring Forest Road Park"},
{name: "St. Monica  Teen Center"},
{name: "Tarboro Road Community Center"},
{name: "Tucker House"},
{name: "Walnut Creek Wetland Center"},
{name: "Walnut Terrace Neighborhood Center"},
{name: "WCSC (Walnut Creek Softball Complex"},
{name: "Wilkerson Nature Preserve"},
{name: "Williams Park"},
{name: "Worthdale Community Center"}
];
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
