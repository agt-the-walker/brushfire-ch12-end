/**
 * VideoController
 *
 * @description :: Server-side logic for managing videos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {


  reorderVideoUp: function(req, res) {

    Video.findOne({
      id: +req.param('id')
    })
    .populate('tutorialAssoc')
    .exec(function(err, video){
      if (err) return res.negotiate(err);
      if (!foundVideo) return res.notFound();

      if (req.session.userId !== foundVideo.tutorialAssoc.owner) {
        return res.forbidden();
      }

      var indexOfVideo = _.indexOf(video.tutorialAssoc.videoOrder,
        +req.param('id'));

      if (indexOfVideo === 0) {
        return res.badRequest('This video is already at the top of the list.');
      }

      video.tutorialAssoc.videoOrder.splice(indexOfVideo, 1);
      video.tutorialAssoc.videoOrder.splice(indexOfVideo-1, 0,
                                            +req.param('id'));

      video.tutorialAssoc.save(function (err) {
        if (err) return res.negotiate(err);
        return res.ok();
      });
    });
  },

  reorderVideoDown: function(req, res) {

    Video.findOne({
      id: +req.param('id')
    })
    .populate('tutorialAssoc')
    .exec(function(err, video){
      if (err) return res.negotiate(err);
      if (!foundVideo) return res.notFound();

      if (req.session.userId !== foundVideo.tutorialAssoc.owner) {
        return res.forbidden();
      }

      var indexOfVideo = _.indexOf(video.tutorialAssoc.videoOrder,
        +req.param('id'));

      var numberOfTutorials = foundVideo.tutorialAssoc.videoOrder.length;

      if (indexOfVideo === numberOfTutorials-1) {
        return res.badRequest('This video is already at the bottom of the list.');
      }

      video.tutorialAssoc.videoOrder.splice(indexOfVideo, 1);
      video.tutorialAssoc.videoOrder.splice(indexOfVideo+1, 0,
                                            +req.param('id'));

      video.tutorialAssoc.save(function (err) {
        if (err) return res.negotiate(err);
        return res.ok();
      });
    });
  },

  joinChat: function(req, res) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    sails.sockets.join(req, 'video'+req.param('id'));

    Video.subscribe(req, req.param('id'));

    return res.ok();
  },

  chat: function(req, res) {
    Chat.create({
      message: req.param('message'),
      sender: req.session.userId,
      video: +req.param('id')
    }).exec(function (err, createdChat){
      if (err) return res.negotiate(err);

      User.findOne({
        id: req.session.userId
      }).exec(function (err, foundUser){
        if (err) return res.negotiate(err);
        if (!foundUser) return res.notFound();

        sails.sockets.broadcast('video'+req.param('id'), 'chat', {
          message: req.param('message'),
          username: foundUser.username,
          created: 'just now',
          gravatarURL: foundUser.gravatarURL
        });
      });
    });

    return res.ok();
  },

  typing: function(req, res) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    User.findOne({
      id: req.session.userId
    }).exec(function (err, foundUser){
      if (err) return res.negotiate(err);
      if (!foundUser) return res.notFound();

      sails.sockets.broadcast('video'+req.param('id'), 'typing', {
        username: foundUser.username
      }, (req.isSocket ? req : undefined) );

      return res.ok();
    });
  },

  stoppedTyping: function(req, res) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    sails.sockets.broadcast('video'+req.param('id'),
      'stoppedTyping', (req.isSocket ? req : undefined) );

    return res.ok();
  }
};

