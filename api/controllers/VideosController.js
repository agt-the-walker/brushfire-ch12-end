/**
 * VideosController
 *
 * @description :: Server-side logic for managing videos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  showVideo: function(req, res) {

    // Simulating a found video
    var video = {
      id: 34,
      title: 'Tation libris prodesset nam id. Qui no epicuri oportere. Tritani delicata vix eu.',
      minutes: 10,
      seconds: 22,
      src: 'https://www.youtube.com/embed/KH5E2TL-_e8'
    };

    if (!req.session.userId) {
      return res.view('show-video', {
        me: null,
        video: video,
        tutorialId: req.param('tutorialId')
      });
    }

    User.findOne(req.session.userId, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('show-video', {
          me: null,
          video: video,
        tutorialId: req.param('tutorialId')
        });
      }

      return res.view('show-video', {
        me: {
          email: user.email,
          username: user.username,
          gravatarURL: user.gravatarURL,
          admin: user.admin
        },
        video: video,
        tutorialId: req.param('tutorialId')
      });
    });
  }
};
