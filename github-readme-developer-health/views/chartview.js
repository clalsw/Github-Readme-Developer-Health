require("dotenv").config();
const {
    renderError,
    CONSTANTS,
    clampValue,
} = require("../src/common/utils");
const { fetchWakatimeStats } = require("../src/fetchers/wakatime-fetcher");
const renderChartCard = require("../src/cards/chart-card");
const fetchGithubGetWeeklyData = require("../src/fetchers/github-fetcher");
const { fetchGoogleFitGetData, getAccessToken } = require("../src/fetchers/googlefit-fetcher");
const { userinfoStats } = require("../src/fetchers/userinfo-fetcher");

exports.renderChart = async (req, res) => {
    const {
      range,
      api_domain,
      theme,
      username,
      cache_seconds,
      size,
  } = req.query;
  res.setHeader("Content-Type", "image/svg+xml");

  let cacheSeconds = clampValue(
    parseInt(cache_seconds || CONSTANTS.TWO_HOURS, 10),
    CONSTANTS.TWO_HOURS,
    CONSTANTS.ONE_DAY,
  );

  if (!cache_seconds) {
    cacheSeconds = CONSTANTS.FOUR_HOURS;
  }

  res.setHeader("Cache-Control", "no-store");

    // default data
    // if create total fetcher, then fit, commits, sleep will erase
    var data = [
        {
          "date": "Sun",
          "commits": "0",
        },
        {
          "date": "Mon",
          "commits": "0",
        },
        {
          "date": "Tue",
          "commits": "0",
        },
        {
          "date": "Wed",
          "commits": "0",
        },
        {
          "date": "Thu",
          "commits": "0",
        },
        {
          "date": "Fri",
          "commits": "0",
        },
        {
          "date": "Sat",
          "commits": "0",
        },
    ];

    try {
      const userStats = await userinfoStats({ username });

      const { wakaname, api_key, refresh_token } = userStats;

      const wakaStats = await fetchWakatimeStats({ wakaname, api_domain, range, api_key });

        // find day index
        var dayIdx = 0;
        data.forEach((element, idx) => {
            if (element.date == wakaStats[0].date.split(" ")[0]) {
                dayIdx = idx;
            }
        });
        
        // input last 7 days wakatime api data
        wakaStats.forEach((element) => {
            dayIdx %= 7;
            data[dayIdx++].waka = element.total_seconds / 3600;
        });

        // last 7days github api
        const githubStats = await fetchGithubGetWeeklyData(username);
        for (i=0; i<githubStats.day7commits.length; i++){
          data[githubStats.day7commits[i].day].commits ++
        }
        // last 7days goofle fit api
      const access_token = await getAccessToken(refresh_token);
      if (access_token == null) {
        return res.send(renderError("Your google api token is wrong","Please re-enorll your account with right token"));
      }
      const test = await fetchGoogleFitGetData(access_token);
      
      test.active_minutes.forEach((element) => {
        dayIdx %= 7;
        data[dayIdx++].fit = element / 60;
      })

      //??????????????? ??? ????????? ??????????????? ?????? ?????? ???????????????.
      //ex)????????? ????????? ?????? ????????? ????????? ?????? ??? ????????? ???????????? ???????????? ??????
      dayIdx--;
      dayIdx = dayIdx == -1 ? 6 : dayIdx;
      test.sleep.forEach((element) => {
        dayIdx %= 7;
        data[dayIdx++].sleep = element / 60;
      })
        // make data

        res.send(renderChartCard(data, wakaname, theme, size));
    } catch (err) {
        return res.send(renderError(err.message, err.secondaryMessage));
    }
}