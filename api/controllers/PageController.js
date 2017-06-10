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

    var FAKE_DATA = {
      frontEnd: {
        numOfTutorials: 11,
        numOfFollowers: 0,
        numOfFollowing: 0
      },
      tutorials: [{
        id: 1,
        title: 'The best of Douglas Crockford on JavaScript.',
        description: 'Understanding JavasScript the good parts.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        id: 2,
        title: 'Understanding Angular 2.0',
        description: 'Different sides of Angular 2.0',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        id: 3,
        title: 'Biology 101.',
        description: 'The best biology teacher on the planet.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        id: 4,
        title: 'Dog Training.',
        description: 'A great series on getting your dog to stop biting, sit, come, and stay.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        id: 5,
        title: 'How to play famous songs on the Ukulele.',
        description: 'You\'ll learn songs like Love me Tender, Sea of Love, and more.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        id: 6,
        title: 'Character development 101.',
        description: 'Writing better and more interesting characters.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        id: 7,
        title: 'Drawing Cartoons.',
        description: 'Drawing techniques for the beginning cartoonist.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        id: 8,
        title: 'How to make whisky.',
        description: 'Distilling corn into whisky.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        id: 9,
        title: 'How do toilets work.',
        description: 'Everything you never thought you needed to know about how toilets flush.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        id: 10,
        title: 'Making fire.',
        description: 'Techniques for making fire without a match.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        id: 11,
        title: 'Making homemade beef jerky.',
        description: 'Everything you need to know to make some jerky.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }]
    };

    // Look up the user record for the `username` parameter
    User.findOne({
      username: req.param('username')
    }).exec(function(err, foundByUsername) {
      if (err) {
        return res.negotiate(err);
      }

      // If no user exists with the username specified in the URL,
      // show the 404 page.
      if (!foundByUsername) {
        return res.notFound();
      }

      // The logged out case
      if (!req.session.userId) {

        return res.view('profile', {
          // This is for the navigation bar
          me: null,

          // This is for profile body
          username: foundByUsername.username,
          gravatarURL: foundByUsername.gravatarURL,
          frontEnd: {
            numOfTutorials: FAKE_DATA.frontEnd.numOfTutorials,
            numOfFollowers: FAKE_DATA.frontEnd.numOfFollowers,
            numOfFollowing: FAKE_DATA.frontEnd.numOfFollowing
          },
          // This is for the list of tutorials
          tutorials: FAKE_DATA.tutorials
        });
      }

      // Otherwise the user-agent IS logged in.

      // Look up the logged-in user from the database.
      User.findOne({
          id: req.session.userId
        })
        .exec(function(err, foundUser) {
          if (err) {
            return res.negotiate(err);
          }

          if (!foundUser) {
            return res.serverError('User record from logged in user is missing?');
          }

          // We'll provide `me` as a local to the profile page view.
          // (this is so we can render the logged-in navbar state, etc.)
          var me = {
            username: foundUser.username,
            email: foundUser.email,
            gravatarURL: foundUser.gravatarURL,
            admin: foundUser.admin
          };

          // We'll provide the `isMe` flag to the profile page view
          // if the logged-in user is the same as the user whose profile we looked up earlier.
          if (req.session.userId === foundByUsername.id) {
            me.isMe = true;
          } else {
            me.isMe = false;
          }

          // Return me property for the nav and the remaining properties for the profile page.
          return res.view('profile', {
            me: me,
            showAddTutorialButton: true,
            username: foundByUsername.username,
            gravatarURL: foundByUsername.gravatarURL,
            frontEnd: {
              numOfTutorials: FAKE_DATA.frontEnd.numOfTutorials,
              numOfFollowers: FAKE_DATA.frontEnd.numOfFollowers,
              numOfFollowing: FAKE_DATA.frontEnd.numOfFollowing,
              followedByLoggedInUser: true
            },
            tutorials: FAKE_DATA.tutorials
          });
        }); //</ User.findOne({id: req.session.userId})

    });
  },

  profileFollower: function(req, res) {

    var FAKE_DATA = {
      frontEnd: {
        numOfTutorials: 11,
        numOfFollowers: 1,
        numOfFollowing: 1
      },
      followers: [{
         username: 'nikolatesla',
        gravatarURL: 'http://www.gravatar.com/avatar/c06112bbecd8a290a00441bf181a24d3?'
      }],
      tutorials: [{
        title: 'The best of Douglas Crockford on JavaScript.',
        description: 'Understanding JavasScript the good parts.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Understanding Angular 2.0',
        description: 'Different sides of Angular 2.0',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Biology 101.',
        description: 'The best biology teacher on the planet.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Dog Training.',
        description: 'A great series on getting your dog to stop biting, sit, come, and stay.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'How to play famous songs on the Ukulele.',
        description: 'You\'ll learn songs like Love me Tender, Sea of Love, and more.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Character development 101.',
        description: 'Writing better and more interesting characters.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Drawing Cartoons.',
        description: 'Drawing techniques for the beginning cartoonist.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'How to make whisky.',
        description: 'Distilling corn into whisky.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'How do toilets work.',
        description: 'Everything you never thought you needed to know about how toilets flush.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Making fire.',
        description: 'Techniques for making fire without a match.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Making homemade beef jerky.',
        description: 'Everything you need to know to make some jerky.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }]
    };

    User.findOne({
      username: req.param('username')
    })
    .exec(function(err, foundUser) {
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
            numOfTutorials: FAKE_DATA.frontEnd.numOfTutorials,
            numOfFollowers: FAKE_DATA.frontEnd.numOfFollowers,
            numOfFollowing: FAKE_DATA.frontEnd.numOfFollowing,
            followers: FAKE_DATA.followers
          },
          // This is for the list of followers
          followers: FAKE_DATA.followers
        });
      }

      // Otherwise the user-agent IS logged in.

      // Look up the logged-in user from the database.
      User.findOne({
        id: req.session.userId
      })
      .exec(function(err, loggedInUser) {
        if (err) {
          return res.negotiate(err);
        }

        if (!loggedInUser) {
          return res.serverError('User record from logged in user is missing?');
        }

        // Is the logged in user currently following the owner of this tutorial?
        var cachedFollower = _.find(FAKE_DATA.followers, function(follower) {
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
            numOfTutorials: FAKE_DATA.frontEnd.numOfTutorials,
            numOfFollowers: FAKE_DATA.frontEnd.numOfFollowers,
            numOfFollowing: FAKE_DATA.frontEnd.numOfFollowing,
            followedByLoggedInUser: false,
            followers: FAKE_DATA.followers
          },
          followers: FAKE_DATA.followers
        });
      }); //</ User.findOne({id: req.session.userId})
    });
  },

  profileFollowing: function(req, res) {

    var FAKE_DATA = {
      frontEnd: {
        numOfTutorials: 11,
        numOfFollowers: 1,
        numOfFollowing: 1
      },
      following: [{
         username: 'nikolatesla',
        gravatarURL: 'http://www.gravatar.com/avatar/c06112bbecd8a290a00441bf181a24d3?'
      }],
      tutorials: [{
        title: 'The best of Douglas Crockford on JavaScript.',
        description: 'Understanding JavasScript the good parts.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Understanding Angular 2.0',
        description: 'Different sides of Angular 2.0',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Biology 101.',
        description: 'The best biology teacher on the planet.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Dog Training.',
        description: 'A great series on getting your dog to stop biting, sit, come, and stay.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'How to play famous songs on the Ukulele.',
        description: 'You\'ll learn songs like Love me Tender, Sea of Love, and more.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Character development 101.',
        description: 'Writing better and more interesting characters.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Drawing Cartoons.',
        description: 'Drawing techniques for the beginning cartoonist.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'How to make whisky.',
        description: 'Distilling corn into whisky.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'How do toilets work.',
        description: 'Everything you never thought you needed to know about how toilets flush.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Making fire.',
        description: 'Techniques for making fire without a match.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }, {
        title: 'Making homemade beef jerky.',
        description: 'Everything you need to know to make some jerky.',
        owner: 'sailsinaction',
        averageRating: 3,
        created: 'a few seconds ago',
        totalTime: '1h 2m 3s'
      }]
    };


    User.findOne({
      username: req.param('username')
    })
    .exec(function(err, foundUser) {
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
            numOfTutorials: FAKE_DATA.frontEnd.numOfTutorials,
            numOfFollowers: FAKE_DATA.frontEnd.numOfFollowers,
            numOfFollowing: FAKE_DATA.frontEnd.numOfFollowing,
            following: FAKE_DATA.following
          },
          // This is for the list of following
          following: FAKE_DATA.following
        });
      }

      // Otherwise the user-agent IS logged in.

      // Look up the logged-in user from the database.
      User.findOne({
        id: req.session.userId
      })
      .exec(function(err, loggedInUser) {
        if (err) {
          return res.negotiate(err);
        }

        if (!loggedInUser) {
          return res.serverError('User record from logged in user is missing?');
        }

        // Is the logged in user currently following the owner of this tutorial?
        var cachedFollower = _.find(FAKE_DATA.following, function(follower) {
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
            numOfTutorials: FAKE_DATA.frontEnd.numOfTutorials,
            numOfFollowers: FAKE_DATA.frontEnd.numOfFollowers,
            numOfFollowing: FAKE_DATA.frontEnd.numOfFollowing,
            followedByLoggedInUser: false,
            following: FAKE_DATA.following
          },
          following: FAKE_DATA.following
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
