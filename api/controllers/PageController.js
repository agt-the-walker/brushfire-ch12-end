/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  home: function(req, res) {

    if (!req.session.userId) {
      return res.view('homepage', {
        me: null
      });
    }

    User.findOne(req.session.userId, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage', {
          me: null
        });
      }

      return res.view('homepage', {
        me: {
          username: user.username,
          gravatarURL: user.gravatarURL,
          admin: user.admin
        },
        showAddTutorialButton: true
      });
    });
  },

  logout: function(req, res) {

    if (!req.session.userId) {
      return res.redirect('/');
    }

    User.findOne(req.session.userId, function(err, user) {
      if (err) {
        console.log('error: ', err);
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage');
      }

      return res.view('signout', {
        me: {
          username: user.username,
          gravatarURL: user.gravatarURL,
          admin: user.admin
        }
      });
    });
  },

  editProfile: function(req, res) {

    User.findOne(req.session.userId, function(err, user) {
      if (err) {
        console.log('error: ', err);
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage');
      }

      return res.view('edit-profile', {
        me: {
          email: user.email,
          username: user.username,
          gravatarURL: user.gravatarURL,
          admin: user.admin
        }
      });
    });
  },

  profile: function(req, res) {
    User.findOne({
      username: req.param('username')
    })
    .populate("followers")
    .populate("following")
    .exec(function (err, foundUser){
      if (err) return res.negotiate(err);
      if (!foundUser) return res.notFound();

      Tutorial.find({where: {
        owner: foundUser.id
      }, sort: 'title ASC'})
      .populate('ratings')
      .populate('videos')
      .exec(function (err, foundTutorials){
        if (err) return res.negotiate(err);
        if (!foundTutorials) return res.notFound();

        _.each(foundTutorials, function(tutorial){

          // sync owner
          tutorial.owner = foundUser.username;

          // Format the createdAt attributes and assign them to the tutorial
          tutorial.created = DatetimeService.getTimeAgo({date: tutorial.createdAt});

          // Format Videos
          var totalSeconds = 0;
          _.each(tutorial.videos, function(video){

            // Total the number of seconds for all videos for tutorial total time
            totalSeconds = totalSeconds + video.lengthInSeconds;

            tutorial.totalTime = DatetimeService.getHoursMinutesSeconds({totalSeconds: totalSeconds}).hoursMinutesSeconds;
          });

          // Format average ratings
          var totalRating = 0;
          _.each(tutorial.ratings, function(rating){
            totalRating = totalRating + rating.stars;
          });

          var averageRating = 0;
          if (tutorial.ratings.length < 1) {
            averageRating = 0;
          } else {
            averageRating = totalRating / tutorial.ratings.length;
          }

          tutorial.averageRating = averageRating;
        });

        // The logged out case
        if (!req.session.userId) {

          return res.view('profile', {
            // This is for the navigation bar
            me: null,

            // This is for profile body
            username: foundUser.username,
            gravatarURL: foundUser.gravatarURL,
            frontEnd: {
              numOfTutorials: foundTutorials.length,
              numOfFollowers: foundUser.followers.length,
              numOfFollowing: foundUser.following.length
            },
            // This is for the list of tutorials
            tutorials: foundTutorials
          });
        }

        // Otherwise the user-agent IS logged in.
        // Look up the logged-in user from the database.
        User.findOne({
          id: req.session.userId
        })
        .exec(function (err, loggedInUser){
          if (err) {
            return res.negotiate(err);
          }

          if (!loggedInUser) {
            return res.serverError('User record from logged in user is missing?');
          }

          // Is the logged in user is currently following the owner of this tutorial?
          var cachedFollower = _.find(foundUser.followers, function(follower){
            return follower.id === loggedInUser.id;
          });

          var followedByLoggedInUser = false;
          if (cachedFollower) {
            followedByLoggedInUser = true;
          }

          // We'll provide `me` as a local to the profile page view.
          // (this is so we can render the logged-in navbar state, etc.)
          var me = {
            username: loggedInUser.username,
            email: loggedInUser.email,
            gravatarURL: loggedInUser.gravatarURL,
            admin: loggedInUser.admin
          };

          // We'll provide the `isMe` flag to the profile page view
          // if the logged-in user is the same as the user whose profile we looked up earlier.
          if (req.session.userId === foundUser.id) {
            me.isMe = true;
          } else {
            me.isMe = false;
          }

          // Return me property for the nav and the remaining properties for the profile page.
          return res.view('profile', {
            me: me,
            showAddTutorialButton: true,
            username: foundUser.username,
            gravatarURL: foundUser.gravatarURL,
            frontEnd: {
              numOfTutorials: foundTutorials.length,
              numOfFollowers: foundUser.followers.length,
              numOfFollowing: foundUser.following.length,
              followedByLoggedInUser: followedByLoggedInUser
            },
            tutorials: foundTutorials
          });
        }); //</ User.findOne({id: req.session.userId})
      });
    });
  },

  profileFollower: function(req, res) {

    User.findOne({
      username: req.param('username')
    })
    .populate("followers")
    .populate("following")
    .populate("tutorials")
    .exec(function (err, foundUser){
      if (err) return res.negotiate(err);
      if (!foundUser) return res.notFound();

      // The logged out case
      if (!req.session.userId) {

        return res.view('profile-followers', {
          // This is for the navigation bar
          me: null,

          // This is for profile body
          username: foundUser.username,
          gravatarURL: foundUser.gravatarURL,
          frontEnd: {
            numOfTutorials: foundUser.tutorials.length,
            numOfFollowers: foundUser.followers.length,
            numOfFollowing: foundUser.following.length,
            followers: foundUser.followers
          },
          // This is for the list of followers
          followers: foundUser.followers
        });
      }

      // Otherwise the user-agent IS logged in.

      // Look up the logged-in user from the database.
      User.findOne({
        id: req.session.userId
      })
      .populate('following')
      .exec(function (err, loggedInUser){
        if (err) {
          return res.negotiate(err);
        }

        if (!loggedInUser) {
          return res.serverError('User record from logged in user is missing?');
        }

        // Is the logged in user currently following the owner of this tutorial?
        var cachedFollower = _.find(foundUser.followers, function(follower){
          return follower.id === loggedInUser.id;
        });

        // Set the display toggle (followedByLoggedInUser) based upon whether
        // the currently logged in user is following the owner of the tutorial.
        var followedByLoggedInUser = false;
        if (cachedFollower) {
          followedByLoggedInUser = true;
        }

        // We'll provide `me` as a local to the profile page view.
        // (this is so we can render the logged-in navbar state, etc.)
        var me = {
          username: loggedInUser.username,
          email: loggedInUser.email,
          gravatarURL: loggedInUser.gravatarURL,
          admin: loggedInUser.admin
        };

        // We'll provide the `isMe` flag to the profile page view
        // if the logged-in user is the same as the user whose profile we looked up earlier.
        if (req.session.userId === foundUser.id) {
          me.isMe = true;
        } else {
          me.isMe = false;
        }

        // Return me property for the nav and the remaining properties for the profile page.
        return res.view('profile-followers', {
          me: me,
          showAddTutorialButton: true,
          username: foundUser.username,
          gravatarURL: foundUser.gravatarURL,
          frontEnd: {
            numOfTutorials: foundUser.tutorials.length,
            numOfFollowers: foundUser.followers.length,
            numOfFollowing: foundUser.following.length,
            followedByLoggedInUser: followedByLoggedInUser,
            followers: foundUser.followers
          },
          followers: foundUser.followers
        });
      }); //</ User.findOne({id: req.session.userId})
    });
  },

  profileFollowing: function(req, res) {

    User.findOne({
      username: req.param('username')
    })
    .populate("followers")
    .populate("following")
    .populate("tutorials")
    .exec(function (err, foundUser){
      if (err) return res.negotiate(err);
      if (!foundUser) return res.notFound();

      // The logged out case
      if (!req.session.userId) {

        return res.view('profile-following', {
          // This is for the navigation bar
          me: null,

          // This is for profile body
          username: foundUser.username,
          gravatarURL: foundUser.gravatarURL,
          frontEnd: {
            numOfTutorials: foundUser.tutorials.length,
            numOfFollowers: foundUser.followers.length,
            numOfFollowing: foundUser.following.length,
            following: foundUser.following
          },
          // This is for the list of following
          following: foundUser.following
        });
      }

      // Otherwise the user-agent IS logged in.

      // Look up the logged-in user from the database.
      User.findOne({
        id: req.session.userId
      })
      .populate('following')
      .exec(function (err, loggedInUser){
        if (err) {
          return res.negotiate(err);
        }

        if (!loggedInUser) {
          return res.serverError('User record from logged in user is missing?');
        }

        // Is the logged in user currently following the owner of this tutorial?
        var cachedFollower = _.find(foundUser.followers, function(follower){
          return follower.id === loggedInUser.id;
        });

        // Set the display toggle (followedByLoggedInUser) based upon whether
        // the currently logged in user is following the owner of the tutorial.
        var followedByLoggedInUser = false;
        if (cachedFollower) {
          followedByLoggedInUser = true;
        }

        // We'll provide `me` as a local to the profile page view.
        // (this is so we can render the logged-in navbar state, etc.)
        var me = {
          username: loggedInUser.username,
          email: loggedInUser.email,
          gravatarURL: loggedInUser.gravatarURL,
          admin: loggedInUser.admin
        };

        // We'll provide the `isMe` flag to the profile page view
        // if the logged-in user is the same as the user whose profile we looked up earlier.
        if (req.session.userId === foundUser.id) {
          me.isMe = true;
        } else {
          me.isMe = false;
        }

        // Return me property for the nav and the remaining properties for the profile page.
        return res.view('profile-following', {
          me: me,
          showAddTutorialButton: true,
          username: foundUser.username,
          gravatarURL: foundUser.gravatarURL,
          frontEnd: {
            numOfTutorials: foundUser.tutorials.length,
            numOfFollowers: foundUser.followers.length,
            numOfFollowing: foundUser.following.length,
            followedByLoggedInUser: followedByLoggedInUser,
            following: foundUser.following
          },
          following: foundUser.following
        });
      }); //</ User.findOne({id: req.session.userId})
    });
  },

  signin: function(req, res) {

    return res.view('signin', {
      me: null
    });
  },

  signup: function(req, res) {

    return res.view('signup', {
      me: null
    });
  },

  restoreProfile: function(req, res) {

    return res.view('restore-profile', {
      me: null
    });
  },

  administration: function(req, res) {

    User.findOne(req.session.userId, function(err, user) {

      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage');
      }

      if (!user.admin) {
        return res.redirect('/');
      } else {
        return res.view('administration', {
          me: {
            username: user.username,
            gravatarURL: user.gravatarURL,
            admin: user.admin
          },
          showAddTutorialButton: true
        });
      }
    });
  },

  // #1
  passwordRecoveryEmail: function(req, res) {

    return res.view('./password-recovery/password-recovery-email', {
      me: null
    });
  },

  // #2
  passwordRecoveryEmailSent: function(req, res) {

    return res.view('./password-recovery/password-recovery-email-sent', {
      me: null
    });
  },

  // #3
  passwordReset: function(req, res) {

    // Get the passwordRecoveryToken and render the view
    res.view('./password-recovery/password-reset', {
      me: null,
      passwordRecoveryToken: req.param('passwordRecoveryToken')
    });

  },

  showBrowsePage: function(req, res) {

    // If not logged in set `me` property to `null` and pass tutorials to the view
    if (!req.session.userId) {
      return res.view('browse-tutorials-list', {
        me: null
      });
    }

    User.findOne(req.session.userId, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage', {
          me: null
        });
      }

      return res.view('browse-tutorials-list', {
        me: {
          email: user.email,
          gravatarURL: user.gravatarURL,
          username: user.username,
          admin: user.admin
        },
        showAddTutorialButton: true
      });
    });
  },

  tutorialDetail: function(req, res) {

    Tutorial.findOne({
      id: req.param('id')
    })
    .populate('owner')
    .populate('videos')
    .populate('ratings')
    .exec(function(err, foundTutorial){
      if (err) return res.negotiate(err);
      if (!foundTutorial) return res.notFound();

      Rating.find({
        byUser: req.session.userId
      }).exec(function(err, foundRating){
        if (err) return res.negotiate(err);

        if (foundRating.length === 0) {
          foundTutorial.myRating = null;
        } else {
          _.each(foundRating, function(rating){
            if (foundTutorial.id === rating.byTutorial) {
              foundTutorial.myRating = rating.stars;
              return;
            }
          });
        }

        if (foundTutorial.ratings.length === 0) {
          foundTutorial.averageRating = null;
        } else {
          foundTutorial.averageRating =
            MathService.calculateAverage({ratings: foundTutorial.ratings});
        }
      });

      foundTutorial.videos = _.sortBy(foundTutorial.videos,
                                      function getRank (video) {
        return _.indexOf(foundTutorial.videoOrder,video.id);
      });

      var totalSeconds = 0;
      _.each(foundTutorial.videos, function(video){

        totalSeconds = totalSeconds + video.lengthInSeconds;

        video.totalTime = DatetimeService.getHoursMinutesSeconds({totalSeconds:
          video.lengthInSeconds}).hoursMinutesSeconds;

        foundTutorial.totalTime =
          DatetimeService.getHoursMinutesSeconds({totalSeconds:
            totalSeconds}).hoursMinutesSeconds;
      });

      foundTutorial.owner = foundTutorial.owner.username;

      foundTutorial.created = DatetimeService.getTimeAgo({date: foundTutorial.createdAt});

      foundTutorial.updated = DatetimeService.getTimeAgo({date: foundTutorial.updatedAt});

      // If not logged in set `me` property to `null` and pass the tutorial to the view
      if (!req.session.userId) {
        return res.view('tutorials-detail', {
          me: null,
          stars: foundTutorial.stars,
          tutorial: foundTutorial
        });
      }

      User.findOne(req.session.userId)
      .exec(function(err, user) {
        if (err) return res.negotiate(err);

        if (!user) {
          sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
          return res.view('tutorials-detail', {
            me: null
          });
        }

        // We'll provide `me` as a local to the profile page view.
        // (this is so we can render the logged-in navbar state, etc.)
        var me = {
          gravatarURL: user.gravatarURL,
          username: user.username,
          admin: user.admin
        };

        if (user.username === foundTutorial.owner) {
          me.isMe = true;

          return res.view('tutorials-detail', {
            me: me,
            showAddTutorialButton: true,
            stars: foundTutorial.stars,
            tutorial: foundTutorial
          });

        } else {
          return res.view('tutorials-detail', {
            me: {
              gravatarURL: user.gravatarURL,
              username: user.username,
              admin: user.admin
            },
            showAddTutorialButton: true,
            stars: foundTutorial.stars,
            tutorial: foundTutorial
          });
        }
      });
    });
  },

  newTutorial: function(req, res) {

    User.findOne(req.session.userId, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.redirect('tutorials');
      }

      return res.view('tutorials-detail-new', {
        me: {
          gravatarURL: user.gravatarURL,
          username: user.username,
          admin: user.admin
        }
      });
    });
  },

  editTutorial: function(req, res) {

    Tutorial.findOne({
      id: +req.param('id')
    })
    .populate('owner')
    .exec(function (err, foundTutorial){
      if (err) return res.negotiate(err);
      if (!foundTutorial) return res.notFound();

      User.findOne({
        id: +req.session.userId
      }).exec(function (err, foundUser) {
        if (err) {
          return res.negotiate(err);
        }

        if (!foundUser) {
          sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
          return res.redirect('/tutorials');
        }

        if (foundUser.username !== foundTutorial.owner.username) {
          return res.redirect('/tutorials/'+foundTutorial.id);
        }

        return res.view('tutorials-detail-edit', {
          me: {
            gravatarURL: foundUser.gravatarURL,
            username: foundUser.username,
            admin: foundUser.admin
          },
          tutorial: {
            id: foundTutorial.id,
            title: foundTutorial.title,
            description: foundTutorial.description,
          }
        });
      });
    });
  },

  newVideo: function(req, res) {

    Tutorial.findOne({
      id: +req.param('id')
    })
    .populate('owner')
    .populate('ratings')
    .populate('videos')
    .exec(function (err, foundTutorial){
      if (err) return res.negotiate(err);
      if (!foundTutorial) return res.notFound();

      User.findOne(req.session.userId, function(err, user) {
        if (err) {
          return res.negotiate(err);
        }

        if (!user) {
          sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
          return res.redirect('/');
        }

        if (user.username !== foundTutorial.owner.username) {
          return res.redirect('/tutorials/'+foundTutorial.id);
        }

        foundTutorial.created = DatetimeService.getTimeAgo({date: foundTutorial.createdAt});
        if (foundTutorial.ratings.length === 0) {
          foundTutorial.averageRating = null;
        } else {
          foundTutorial.stars = MathService.calculateAverage({ratings:
            foundTutorial.ratings});
        }

        var totalSeconds = 0;
        _.each(foundTutorial.videos, function(video){

          totalSeconds = totalSeconds + video.lengthInSeconds;

          foundTutorial.totalTime =
            DatetimeService.getHoursMinutesSeconds({totalSeconds:
              totalSeconds}).hoursMinutesSeconds;
        });

        return res.view('tutorials-detail-video-new', {
          me: {
            username: user.username,
            gravatarURL: user.gravatarURL,
            admin: user.admin
          },
          tutorial: {
            id: foundTutorial.id,
            title: foundTutorial.title,
            description: foundTutorial.description,
            owner: foundTutorial.owner.username,
            created: foundTutorial.created,
            totalTime: foundTutorial.totalTime,
            stars: foundTutorial.stars
          }
        });
      });
    });
  },

  editVideo: function(req, res) {
    Tutorial.findOne({
      id: +req.param('tutorialId')
    })
    .populate('videos')
    .populate('owner')
    .populate('ratings')
    .exec(function(err, foundTutorial){
      if (err) return res.negotiate(err);
      if (!foundTutorial) return res.notFound();

      User.findOne({
        id: req.session.userId
      }).exec(function (err, foundUser) {
        if (err) {
          return res.negotiate(err);
        }

        if (!foundUser) {
          sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
          return res.redirect('/');
        }

        if (foundUser.username !== foundTutorial.owner.username) {

          return res.redirect('/tutorials/'+foundTutorial.id);

        }

        // Transform the `created` attribute into time ago format
        foundTutorial.created = DatetimeService.getTimeAgo({date: foundTutorial.createdAt});

        /**********************************************************************************
            Calculate the averge rating
        **********************************************************************************/

        // Perform Average Ratings calculation if there are ratings
        if (foundTutorial.ratings.length === 0) {
          foundTutorial.averageRating = null;
        } else {

          var sumTutorialRatings = 0;

          // Total the number of ratings for the Tutorial
          _.each(foundTutorial.ratings, function(rating){

            sumTutorialRatings = sumTutorialRatings + rating.stars;
          });

          // Assign the average to the tutorial
          foundTutorial.averageRating = sumTutorialRatings / foundTutorial.ratings.length;
        }

        /************************************
          Tutorial & Video Length Formatting
        *************************************/

        var totalSeconds = 0;
        _.each(foundTutorial.videos, function(video){

          totalSeconds = totalSeconds + video.lengthInSeconds;
          foundTutorial.totalTime = DatetimeService.getHoursMinutesSeconds({totalSeconds: totalSeconds}).hoursMinutesSeconds;
        });

        var videoToUpdate = _.find(foundTutorial.videos, function(video){
          return video.id === +req.param('id');
        });

        return res.view('tutorials-detail-video-edit', {
          me: {
            username: foundUser.username,
            gravatarURL: foundUser.gravatarURL,
            admin: foundUser.admin
          },
          tutorial: {
            id: foundTutorial.id,
            title: foundTutorial.title,
            description: foundTutorial.description,
            owner: foundTutorial.owner.username,
            created: foundTutorial.created,
            totalTime: foundTutorial.totalTime,
            averageRating: foundTutorial.averageRating,
            video: {
              id: videoToUpdate.id,
              title: videoToUpdate.title,
              src: videoToUpdate.src,
              hours: DatetimeService.getHoursMinutesSeconds({totalSeconds: videoToUpdate.lengthInSeconds}).hours,
              minutes: DatetimeService.getHoursMinutesSeconds({totalSeconds: videoToUpdate.lengthInSeconds}).minutes,
              seconds: DatetimeService.getHoursMinutesSeconds({totalSeconds: videoToUpdate.lengthInSeconds}).seconds
            }
          }
        });
      });
    });
  },

  showVideo: function(req, res) {

    FAKE_CHAT = [{
      username: 'sailsinaction',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare.',
      created: '2 minutes ago',
      gravatarURL: 'http://www.gravatar.com/avatar/ef3eac6c71fdf24b13db12d8ff8d1264'
    }, {
      username: 'nikolatesla',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare.',
      created: '2 minutes ago',
      gravatarURL: 'http://www.gravatar.com/avatar/c06112bbecd8a290a00441bf181a24d3?'
    }, {
      username: 'sailsinaction',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare.',
      created: '2 minutes ago',
      gravatarURL: 'http://www.gravatar.com/avatar/ef3eac6c71fdf24b13db12d8ff8d1264'
    }, {
      username: 'nikolatesla',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare.',
      created: '2 minutes ago',
      gravatarURL: 'http://www.gravatar.com/avatar/c06112bbecd8a290a00441bf181a24d3?'
    }, {
      username: 'sailsinaction',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare.',
      created: '2 minutes ago',
      gravatarURL: 'http://www.gravatar.com/avatar/ef3eac6c71fdf24b13db12d8ff8d1264'
    }, {
      username: 'nikolatesla',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare.',
      created: '2 minutes ago',
      gravatarURL: 'http://www.gravatar.com/avatar/c06112bbecd8a290a00441bf181a24d3?'
    }, {
      username: 'sailsinaction',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare.',
      created: '2 minutes ago',
      gravatarURL: 'http://www.gravatar.com/avatar/ef3eac6c71fdf24b13db12d8ff8d1264'
    }, {
      username: 'nikolatesla',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare.',
      created: '2 minutes ago',
      gravatarURL: 'http://www.gravatar.com/avatar/c06112bbecd8a290a00441bf181a24d3?'
    }, {
      username: 'sailsinaction',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare.',
      created: '2 minutes ago',
      gravatarURL: 'http://www.gravatar.com/avatar/ef3eac6c71fdf24b13db12d8ff8d1264'
    }];

    Video.findOne({
      id: +req.param('id')
    }).exec(function (err, foundVideo){

      // If not logged in
      if (!req.session.userId) {
        return res.view('show-video', {
          me: null,
          video: foundVideo,
          tutorialId: req.param('tutorialId'),
        });
      }

      // If logged in...
      User.findOne({
        id: +req.session.userId
      }).exec(function (err, foundUser) {
        if (err) {
          return res.negotiate(err);
        }

        if (!foundUser) {
          sails.log.verbose('Session refers to a user who no longer exists');
        }

        return res.view('show-video', {
          me: {
            username: foundUser.username,
            gravatarURL: foundUser.gravatarURL,
            admin: foundUser.admin
          },
          video: foundVideo,
          tutorialId: req.param('tutorialId'),
        });
      });
    });
  }
};
