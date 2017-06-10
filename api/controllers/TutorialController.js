/**
 * TutorialController
 *
 * @description :: Server-side logic for managing tutorial
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  searchTutorials: function(req, res) {

    var tutorials = [{
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 1,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 4
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 2,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 3
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 3,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 5
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 4,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 1
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 5,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 5
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 6,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 2
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 7,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 4
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 8,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 5
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 9,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 4
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 10,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 4
    }];

    return res.json({
      options: {
        totalTutorials: 10,
        updatedTutorials: tutorials
      }
    });
  },

  browseTutorials: function(req, res) {

    var tutorials = [{
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 1,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 4
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 2,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 3
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 3,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 5
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 4,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 1
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 5,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 5
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 6,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 2
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 7,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 4
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 8,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 5
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 9,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 4
    }, {
      title: 'The best of Douglas Crockford on JavaScript.',
      description: 'Understanding JavaScript the good parts, and more.',
      owner: 'sailsinaction',
      id: 10,
      created: 'a month ago',
      totalTime: '3h 22m 23s',
      stars: 4
    }];

    console.log('skip: ', req.param('skip'));

    return res.json({
      options: {
        totalTutorials: 30,
        updatedTutorials: tutorials
      }
    });
  },

  myRating: function(req, res) {

    return res.json({
      myRating: null
    });
  },

  rateTutorial: function(req, res) {

    User.findOne({
      id: req.session.userId
    })
    .exec(function(err, currentUser){
      if (err) return res.negotiate(err);
      if (!currentUser) return res.notFound();

      Tutorial.findOne({
        id: +req.param('id')
      })
      .populate('owner')
      .exec(function(err, foundTutorial){
        if (err) return res.negotiate(err);
        if (!foundTutorial) return res.notFound();
        if (currentUser.id === foundTutorial.owner.id) {
          return res.forbidden();
        }

        Rating.findOne({
          byUser: currentUser.id,
          byTutorial: foundTutorial.id
        }).exec(function(err, foundRating){
          if (err) return res.negotiate(err);

          if (foundRating) {
            Rating.update({
              id: foundRating.id
            }, {
              stars: req.param('stars')
            }).exec(function(err, updatedRating){
              if (err) return res.negotiate(err);
              if (!updatedRating) return res.notFound();

              Tutorial.findOne({
                id: req.param('id')
              })
              .populate('ratings')
              .exec(function(err, foundTutorialAfterUpdate){
                if (err) return res.negotiate(err);
                if (!foundTutorialAfterUpdate) return res.notFound();

                return res.json({
                  averageRating: MathService.calculateAverage({ratings:
                    foundTutorialAfterUpdate.ratings})
                });
              });
            });
          } else {
            Rating.create({
              stars: req.param('stars'),
              byUser: currentUser.id,
              byTutorial: foundTutorial.id
            }).exec(function(err, createdRating){
              if (err) return res.negotiate(err);
              if (!createdRating) return res.notFound();

              Tutorial.findOne({
                id: req.param('id')
              })
              .populate('ratings')
              .exec(function(err, foundTutorialAfterUpdate){
                if (err) return res.negotiate(err);
                if (!foundTutorialAfterUpdate) return res.notFound();

                return res.json({
                  averageRating: MathService.calculateAverage({ratings:
                    foundTutorialAfterUpdate.ratings})
                });
              });
            });
          }
        });
      });
    });
  },

  createTutorial: function(req, res) {

    /*
     __   __    _ _    _      _   _
     \ \ / /_ _| (_)__| |__ _| |_(_)___ _ _
      \ V / _` | | / _` / _` |  _| / _ \ ' \
       \_/\__,_|_|_\__,_\__,_|\__|_\___/_||_|

    */

    if (!_.isString(req.param('title'))) {
    return res.badRequest();
    }

    if (!_.isString(req.param('description'))) {
      return res.badRequest();
    }

    // Find the user that's adding a tutorial
    User.findOne({
    id: req.session.userId
    }).exec(function(err, foundUser){
      if (err) return res.negotiate;
      if (!foundUser) return res.notFound();

      Tutorial.create({
        title: req.param('title'),
        description: req.param('description'),
        owner: foundUser.id,
        videoOrder: [],
      })
      .exec(function(err, createdTutorial){
        if (err) return res.negotiate(err);

        return res.json({id: createdTutorial.id});
      });
    });
  },

  updateTutorial: function(req, res) {

    // Validate parameters
    if (!_.isString(req.param('title'))) {
      return res.badRequest();
    }

    if (!_.isString(req.param('description'))) {
      return res.badRequest();
    }

    // Update the tutorial coercing the incoming id from a string to an integer using the unary `+`
    Tutorial.update({
      id: +req.param('id')
    }, {
      title: req.param('title'),
      description: req.param('description')
    }).exec(function (err) {
      if (err) return res.negotiate(err);

      return res.ok();
    });
  },

  addVideo: function(req, res) {

    if (!_.isNumber(req.param('hours')) || !_.isNumber(req.param('minutes')) ||
        !_.isNumber(req.param('seconds'))) {
      return res.badRequest();
    }
    if (!_.isString(req.param('src')) || !_.isString(req.param('title'))) {
      return res.badRequest();
    }

    Tutorial.findOne({
      id: +req.param('tutorialId')
    })
    .populate('owner')
    .exec(function(err, foundTutorial){
      if (err) return res.negotiate(err);
      if (!foundTutorial) return res.notFound();

      if (foundTutorial.owner.id !== req.session.userId) {
        return res.forbidden();
      }

      Video.create({
        tutorialAssoc: foundTutorial.id,
        title: req.param('title'),
        src: req.param('src'),
        lengthInSeconds: req.param('hours') * 60 * 60 +
          req.param('minutes') * 60 + req.param('seconds')
      }).exec(function (err, createdVideo) {
        if (err) return res.negotiate(err);

        foundTutorial.videoOrder.push(createdVideo.id);
        foundTutorial.save(function (err){
          if (err) return res.negotiate(err);
        });

        return res.ok();
      });
    });
  },

  updateVideo: function(req, res) {
    if (!_.isString(req.param('title'))) {
      return res.badRequest();
    }

    if (!_.isString(req.param('src'))) {
      return res.badRequest();
    }

    if (!_.isNumber(req.param('hours')) || !_.isNumber(req.param('minutes')) || !_.isNumber(req.param('seconds'))) {
      return res.badRequest();
    }

    // Coerce the hours, minutes, seconds parameter to integers
    var hours = +req.param('hours');
    var minutes = +req.param('minutes');
    var seconds = +req.param('seconds');

    // Calculate the total seconds of the video and store that value as lengthInSeconds
    var convertedToSeconds = hours * 60 * 60 + minutes * 60 + seconds;

    Video.findOne({
      id: +req.param('id')
    })
    .populate('tutorialAssoc')
    .exec(function (err, foundVideo){
      if (err) return res.negotiate (err);
      if (!foundVideo) return res.notFound();

      // Assure that the currently logged in user is the owner of the tutorial
      if (req.session.userId !== foundVideo.tutorialAssoc.owner) {
        return res.forbidden();
      }

      // Update the video
      Video.update({
        id: +req.param('id')
      }, {
        title: req.param('title'),
        src: req.param('src'),
        lengthInSeconds: convertedToSeconds
      }).exec(function (err, updatedUser){
        if (err) return res.negotiate(err);
        if (!updatedUser) return res.notFound();

        return res.ok();
      });
    });
  },

  deleteTutorial: function(req, res) {

    User.findOne({id: req.session.userId}).exec(function(err, foundUser){
      if (err) {
        return res.negotiate(err);
      }

      if (!foundUser) {
        return res.notFound();
      }

      Tutorial.findOne({
        id: +req.param('id')
      })
      .populate('owner')
      .populate('ratings')
      .populate('videos')
      .exec(function(err, foundTutorial){
        if (err) return res.negotiate(err);
        if (!foundTutorial) return res.notFound();

        if (foundUser.id != foundTutorial.owner.id) {
          return res.forbidden();
        }

        Tutorial.destroy({
          id: req.param('id')
        }).exec(function(err){
          if (err) return res.negotiate(err);

          Video.destroy({
            id: _.pluck(foundTutorial.videos, 'id')
          }).exec(function (err){
            if (err) return res.negotiate(err);

            Rating.destroy({
              id: _.pluck(foundTutorial.ratings, 'id')
            }).exec(function (err){
              if (err) return res.negotiate(err);

              return res.json({username: foundUser.username});
            });
          });
        });
      });
    });
  },

  removeVideo: function(req, res) {

      return res.ok();
  }
};

