const express = require('express');
const router = express.Router();
const {fetchGoogleFitGetUrl, getRefreshToken} = require(
    "../src/fetchers/googlefit-fetcher"
);

router.get('/', function(req, res, next) {
  res.redirect('https://github.com/OpenCommit-H/github-readme-developer-health');
});

router.get('/home', async (req, res) => {
    const url = await fetchGoogleFitGetUrl();
    if (req.session.refresh_token) {
        const refresh_token = req.session.refresh_token;
        req
            .session
            .destroy(function (err) {})
        res.render('register', {
            data: url,
            token: refresh_token
        });
    } else {
        res.render('register', {
            data: url,
            token: ""
        });
    }
});

router.get('/home/googleFit', async (req, res) => {
    const code = req.query.code;
    const refresh_token = await getRefreshToken(code)
    req.session.refresh_token = refresh_token;
    res.cookie('sessionId', req.session.id)

    req
        .session
        .save(function (err) {
            res.redirect('/home');
        });
});

module.exports = router;
