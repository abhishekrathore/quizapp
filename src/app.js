/**
 * Created by abhishekrathore on 8/6/16.
 */
angular.module("quiz",["ngRoute","LocalForageModule"])

.config(function($routeProvider){
        $routeProvider.when("/quiz",{
            "templateUrl":"quiz.html",
            "resolve":{
                paper:function(questions){
                    return questions;
                }
            },
            "controller":"quizCtrl",
            "controllerAs":"quiz"

        }).when("/start",{
            "templateUrl":"start.html"
        }).when("/result/:total/:attempted/:correct",{
            "templateUrl":"results.html",
            "controller":"resultCtrl",
            "controllerAs":"result"
        }).when("/nopapers",{
        "templateUrl":"nopapers.html"
        })
    }).constant("url","https://gentle-tundra-34614.herokuapp.com")
    .run(function($localForage,$http,url,$location,$q){
        $http.get(url+"/papers").then(function(data){
          var  promises = [];
            var paperIds =[]
            for(i=0;i<data.data.length;i++){
                promises.push($localForage.setItem(data.data[i]._id,data.data[i]));
                paperIds.push(data.data[i]._id);
                console.log("pushing"+data.data[i]._id);
            }
            promises.push($localForage.setItem("paperIds",paperIds));

            return $q.all(promises);
        }).then(function(){
            $location.path("/start");
        })
    })
    .controller("testCtrl",function($http,url,$location,user,$window){
        var devHeight=  $window.innerHeight;

        console.log(devHeight);

        var t = this;
        t.fullHeight ={'height':devHeight+'px'};

        t.name = "abc";
        t.login = function(){
            $http.post(url+"/login",{user:t.user}).then(function(data){
                console.log(data);
                user.info = data.data;
                $location.path("/quiz");

            })
        }
    })
    .controller("quizCtrl",function($scope,paper,$localForage,$http,user,$q,url,$location,$window){

        var devHeight=  $window.innerHeight;
        var devWidth=  $window.innerWidth;

        var headerHeight = document.querySelector('#paperHeader').offsetHeight;

        var quiz = this;
        quiz.url = url;
        quiz.fullHeight ={'height':devHeight-headerHeight+'px'};

        if(!paper){ $location.path("/nopapers")}

        var now = new Date();
        now.setTime(now.getTime()+60*60*1000);
        quiz.date = now;

        quiz.questions = paper.queArray;
        quiz.sections = _.uniq(_.pluck(paper.queArray,"sectionId"));
        quiz.answers ={};
        $localForage.setItem("currentPaper",paper._id);
        $localForage.setItem("currentUser",user.info._id);


        quiz.index =0;
        quiz.section=1;

        quiz.prev = function(){
            if(quiz.index){
                quiz.index=(quiz.index-1)%quiz.questions.length;
            }
        }

        quiz.largeButton = false;
        if(devWidth>1300){
            quiz.largeButton = true;
        }

        $scope.$watch(function () {
            return quiz.index;
        },function(value){
            quiz.section = quiz.questions[value].sectionId;
        });

        quiz.submit = function(){

        var score =calculateScore();
            console.log(score);

           var p1= $localForage.getItem("currentPaper");
           var p2= $localForage.getItem("currentUser");

            $q.all([p1,p2]).then(function(data){

                console.log("both promises",data);
               return $http.get(url+"/user/"+data[1]+"/paper/"+data[0]+"/score/"+score.correct);
            }).then(function(data){
                console.log("result user", data);
                $location.path("/result/"+score.total+"/"+score.attempted+"/"+score.correct);

            })

        }

        quiz.changeSection = function(section){
            quiz.section = section;
            quiz.index = _.findIndex(quiz.questions,function(q){
              return  q.sectionId == section;
            });
        }

       function calculateScore(){
           console.log(quiz);
           var result = {};
           result.correct=0;
           result.attempted=0;
           result.total=0;

           for(var i=0;i<quiz.questions.length;i++){
               result.total++;
               if(parseInt(quiz.answers[i])){
                   result.attempted++;
               }
               if(parseInt(quiz.answers[i])== quiz.questions[i].answerOption){
                   result.correct++;
               }
           }
           return result;
       }


    })
    .controller("resultCtrl",function($routeParams){
        var result = this;
        result.correct = $routeParams.correct;
        result.attempted = $routeParams.attempted;
        result.total = $routeParams.total;

    })
    .factory("questions",function($localForage,$q,user){

          var deferred = $q.defer();
          $localForage.getItem("paperIds").then(function (data) {

            var  filteredPapers =  _.reject(data,function(d){
                  return _.find(user.info.paperId,function(paper){
                      return paper.id==d;
                  });
              });

              console.log(filteredPapers);
              if(filteredPapers.length) {
                  $localForage.getItem(filteredPapers[0]).then(function (d) {

                      deferred.resolve(d);
                  }).catch(function () {
                      deferred.reject();
                  });
              }else{
                  deferred.resolve(0);
              }



          }).catch(function(){
              deferred.reject();
          });

          return deferred.promise;

    }).service("user",function(){
        this.info = {};
    }).directive('countdown', [
        'Util', '$interval', function(Util, $interval) {
            return {
                restrict: 'A',
                link: function(scope, element) {
                    var future;
                    future = new Date(new Date().getTime()+ 60*60*1000);
                    $interval(function() {
                        var diff;
                        diff = Math.floor((future.getTime() - new Date().getTime()) / 1000);
                        return element.text(Util.dhms(diff));
                    }, 1000);
                }
            };
        }
    ]).factory('Util', [
        function() {
            return {
                dhms: function(t) {
                    var days, hours, minutes, seconds;
                    days = Math.floor(t / 86400);
                    t -= days * 86400;
                    hours = Math.floor(t / 3600) % 24;
                    t -= hours * 3600;
                    minutes = Math.floor(t / 60) % 60;
                    t -= minutes * 60;
                    seconds = t % 60;
                    return [ hours + 'h', minutes + 'm', seconds + 's'].join(' ');
                }
            };
        }
    ]);
