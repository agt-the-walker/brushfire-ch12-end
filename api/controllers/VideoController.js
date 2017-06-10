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
    return res.ok();
  },

  chat: function(req, res) {
    return res.json({
      message: req.param('message')
    });
  }
};

