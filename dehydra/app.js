// PIXI Application
const app = new PIXI.Application({
  width: 400,
  height: 400,
  backgroundAlpha: 0
});
document.getElementById("game-container").appendChild(app.view);

// Placeholder assets (replace with your own pixel art)
const plantStates = [
  "assets/plant_best.png",    // 0
  "assets/plant_good.png",    // 1
  "assets/plant_neutral.png", // 2
  "assets/plant_bad.png",     // 3
  "assets/plant_worst.png"    // 4
];
const bgPath = "assets/terrarium_bg.png";

// State variables
let plantSprite;
let currentState = 0;
let lastWaterTime = localStorage.getItem("lastWaterTime")
  ? parseInt(localStorage.getItem("lastWaterTime"))
  : Date.now();

const statusMessages = [
  "Your plant is thriving 🌱",
  "Looking pretty good 🍃",
  "Meh... staying alive 😐",
  "Looking rough... 😟",
  "On the brink of death 💀"
];

// Thresholds in hours until plant worsens
const decayThresholds = [0, 2, 4, 8, 16];

// Load assets
PIXI.Assets.addBundle("plants", {
  best: plantStates[0],
  good: plantStates[1],
  neutral: plantStates[2],
  bad: plantStates[3],
  worst: plantStates[4],
  bg: bgPath
});

let loadedAssets; // Store loaded assets globally

PIXI.Assets.loadBundle("plants").then((assets) => {
  loadedAssets = assets; // Save for later use

  // Background
  const bg = new PIXI.Sprite(assets.bg);
  bg.width = app.screen.width;
  bg.height = app.screen.height;
  app.stage.addChild(bg);

  // Plant sprite
  plantSprite = new PIXI.Sprite(assets.best);
  plantSprite.anchor.set(0.5);
  plantSprite.x = app.screen.width / 2;
  plantSprite.y = app.screen.height / 2;
  app.stage.addChild(plantSprite);

  // Update immediately on load
  updatePlantMood();

  // Check plant mood every minute
  setInterval(updatePlantMood, 60 * 1000);
});

// Calculate hours since last water and update plant
function updatePlantMood() {
  const hoursSinceWater = (Date.now() - lastWaterTime) / (1000 * 60 * 60);

  let newState = 0;
  if (hoursSinceWater >= decayThresholds[4]) newState = 4;
  else if (hoursSinceWater >= decayThresholds[3]) newState = 3;
  else if (hoursSinceWater >= decayThresholds[2]) newState = 2;
  else if (hoursSinceWater >= decayThresholds[1]) newState = 1;

  if (newState !== currentState) {
    changeState(newState);
  }
}

// Smoothly fade to new plant state
function changeState(newState) {
  currentState = newState;
  document.getElementById("status-text").textContent = statusMessages[newState];

  gsap.to(plantSprite, {
    alpha: 0,
    duration: 0.4,
    onComplete: () => {
      // Use loadedAssets for textures
      const assetKeys = ["best", "good", "neutral", "bad", "worst"];
      plantSprite.texture = loadedAssets[assetKeys[newState]];
      gsap.to(plantSprite, { alpha: 1, duration: 0.4 });
    }
  });
}

// Hydration button
document.getElementById("water-btn").addEventListener("click", () => {
  lastWaterTime = Date.now();
  localStorage.setItem("lastWaterTime", lastWaterTime);
  changeState(0); // instantly restore to best
});
