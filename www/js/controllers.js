angular.module('vdb_app.controllers', [])

.controller('WelcomeCtrl', function($scope, $ionicPopup, $ionicLoading, $timeout, $state, apiService, $localstorage){

	var loginPopup = {},
			signUpPopup = {},
			forgotPasswordPopup = {};

	$scope.user = {};

	$scope.showLogIn = function(type) {
		var title = type.substring(0,1).toUpperCase()+type.substring(1);
		loginPopup = $ionicPopup.show({
			cssClass: 'popup-outer auth-view',
			templateUrl: 'views/partials/login-'+type+'.html',
			scope: $scope,
			title: 'Acesso '+title,
			buttons: [
				{ text: '', type: 'close-popup ion-ios-close-outline' }
			]
		});
	};

	$scope.showFAQ = function() {
		signUpPopup = $ionicPopup.show({
			cssClass: 'popup-outer auth-view',
			templateUrl: 'views/partials/faq.html',
			scope: $scope,
			title: 'Sobre / Como Participar?',
			buttons: [
				{ text: '', type: 'close-popup ion-ios-close-outline' }
			]
		});
	};

	$scope.showForgotPassword = function() {

		loginPopup.close();

		//this timeout is required to let loginPopup close successfully.
		$timeout(function() {
			forgotPasswordPopup = $ionicPopup.show({
				cssClass: 'popup-outer auth-view',
				templateUrl: 'views/partials/forgot-password.html',
				scope: $scope,
				title: 'Reset your password',
				buttons: [
					{ text: '', type: 'close-popup ion-ios-close-outline' }
				]
			});
	  }, 0);
	};

	$scope.doLogIn = function(user, type){
		$scope.error = "";

		$ionicLoading.show({ template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Conectando...</p>' });
		
		// Connect to the APISERVICE in order to retrieve the correct info
		apiService.login(user.email, user.password, type).then(function(result) {
			if(result.status == 200) {

				// We only connect IF there is an access token.
				if(result.data.tokenAcesso) {
					window.localStorage.clear();
					$localstorage.set("token", result.data.tokenAcesso);
          $localstorage.set("tipo", type);

          if(type == 2) {
            $localstorage.set("id", result.data.codNoiva);
            $localstorage.set("nome", result.data.nome);
            $localstorage.set("indicacoes", result.data.indicacoes);
            $state.go("tab.dash");
          } else {
            $localstorage.set("id", result.data.codFornecedor);
            $localstorage.set("email", result.data.email);
            $state.go("supplier");
          }					
					loginPopup.close();
				} else {
					$scope.error = "E-mail ou senha inválidos";
				}				
			} else {
				$scope.error = "Não foi possível conectar ao servidor! Verifique sua conexão com a internet.";
			}
			$ionicLoading.hide();
		});

	};

	$scope.requestNewPassword = function() {
		forgotPasswordPopup.close();
	};


})

.controller('OfferCtrl', function($scope, _, apiService, $stateParams, $ionicHistory, $ionicLoading, $state, $cordovaDialogs){
	$scope.offer = apiService.getOffer($stateParams.offerId);

	$scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

  $scope.getVoucher = function(offer_id) {
  	$ionicLoading.show({ template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Gerando voucher...</p>' });
  	apiService.requestVoucher(offer_id).then(function(data) {
  		if(data.erro) {
  			$cordovaDialogs.alert(data.erro, 'Erro', 'Ok!');
  		} else {
 				$state.go('tab.voucher-detail', {voucherId: (data-1)});
 			}
 			$ionicLoading.hide();
  	});
  };

  $scope.requestInfo = function(codVoucher) {
  	$ionicLoading.show({ template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Gerando voucher...</p>' });
  	apiService.requestInfo(codVoucher).then(function(data) {
  		if(data.data.OK) {
  			$cordovaDialogs.alert("Email enviado para o fornecedor, favor aguardar contato!", 'Enviado', 'Ok!');
  		} else {
  			$cordovaDialogs.alert("Erro ao contatar o fornecedor, favor tentar mais tarde", 'Erro', 'Ok!');
  		}
 			$ionicLoading.hide();
  	});
  };

})

.controller('DashCtrl', function($scope, _, apiService, $ionicPopup) {
	apiService.getOffers().then(function(data) {
	  $scope.cards = data.data;
    $scope.categorias = _.chain(data.data).pluck('categoria').unique().value();
    $scope.categorias = _.sortBy($scope.categorias, function(s){ 
        return s;
    });
	});

  $scope.logOut = function() {
    $ionicPopup.confirm({
      title: 'Sair',
      subTitle: 'Deseja desconectar?', 
      cancelText: 'Não', 
      okText: 'Sim',
    }).then(function(res) {
     if(res) {
       apiService.logout();
     }
    });
   };

	$scope.doRefresh = function() {
		apiService.getOffers().then(function(data) {
		    $scope.cards = data.data;
		});
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply();
  };
})

.controller('VouchersCtrl', function($scope, _, apiService) {
	apiService.getVouchers().then(function(data) {
	  $scope.vouchers = data.data;
	});

	$scope.doRefresh = function() {
		apiService.getVouchers().then(function(data) {
		  $scope.vouchers = data.data;
		});
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply();
  };
})

.controller('VoucherCtrl', function($scope, _, apiService, $stateParams, $state){
	$scope.voucher = apiService.getVoucher($stateParams.voucherId);

  console.log($scope.voucher);

	$scope.myGoBack = function() {
    $state.go('tab.vouchers');
  };
})


.controller('ReferralCtrl', function($scope, $localstorage, apiService, $filter, $ionicHistory, $window, $cordovaDialogs) {

	$scope.can_refer = ($localstorage.get("indicacoes") == "1" || $localstorage.get("tipo") == "1") ? true : false;
  $scope.supplier = $localstorage.get("tipo") == "1" ? true : false;
	$scope.referral = {
    nome: "",
    email: "",
    telefone: "",
    dataCasamento: "",
    operadora: "",
    tipoTel: "",

  };
	
  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

	$scope.sendInvite = function() {
    $scope.referral.dataCasamento = $filter('date')($scope.referral.dataCasamento, "dd/MM/yyyy");
    var valid = $scope.validateForm();
    console.log($scope.referral);
    if(valid) {
      apiService.refer($scope.referral).then(function(data) {
        if(!data.data.erro) {
          $localstorage.set("indicacoes", 0);
          $cordovaDialogs.alert("Noiva indicada com sucesso!", 'Sucesso', 'Ok!');
          $window.location.reload(true);
        }
      });
    }
    
	};

  $scope.validateForm = function() {
    if ($scope.referral.nome === "") {
      $cordovaDialogs.alert('Você deve preencher o nome', 'Erro', 'Ok!');
      return false;
    }
    if ($scope.referral.email === "") {
      $cordovaDialogs.alert("Você deve preencher o email", 'Erro', 'Ok!');
      return false;
    }
    if ($scope.referral.telefone === "") {
      $cordovaDialogs.alert("Você deve preencher o telefone", 'Erro', 'Ok!');
      return false;
    }
    if ($scope.referral.dataCasamento === "") {
      $cordovaDialogs.alert("Você deve preencher a data do casamento", 'Erro', 'Ok!');
      return false;
    }
    if ($scope.referral.tipoTel === "") {
      $cordovaDialogs.alert("Você deve selecionar o tipo de telefone", 'Erro', 'Ok!');
      return false;
    }
    if ($scope.referral.operadora === "") {
      $cordovaDialogs.alert("Você deve selecionar a operadora", 'Erro', 'Ok!');
      return false;
    }  
    return true;
  };

})

.controller('ChatDetailCtrl', function($scope, $stateParams) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('SupplierCtrl', function($scope, apiService, $ionicPopup, $ionicLoading, $cordovaBarcodeScanner, $state, $rootScope) {

  $scope.points = 1;

  $rootScope.$on('validate_md5', function(event, data) {
    $scope.voucher = data;
    $scope.md5popUp();
  });

  $scope.goToState = function(state) {
    $state.go(state);

  };

  $scope.pointsrange = function(min, max, step) {
      step = step || 1;
      var input = [];
      for (var i = min; i <= max; i += step) {
          input.push(i);
      }
      return input;
  };

  $scope.logOut = function() {
    apiService.logout();
  };

  $scope.validateVoucher = function(voucher, points) {
    apiService.validateVoucher(voucher, parseInt(points)).then(function(data) {
    });
  };

  $scope.md5popUp = function(type) {
    var title = "Validar voucher por código";
    md5popUp = $ionicPopup.show({
      cssClass: 'popup-outer auth-view',
      templateUrl: 'views/partials/voucher-popup.html',
      scope: $scope,
      title: title,
      buttons: [
        { text: '', type: 'close-popup ion-ios-close-outline' }
      ]
    });
  };

  $scope.scanBarcode = function() {
      $cordovaBarcodeScanner.scan().then(function(imageData) {
          $scope.voucher = imageData.text;
          $scope.md5popUp();
      }, function(error) {
          console.log("An error happened -> " + error);
      });
  };

})

.controller('InterestedBridesCtrl', function($scope, _, apiService, $ionicHistory) {
  apiService.getInterestedBrides().then(function(data) {
    $scope.brides = data.data;
  });

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

  $scope.doRefresh = function() {
    apiService.getInterestedBrides().then(function(data) {
      $scope.brides = data.data;
    });
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply();
  };
})

.controller('GeneratedVouchersCtrl', function($scope, _, apiService, $ionicHistory, $rootScope, $state) {
  apiService.getGeneratedVouchers().then(function(data) {
    $scope.vouchers = data.data;
  });

  $scope.validate = function(md5) {
    $rootScope.$broadcast('validate_md5', md5);
    $state.go('supplier');
  };

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

  $scope.doRefresh = function() {
    apiService.getGeneratedVouchers().then(function(data) {
      $scope.vouchers = data.data;
    });
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply();
  };
})


;