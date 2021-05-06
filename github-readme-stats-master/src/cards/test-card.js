const I18n = require("../common/I18n");
const Card = require("../common/Card");
const icons = require("../common/icons");
const animals = require("../common/animals");
const drinks = require("../common/drinks");
const { getStyles } = require("../getStyles");
const { statCardLocales } = require("../translations");
const {
  kFormatter,
  FlexLayout,
  clampValue,
  measureText,
  getCardColors,
} = require("../common/utils");
const { commits } = require("../common/icons");




const createTextNode = ({
  icon,
  label,
  value,
  id,
  index,
  showIcons,
  shiftValuePos,
}) => {
  const kValue = kFormatter(value);
  const staggerDelay = (index + 3) * 150;

  const labelOffset = showIcons ? `x="25"` : "";
  const iconSvg = showIcons
    ? `
    <svg data-testid="icon" class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
      ${icon}
    </svg>
  `
    : "";
  return `
    <g class="stagger" style="animation-delay: ${staggerDelay}ms" transform="translate(25, 0)">
      ${iconSvg}
      <text class="stat bold" ${labelOffset} y="12.5">${label}:</text>
      <text 
        class="stat" 
        x="${(showIcons ? 140 : 120) + shiftValuePos}" 
        y="12.5" 
        data-testid="${id}"
      >${kValue}</text>
    </g>
  `;
};

