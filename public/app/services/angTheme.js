angular.module('angTheme', ['ngMaterial', 'ngAria', 'hammer'])
.config(function($mdThemingProvider)
{
	$mdThemingProvider.theme('default')
	.primaryPalette('indigo')
	.accentPalette('blue');
});