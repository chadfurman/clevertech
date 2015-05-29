angular.module('ctApp', [])
    .directive('ctComments', function () {
        return {
            restrict: 'EA', //Default in 1.3+
            scope: {
                datasource: '=',
                add: '&'
            },
            controller: 'ctCommentsController',
            templateUrl: '/js/components/ct-comments/ctComments.html',
        };
    })
    .controller('ctCommentsController', ['$scope', '$http', function ($scope, $http) {
        function init() {
            $http({
                method: 'GET',
                url: 'http://localhost:3000/comments',
                headers: 'Access: application/json'
            }).success(function(response) {
                $scope.comments = response.data;
            });
        }

        init();

        $scope.addComment = function () {
            //Add new customer to directive scope
            $scope.comments.push({
                message: $scope.newMessage
            });

            $http({
                method: 'POST',
                url: 'http://localhost:3000/comments',
                data: {
                    message: $scope.newMessage
                },
                headers: 'Access: application/json'
            }).error(function(response) {
                $scope.comments.pop();
            });
        };
    }]);
