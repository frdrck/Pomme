var pomme = angular.module('pomme', []);



var PommeCtrl = function($scope) {

  $scope.phases = ['bid', 'judge', 'vote', 'win'];
  $scope.currentPhase = 'bid';

  $scope.table = 'bid';
  $scope.cards = 'hand';

  $scope.mainImage = 'img/001a58yk.jpg';
  $scope.winner = 'img/_CRYINGtumblr_lg0znypSUC1qazkdco1_500.gif';

  $scope.hand = [
    'img/_CRYINGtumblr_lg0znypSUC1qazkdco1_500.gif',  
    'img/-Team Fortress 2-1585-thumbnail.jpg',
    'img/-vyrn-40611301-prepravna-taska-38-cm-latka-molitan-16-35-eur-45-cm-19-90-eur.jpg',
    'img/(291008093129)18450138.jpg',
    'img/0.jpg'
  ];

  $scope.setPhase = function(phase) {
    $scope.currentPhase = phase;
  };

  $scope.submit = function(card) {
    $scope.submissions = [
      "img/01_genesis_p_orridge.jpg",
      "img/0aD41.jpg",
      "img/1-WAKKO.jpg",
      "img/1.2.jpg",
      card
    ];
    $scope.setPhase('judge');
  };

  $scope.declareWinner = function(card) {
    $scope.winner = card;
    $scope.setPhase('win');
  };
};

pomme.controller = ('PommeCtrl', PommeCtrl);