const renderStatsCard = (stats = {}, options = { hide: [] }) => {
  const {
    name,
    totalStars,
    totalCommits,
    totalIssues,
    totalPRs,
    contributedTo,
    day7commits,
    rank,
  } = stats;
  const {
    hide = [],
    show_icons = false,
    hide_title = false,
    hide_border = false,
    hide_rank = false,
    include_all_commits = false,
    line_height = 25,
    title_color,
    icon_color,
    text_color,
    bg_color,
    theme = "default",
    custom_title,
    border_radius,
    border_color,
    locale,
    disable_animations = false,
    animal = 1,
    drink = 1,
  } = options;

  const lheight = parseInt(line_height, 10);

  // returns theme based colors with proper overrides and defaults
  const { titleColor, textColor, iconColor, bgColor, borderColor } = getCardColors({
    title_color,
    icon_color,
    text_color,
    bg_color,
    border_color,
    theme,
  });

  const apostrophe = ["x", "s"].includes(name.slice(-1).toLocaleLowerCase())
    ? ""
    : "s";
  const i18n = new I18n({
    locale,
    translations: statCardLocales({ name, apostrophe }),
  });

  // Meta data for creating text nodes with createTextNode function
  const STATS = {
    stars: {
      icon: icons.star,
      label: i18n.t("statcard.totalstars"),
      value: totalStars,
      id: "stars",
    },
    commits: {
      icon: icons.commits,
      label: `${i18n.t("statcard.commits")}${
        include_all_commits ? "" : ` (${new Date().getFullYear()})`
      }`,
      value: totalCommits,
      id: "commits",
    },
    prs: {
      icon: icons.prs,
      label: i18n.t("statcard.prs"),
      value: totalPRs,
      id: "prs",
    },
    issues: {
      icon: icons.issues,
      label: i18n.t("statcard.issues"),
      value: totalIssues,
      id: "issues",
    },
    contribs: {
      icon: icons.contribs,
      label: i18n.t("statcard.contribs"),
      value: contributedTo,
      id: "contribs",
    },
    day7commit: {
      icon: icons.commits,
      label: i18n.t("statcard.day7commit"),
      value: day7commits,
      id: "day7commits",
    },
  };

  const longLocales = ["cn", "es", "fr", "pt-br", "ru", "uk-ua", "id", "my", "pl"];
  const isLongLocale = longLocales.includes(locale) === true;

  // filter out hidden stats defined by user & create the text nodes
  const statItems = Object.keys(STATS)
    .filter((key) => !hide.includes(key))
    .map((key, index) =>
      // create the text nodes, and pass index so that we can calculate the line spacing
      createTextNode({
        ...STATS[key],
        index,
        showIcons: show_icons,
        shiftValuePos:
          (!include_all_commits ? 50 : 20) + (isLongLocale ? 50 : 0),
      }),
    );

  // Calculate the card height depending on how many items there are
  // but if rank circle is visible clamp the minimum height to `150`
  let height = Math.max(
    45 + (statItems.length + 1) * lheight,
    hide_rank ? 0 : 150,
  );

  // Conditionally rendered elements
  const rankCircle = hide_rank
    ? ""
    : `<g data-testid="rank-circle" 
          transform="translate(400, ${height / 2 - 50})">
        <circle class="rank-circle-rim" cx="-10" cy="8" r="40" />
        <circle class="rank-circle" cx="-10" cy="8" r="40" />
        <g class="rank-text">
          <text
            x="${rank.level.length === 1 ? "-4" : "0"}"
            y="0"
            alignment-baseline="central"
            dominant-baseline="central"
            text-anchor="middle"
          >
            ${rank.level}
          </text>
        </g>
      </g>`;

  // the better user's score the the rank will be closer to zero so
  // subtracting 100 to get the progress in 100%
  const progress = 100 - rank.score;
  const cssStyles = getStyles({
    titleColor,
    textColor,
    iconColor,
    show_icons,
    progress,
  });

  const calculateTextWidth = () => {
    return measureText(custom_title ? custom_title : i18n.t("statcard.title"));
  };
  
  const width = hide_rank
    ? clampValue(
        50 /* padding */ + calculateTextWidth() * 2,
        270 /* min */,
        Infinity,
      )
    : 495;

  const card = new Card({
    customTitle: custom_title,
    defaultTitle: i18n.t("statcard.title"),
    width,
    height,
    border_radius,
    colors: {
      titleColor,
      textColor,
      iconColor,
      bgColor,
      borderColor,
    },
  });

  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);
  card.setCSS(cssStyles);

  if (disable_animations) card.disableAnimations();
  
  const magni = 30;

  const selectAnimal = () => {
    if (animal == 1) {
      return `
      <svg preserveAspectRatio="xMidYMid meet" x="20%" y="20%" viewBox="${-magni} ${-magni} ${72+2*magni} ${72+2*magni}">
      ${animals.sloth}
      </svg>
      `;
    };
    if (animal == 2) {
      return `
      <svg preserveAspectRatio="xMidYMid meet" x="20%" y="20%" viewBox="${-magni} ${-magni} ${72+2*magni} ${72+2*magni}">
      ${animals.pig}
      </svg>
      `;
    };
    if (animal == 3) {
      return `
      <svg preserveAspectRatio="xMidYMid meet" x="20%" y="20%" viewBox="${-magni} ${-magni} ${72+2*magni} ${72+2*magni}">
      ${animals.pig}
      </svg>
      `;
    };
  };
  const selectDrink = () => {
    if (drink == 1) {
      return `
      <svg preserveAspectRatio="xMidYMid meet" viewBox="${-magni} ${-magni} ${72+2*magni} ${72+2*magni}">
      ${drinks.babyBottle}
      </svg>
      `;
    };
    if (drink == 2) {
      return `
      <svg preserveAspectRatio="xMidYMid meet" viewBox="${-magni} ${-magni} ${72+2*magni} ${72+2*magni}">
      ${drinks.tea}
      </svg>
      `;
    };
    if (drink == 3) {
      return `
      <svg preserveAspectRatio="xMidYMid meet" viewBox="${-magni} ${-magni} ${72+2*magni} ${72+2*magni}">
      ${drinks.tea}
      </svg>
      `;
    };
  };

  return `
    <svg version="1.1"
     baseProfile="full"
     width="${magni*10}" height="${magni*10}"
     xmlns="http://www.w3.org/2000/svg">
 
  <defs>
    <linearGradient id="myGradient" gradientTransform="rotate(90)">
      <stop offset="5%"  stop-color="#ffc3a0" />
      <stop offset="95%" stop-color="#FFAFBD" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="white" />
  <circle cx="50%" cy="50%" r="50%" stroke="black" stroke-width="0" fill="url('#myGradient')" />
  <svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
    <text x="50%" y="10%" font-size="15" alignment-baseline="central" dominant-baseline="central" text-anchor="middle" fill="white">drink milk dog</text>
    <text x="82.5%" y="20%" font-size="10" alignment-baseline="central" dominant-baseline="central" text-anchor="end" fill="white">${day7commits} C/W</text>
  </svg>
  ${selectAnimal()}
  ${selectDrink()}
</svg>
  `
};

module.exports = renderStatsCard;
