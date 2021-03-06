
const animals = require("../common/animals");
const objects = require("../common/objects");
const badgeThemes = require("../../themes/badgeThemes");

const renderAnimalObjectCard = (stats = {} ) => {
  const {
    name,
    animal = "sloth",
    theme = "default",
    size = 2,
  } = stats;

  const magni = size;
  const selectTheme = theme ? badgeThemes[theme] : badgeThemes["default"];

  const selectAnimal = () => { 
    if (animal == "sloth") {
      return `
      <svg preserveAspectRatio="xMidYMid meet" x="10%" y="0%" viewBox="-20 -20 128 128">
      ${animals.sloth}
      </svg>
      `;
    };
    if (animal == "pig") {
      return `
      <svg preserveAspectRatio="xMidYMid meet" x="7%" y="0%" viewBox="-20 -20 128 128">
      ${animals.pig}
      </svg>
      `;
    };
    if (animal == "dog") {
      return `
      <svg preserveAspectRatio="xMidYMid meet" x="7%" y="0%" viewBox="-20 -20 128 128">
      ${animals.dog}
      </svg>
      `;
    };
    if (animal == "horse") {
      return `
      <svg preserveAspectRatio="xMidYMid meet" x="0%" y="-7%" viewBox="-30 -30 128 128">
      ${animals.horse}
      </svg>
      `;
    };
  };

  return `
    <svg version="1.1"
      width="${magni*100}" height="${magni*115}"
      viewBox="0 0 200 230"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path d="M 25 100 A 50 50 0 1 1 175 100 " id="usernameCircle"/>
        <path id="ribbonText" d="M36 185.5C48 181 66.5 178 66.5 178C66.5 178 74.5 176 99.5 176C124.5 176 142 178.5 163 185.5"/>
      </defs>
      <style>
        ${selectTheme.describeText}
        ${selectTheme.starColor}
      </style>
      <g id="badge">
        <g id="circle">
          <circle id="outCircle" cx="100" cy="100" r="100" fill="${selectTheme.outcircleColor}"/>
          <circle id="inCircle" cx="100" cy="100" r="60" fill="${selectTheme.incircleColor}"/>
          <g id="stars">
            <animateTransform 
            attributeName="transform" 
            attributeType="XML" 
            type="rotate"
            dur="5s" 
            from="0 100 100"
            to="-360 100 100" 
            repeatCount="1" />
            <path id="Star 16" d="M64.5 8L65.0613 9.72746H66.8776L65.4082 10.7951L65.9695 12.5225L64.5 11.4549L63.0305 12.5225L63.5918 10.7951L62.1224 9.72746H63.9387L64.5 8Z"/>
            <path id="Star 15" d="M33.5 29L34.0613 30.7275H35.8776L34.4082 31.7951L34.9695 33.5225L33.5 32.4549L32.0305 33.5225L32.5918 31.7951L31.1224 30.7275H32.9387L33.5 29Z"/>
            <path id="Star 14" d="M12.5 59L13.0613 60.7275H14.8776L13.4082 61.7951L13.9695 63.5225L12.5 62.4549L11.0305 63.5225L11.5918 61.7951L10.1224 60.7275H11.9387L12.5 59Z"/>
            <path id="Star 13" d="M4.5 95L5.06129 96.7275H6.87764L5.40818 97.7951L5.96946 99.5225L4.5 98.4549L3.03054 99.5225L3.59182 97.7951L2.12236 96.7275H3.93871L4.5 95Z"/>
            <path id="Star 12" d="M10.5 131L11.0613 132.727H12.8776L11.4082 133.795L11.9695 135.522L10.5 134.455L9.03054 135.522L9.59182 133.795L8.12236 132.727H9.93871L10.5 131Z"/>
            <path id="Star 11" d="M30.5 164L31.0613 165.727H32.8777L31.4082 166.795L31.9695 168.522L30.5 167.455L29.0306 168.522L29.5919 166.795L28.1224 165.727H29.9387L30.5 164Z"/>
            <path id="Star 10" d="M61.5 185L62.0613 186.728H63.8776L62.4082 187.795L62.9695 189.523L61.5 188.455L60.0305 189.523L60.5918 187.795L59.1224 186.728H60.9387L61.5 185Z"/>
            <path id="Star 9" d="M99.5 193L100.061 194.727H101.878L100.408 195.795L100.969 197.523L99.5 196.455L98.0305 197.523L98.5918 195.795L97.1224 194.727H98.9387L99.5 193Z"/>
            <path id="Star 8" d="M138.5 186L139.061 187.728H140.878L139.408 188.795L139.969 190.523L138.5 189.455L137.031 190.523L137.592 188.795L136.122 187.728H137.939L138.5 186Z"/>
            <path id="Star 7" d="M170.5 163L171.061 164.727H172.878L171.408 165.795L171.969 167.523L170.5 166.455L169.031 167.523L169.592 165.795L168.122 164.727H169.939L170.5 163Z"/>
            <path id="Star 6" d="M189.5 131L190.061 132.727H191.878L190.408 133.795L190.969 135.522L189.5 134.455L188.031 135.522L188.592 133.795L187.122 132.727H188.939L189.5 131Z"/>
            <path id="Star 5" d="M195.5 95L196.061 96.7275H197.878L196.408 97.7951L196.969 99.5225L195.5 98.4549L194.031 99.5225L194.592 97.7951L193.122 96.7275H194.939L195.5 95Z"/>
            <path id="Star 4" d="M187.5 59L188.061 60.7275H189.878L188.408 61.7951L188.969 63.5225L187.5 62.4549L186.031 63.5225L186.592 61.7951L185.122 60.7275H186.939L187.5 59Z"/>
            <path id="Star 3" d="M166.5 29L167.061 30.7275H168.878L167.408 31.7951L167.969 33.5225L166.5 32.4549L165.031 33.5225L165.592 31.7951L164.122 30.7275H165.939L166.5 29Z"/>
            <path id="Star 2" d="M135.5 9L136.061 10.7275H137.878L136.408 11.7951L136.969 13.5225L135.5 12.4549L134.031 13.5225L134.592 11.7951L133.122 10.7275H134.939L135.5 9Z"/>
            <path id="Star 1" d="M99.5 2L100.061 3.72746H101.878L100.408 4.79508L100.969 6.52254L99.5 5.45492L98.0305 6.52254L98.5918 4.79508L97.1224 3.72746H98.9387L99.5 2Z"/>
          </g>
        </g>
        ${selectAnimal()}
      </g>
    </svg>
  `
};

module.exports = renderAnimalObjectCard;
