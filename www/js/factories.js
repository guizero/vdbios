angular.module('vdb_app.factories', [])

.factory('apiService', function($http, $localstorage, $state, $ionicLoading, $cordovaDialogs) {
	var server = "http://www.vestidasdebranco.com.br/api";
	var users = [];
	var offers = [];
	var vouchers = [];

	var flattenObj = function (object, target, prefix) {
	    target = target || {};
	    prefix = prefix || '';
	    angular.forEach(object, function (value, key) {
	        if (angular.isObject(value)) {
	            flattenObj(value, target, prefix + key + '.');
	        } else {
	            target[key.replace(prefix, "")] = value;
	        }
	    });
	    return target;
	};

	var apiService = {

		retrieveData: function(path, data) {
			$ionicLoading.show({ template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Carregando...</p>' });
			return $http({
			    method: 'POST',
			    url: server+path, 
			    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			    // For backend reasons we have to convert the request data into a query, otherwise it would not work properly.
			    transformRequest: function(obj) {
			        var str = [];
			        for(var p in obj)
			        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			        return str.join("&");
			    },
			    data: data
			}).then(function(response){
				console.log(response);
				$ionicLoading.hide();
				if(response.data.erro) {
					$cordovaDialogs.alert(response.data.erro, "Erro", "Ok!");
				}
				return response;
			});
		},

		login: function(email, password, type){
			return apiService.retrieveData("/login/api.php", {email: email, senha: password, tipo: type} ).then(function(response){
				return response;
			});
		},

		refer: function(referral_data) {
			/* jshint esnext: true */
			data = (flattenObj({tokenAcesso: $localstorage.get("token"), referral_data, tipo: parseInt($localstorage.get("tipo"))}));
			return apiService.retrieveData("/indicar/api.php", data);
		},

		getOffers: function() {
			return apiService.retrieveData("/noiva/carregarOfertas/api.php", {tokenAcesso: $localstorage.get("token")} ).then(function(response){
				// If there is a problem with the token, we go back to the login screen.
				if (response.data.erro) {
					apiService.logout();
				}
				offers = response;
				return response;
			});
		},

		getOffer: function(index){
			return offers.data[index];
		},

		requestInfo: function(codVoucher) {
			return apiService.retrieveData("/noiva/interesseVoucher/api.php", {tokenAcesso: $localstorage.get("token"), codVoucher: codVoucher}).then(function(response){
				return response;
			});
		},

		requestVoucher: function(offer_id) {
			return apiService.retrieveData("/noiva/gerarVoucher/api.php", {tokenAcesso: $localstorage.get("token"), codVoucher: offer_id} ).then(function(response){
				// As the server is not responding to errors correctly, we gotta create errors ourselves.
				if(response.data.codVoucherMD5) {
					vouchers = [];
					vouchers = {data: [response.data]};
					return vouchers.data.length;	
				} else {
					return { erro: "Voucher já utilizado, ou erro"};
				}
							
			});
		},

		getVouchers: function(){
			return apiService.retrieveData("/noiva/vouchersGerados/api.php", {tokenAcesso: $localstorage.get("token")} ).then(function(response){
				// If there is a problem with the token, we go back to the login screen.
				if (response.erro) {
					apiService.logout();
				}
				vouchers = response;
				return response;
			});
		},

		getGeneratedVouchers: function(){
			return apiService.retrieveData("/fornecedor/vouchersGerados/api.php", {tokenAcesso: $localstorage.get("token")} ).then(function(response){
				return response;
			});
		},

		getVoucher: function(index){
			return vouchers.data[index];
		},

		getInterestedBrides: function(){
			return apiService.retrieveData("/fornecedor/noivasInteressadas/api.php", {tokenAcesso: $localstorage.get("token")} ).then(function(response){
				// If there is a problem with the token, we go back to the login screen.
				return response;
			});
		},

		validateVoucher: function(md5, points) {
			return apiService.retrieveData("/fornecedor/validarVoucher/api.php", {tokenAcesso: $localstorage.get("token"), codVoucherMD5: md5, pontos: points }).then(function(response){
			});
		},

		logout: function() {
			window.localStorage.clear();
			$state.go('auth.welcome');
			return;
		}

	};

	return apiService;
	
})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  };
}])


;