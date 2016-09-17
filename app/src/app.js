// Load libraries
import angular from 'angular';

import 'angular-animate';
import 'angular-aria';
import 'angular-material';

import AppController from 'src/AppController';
import Users from 'src/users/Users';

export default angular.module( 'starter-app', [ 'ngMaterial', 'ngAnimate', Users.name ] )
  .config(($mdIconProvider, $mdThemingProvider, $httpProvider) => {
    // Register the user `avatar` icons
    $mdIconProvider
      .defaultIconSet("./assets/svg/avatars.svg", 128)
      .icon("menu", "./assets/svg/menu.svg", 24)
      .icon("share", "./assets/svg/share.svg", 24)
      .icon("google_plus", "./assets/svg/google_plus.svg", 24)
      .icon("hangouts", "./assets/svg/hangouts.svg", 24)
      .icon("twitter", "./assets/svg/twitter.svg", 24)
      .icon("phone", "./assets/svg/phone.svg", 24)
      .icon("feedback", "./assets/svg/ic_feedback_black_24px.svg", 24)
      .icon("down", "./assets/svg/ic_keyboard_arrow_down_white_24px.svg", 24)
      .icon("up", "./assets/svg/ic_keyboard_arrow_up_white_24px.svg", 24);            

    $mdThemingProvider.theme('default')
      .primaryPalette('green')
      .accentPalette('blue');
    $httpProvider.defaults.headers.delete = { 'Accept' : 'application/json' };
  })
  .controller('AppController', AppController);
