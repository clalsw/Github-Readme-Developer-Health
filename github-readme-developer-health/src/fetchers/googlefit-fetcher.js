const axios = require("axios");
const {google} = require("googleapis");
const request = require("request");
const calculateActivity = require("../calculateActivity");
const querystring = require('querystring');

const fetchGoogleFitGetUrl = async () => {

    const oauth2Client = new google
        .auth
        .OAuth2(
            // client id
            process.env.CLIENT_ID,
            // client secret
            process.env.CLIENT_SECRET,
            // link to redirect to  https://domain/home/googleFit
            process.env.REDIRECT_URL
        );

    const scopes=["https://www.googleapis.com/auth/fitness.activity.read profile email openid",
        "https://www.googleapis.com/auth/fitness.location.read", "https://www.googleapis.com/auth/fitness.body.read",
        "https://www.googleapis.com/auth/fitness.nutrition.read", "https://www.googleapis.com/auth/fitness.blood_pressure.read",
        "https://www.googleapis.com/auth/fitness.blood_glucose.read", "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
        "https://www.googleapis.com/auth/fitness.body_temperature.read", "https://www.googleapis.com/auth/fitness.reproductive_health.read",
        "https://www.googleapis.com/auth/fitness.sleep.read"];

    const url = oauth2Client.generateAuthUrl(
        {access_type: "offline", scope: scopes}
    );
    request(url, (err, response, body) => {
        console.log("error : ", err);
        console.log("statusCode: ", response && response.statusCode);
    });

    return url;
};

const getRefreshToken = async code => {
    const oauth2Client = new google
        .auth
        .OAuth2(
            // client id
            process.env.CLIENT_ID,
            // client secret
            process.env.CLIENT_SECRET,
            // link to redirect to  https://domain/home/googleFit
            process.env.REDIRECT_URL
        );

    const tokens = await oauth2Client.getToken(code);
    return tokens.tokens.refresh_token;
};

const getAccessToken = async refreshToken => {
    try {
        const accessTokenObj = await axios.post(
            'https://oauth2.googleapis.com/token',
            querystring.stringify({refresh_token: refreshToken, client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, grant_type: 'refresh_token'})
        );
        return accessTokenObj.data.access_token;
    } catch (err) {
        return null;
    }
};

