angular.module('underscore', [])
.factory('_', function() {
  return window._;
});


angular.module('vdb_app', [
  'ionic','ionic.service.core',
  'vdb_app.directives',
  'vdb_app.controllers',
  'vdb_app.factories',
  // 'vdb_app.views',
  'underscore',
  'ja.qr',
  'ngMessages',
  'ngCordova'
])

.run(function($ionicPlatform, $state, $localstorage) {
  $ionicPlatform.ready(function() {
    cordova.exec.setJsToNativeBridgeMode(cordova.exec.jsToNativeModes.XHR_NO_PAYLOAD);
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // If there is a set token, we skip login screen!
    if($localstorage.get("token")) {      
      return $localstorage.get("tipo") == "2" ? $state.go("tab.dash") : $state.go("supplier");
    }

    // These are native page transitions plugin's configurations
    window.plugins.nativepagetransitions.globalOptions.duration = 300;
    window.plugins.nativepagetransitions.globalOptions.iosdelay = 350;
    window.plugins.nativepagetransitions.globalOptions.androiddelay = 100;
    window.plugins.nativepagetransitions.globalOptions.winphonedelay = 350;
    window.plugins.nativepagetransitions.globalOptions.slowdownfactor = 4;
    // these are used for slide left/right only currently
    window.plugins.nativepagetransitions.globalOptions.fixedPixelsTop = 0;
    window.plugins.nativepagetransitions.globalOptions.fixedPixelsBottom = 0;
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Force tabs to bottom
  $ionicConfigProvider.tabs.position("bottom");
  // Force navbar title to center
  $ionicConfigProvider.navBar.alignTitle("center");
  // Disable ionic transitions
  $ionicConfigProvider.views.transition('none');

  // Router
  $stateProvider

  .state('auth', {
    url: "/auth",
    templateUrl: "views/auth.html",
    abstract: true
  })

  .state('auth.welcome', {
    url: '/welcome',
    templateUrl: "views/welcome.html",
    controller: 'WelcomeCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:
  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'views/tab-offers.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.offer-detail', {
      url: '/offers/:offerId',
      views: {
        'tab-dash': {
          templateUrl: 'views/offer-detail.html',
          controller: 'OfferCtrl'
        }
      }
    })

  .state('tab.vouchers', {
    url: '/vouchers',
    cache: false,
    views: {
      'tab-vouchers': {
        templateUrl: 'views/tab-vouchers.html',
        controller: 'VouchersCtrl'
      }
    }
  })

  .state('tab.voucher-detail', {
    cache: false,
    url: '/vouchers/:voucherId',
    views: {
      'tab-vouchers': {
        templateUrl: 'views/voucher-detail.html',
        controller: 'VoucherCtrl'
      }
    }
  })

  .state('tab.referral', {
    url: '/referral',
    views: {
      'tab-referral': {
        templateUrl: 'views/tab-referral.html',
        controller: 'ReferralCtrl'
      }
    }
  })

  // Begin of suppliers app

  .state('supplier', {
    url: '/supplier',
    templateUrl: "views/supplier.html",
    controller: 'SupplierCtrl'
  })

  .state('interested_brides', {
    url: '/interested_brides',
    templateUrl: "views/interested_brides.html",
    controller: 'InterestedBridesCtrl'
  })

  .state('generated_vouchers', {
    url: '/generated_vouchers',
    templateUrl: "views/generated_vouchers.html",
    controller: 'GeneratedVouchersCtrl'
  })

  .state('suplier_referral', {
    url: '/suplier_referral',
    templateUrl: "views/tab-referral.html",
    controller: 'ReferralCtrl'
  })
  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/auth/welcome');
})

;