const fetchGoogleFitGetData = async (access_token) => {
    const DAY = 7;
    const weekAgo = new Date();
    weekAgo.setHours(0, 0, 0, 0);
    const dayOfMonth = weekAgo.getDate();
    weekAgo.setDate(dayOfMonth - (DAY - 1));

    const END = Date.parse(new Date());
    const START = Date.parse(weekAgo);
    const day = 7;
    const stats = {
        step: new Array(day).fill(0),
        distance: new Array(day).fill(0),
        heart_rate_avg: new Array(day).fill(0),
        heart_rate_max: new Array(day).fill(0),
        heart_rate_min: new Array(day).fill(0),
        active_minutes: new Array(day).fill(0),
        heart_level: new Array(day).fill(0),
        heart_minutes: new Array(day).fill(0),
        sleep: new Array(day).fill(0),
        animal: ""
    };

    let fitnessArray = [];
    let sleepArray = [];

    try {
        const result = await axios({
            method: "POST",
            headers: {
                authorization: "Bearer " + access_token
            },
            "Content-Type": "application/json",
            url: `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
            data: {
                aggregateBy: [
                    {
                        dataTypeName: "com.google.step_count.delta",
                        dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                    }, {
                        dataTypeName: "com.google.distance.delta",
                        dataSourceId: "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta"
                    }, {
                        dataTypeName: "com.google.active_minutes",
                        dataSourceId: "derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes"
                    }, {
                        dataTypeName: "com.google.heart_minutes",
                        dataSourceId: "derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes"
                    }
                ],
                // 86400000 millis = 24 hours
                bucketByTime: {
                    durationMillis: 86400000
                },
                startTimeMillis: START,
                endTimeMillis: END
            }

        });
        fitnessArray = result.data.bucket

        let i = 0;
        for (const dataSet of fitnessArray) {
            for (const points of dataSet.dataset) {
                for (const p of points.point) {
                    if (p.dataTypeName === 'com.google.step_count.delta') {
                        stats.step[i] += p.value[0].intVal
                    }
                    if (p.dataTypeName === 'com.google.distance.delta') {
                        stats.distance[i] += p.value[0].fpVal
                    }
                    if (p.dataTypeName === 'com.google.heart_rate.summary') {
                        stats.heart_rate_avg[i] += p.value[0].fpVal
                        stats.heart_rate_max[i] += p.value[1].fpVal
                        stats.heart_rate_min[i] += p.value[2].fpVal
                    }
                    if (p.dataTypeName === 'com.google.active_minutes') {
                        stats.active_minutes[i] += p.value[0].intVal
                    }
                    if (p.dataTypeName === 'com.google.heart_minutes.summary') {
                        stats.heart_level[i] += p.value[0].fpVal
                        stats.heart_minutes[i] += p.value[1].intVal
                    }
                }
            }
            i++;
        }
    } catch (e) {
        console.log(e);
    }

    try {
        const result = await axios({
            method: "POST",
            headers: {
                authorization: "Bearer " + access_token
            },
            "Content-Type": "application/json",
            url: `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
            data: {
                aggregateBy: [
                    {
                        dataTypeName: "com.google.sleep.segment"
                    }
                ],
                startTimeMillis: START,
                endTimeMillis: END
            }
        });
        sleepArray = result.data.bucket

        for (const dataSet of sleepArray) {
            for (const points of dataSet.dataset) {
                for (const p of points.point) {
                    if (p.value[0].intVal != 1) {
                        for (let i = 0; i <= DAY; i++) {
                             // 86400000 millis = 24 hours
                            if (p.startTimeNanos / 1000000 >= START + (86400000 * i) && p.endTimeNanos / 1000000 <= START + (86400000 * (i + 1))) {
                                stats.sleep[i] += (Math.round)((p.endTimeNanos - p.startTimeNanos) / 1000000000 / 60);
                            }

                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    stats.animal = calculateActivity({
        step: stats.step.reduce(reducer),
        active_minutes: stats.active_minutes.reduce(reducer),
        heart_minutes: stats.heart_minutes.reduce(reducer),
        heart_level: stats.heart_level.reduce(reducer)
    });
    return stats;
};

const fetchGoogleFitGetMonthlyData = async (access_token, month) => {
    const date = new Date();
    const start = new Date(date.getFullYear(), month - 1);
    const end = new Date(date.getFullYear(), month, 0, 23, 59, 59, 999);
    const END = Date.parse(end);
    const START = Date.parse(start);
    const len = new Date(date.getFullYear(), month, 0).getDate();
    const WEEKDAY = [
        'SUN','MON','TUE','WED','THU','FRI','SAT'
    ];

    const stats = {
        active_minutes: new Array(len).fill(0),
        start_day: WEEKDAY[start.getDay()]
    };

    let fitnessArray = [];

    try {
        const result = await axios({
            method: "POST",
            headers: {
                authorization: "Bearer " + access_token
            },
            "Content-Type": "application/json",
            url: `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
            data: {
                aggregateBy: [
                    {
                        dataTypeName: "com.google.active_minutes",
                        dataSourceId: "derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes"
                    }
                ],
                 // 86400000 millis = 24 hours
                bucketByTime: {
                    durationMillis: 86400000
                },
                startTimeMillis: START,
                endTimeMillis: END
            }
        });
        fitnessArray = result.data.bucket

        let i = 0;
        for (const dataSet of fitnessArray) {
            for (const points of dataSet.dataset) {
                for (const p of points.point) {
                    stats.active_minutes[i] += p.value[0].intVal
                }
            }
            i++
        }
    } catch (e) {
        console.log(e);
    }
    return stats;
};

module.exports = {
    fetchGoogleFitGetUrl,
    fetchGoogleFitGetData,
    getAccessToken,
    getRefreshToken,
    fetchGoogleFitGetMonthlyData
};