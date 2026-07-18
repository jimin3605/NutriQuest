/**
 * ============================================================
 * NutriQuest - 게임형 식습관 관리 웹사이트
 * script.js - 게임 로직, 상태 관리, UI 업데이트
 * ============================================================
 */

/* ----- 음식 데이터베이스 (영양 정보) ----- */
const FOOD_DB = {
  '밥':       { protein: 2, vitamin: 0, calcium: 0, fiber: 1, sodium: 0, sugar: 0, fat: 0, category: 'grain' },
  '계란':     { protein: 6, vitamin: 1, calcium: 2, fiber: 0, sodium: 1, sugar: 0, fat: 3, category: 'protein' },
  '우유':     { protein: 3, vitamin: 1, calcium: 5, fiber: 0, sodium: 1, sugar: 2, fat: 2, category: 'dairy' },
  '사과':     { protein: 0, vitamin: 3, calcium: 0, fiber: 2, sodium: 0, sugar: 3, fat: 0, category: 'fruit' },
  '닭가슴살': { protein: 8, vitamin: 0, calcium: 0, fiber: 0, sodium: 1, sugar: 0, fat: 1, category: 'protein' },
  '라면':     { protein: 2, vitamin: 0, calcium: 0, fiber: 0, sodium: 8, sugar: 1, fat: 5, category: 'junk' },
  '치킨':     { protein: 5, vitamin: 0, calcium: 0, fiber: 0, sodium: 4, sugar: 0, fat: 8, category: 'junk' },
  '햄버거':   { protein: 4, vitamin: 0, calcium: 1, fiber: 1, sodium: 6, sugar: 2, fat: 7, category: 'junk' },
  '콜라':     { protein: 0, vitamin: 0, calcium: 0, fiber: 0, sodium: 1, sugar: 9, fat: 0, category: 'soda' },
  '채소':     { protein: 1, vitamin: 4, calcium: 1, fiber: 4, sodium: 0, sugar: 0, fat: 0, category: 'vegetable' },
  '김치':     { protein: 1, vitamin: 3, calcium: 1, fiber: 2, sodium: 5, sugar: 0, fat: 0, category: 'vegetable' },
  '생선':     { protein: 7, vitamin: 2, calcium: 2, fiber: 0, sodium: 2, sugar: 0, fat: 2, category: 'protein' },
  '두부':     { protein: 5, vitamin: 1, calcium: 3, fiber: 1, sodium: 1, sugar: 0, fat: 2, category: 'protein' },
  '과일':     { protein: 0, vitamin: 4, calcium: 0, fiber: 3, sodium: 0, sugar: 4, fat: 0, category: 'fruit' }
};

/* ----- 진화 단계 정의 ----- */
const EVOLUTION_STAGES = [
  { level: 1,  stage: 'chick',    name: '병아리',     scale: 1.0 },
  { level: 5,  stage: 'bird',     name: '새',         scale: 1.15 },
  { level: 10, stage: 'eagle',    name: '독수리',     scale: 1.3 },
  { level: 20, stage: 'mythical', name: '신화 속 새', scale: 1.5 }
];

/* ----- 미션 풀 (매일 랜덤 3개 선택) ----- */
const MISSION_POOL = [
  { id: 'water8',    title: '물 8잔 마시기',  desc: '하루 8잔 이상 물을 마셔보세요',       coin: 10, exp: 15, check: 'manual' },
  { id: 'fruit',     title: '과일 먹기',      desc: '과일 또는 사과를 섭취하세요',         coin: 15, exp: 20, check: 'food', categories: ['fruit'] },
  { id: 'vegetable', title: '채소 먹기',      desc: '채소 또는 김치를 섭취하세요',         coin: 15, exp: 20, check: 'food', categories: ['vegetable'] },
  { id: 'milk',      title: '우유 마시기',    desc: '우유를 마셔 칼슘을 보충하세요',       coin: 10, exp: 15, check: 'food', foods: ['우유'] },
  { id: 'breakfast', title: '아침 먹기',      desc: '아침 식사를 기록하세요',              coin: 20, exp: 25, check: 'meal', meal: 'breakfast' },
  { id: 'protein',   title: '단백질 섭취',    desc: '닭가슴살, 계란, 생선, 두부 중 선택', coin: 15, exp: 20, check: 'food', categories: ['protein'] },
  { id: 'nosoda',    title: '탄산 NO',        desc: '오늘 콜라를 마시지 않으세요',         coin: 20, exp: 25, check: 'nosoda' },
  { id: 'balanced',  title: '균형 식단',      desc: '3끼 이상 식사를 기록하세요',          coin: 25, exp: 30, check: 'meals', count: 3 }
];

/* ----- 업적 정의 ----- */
const ACHIEVEMENTS = [
  { id: 'first_meal',    name: '첫 식사 기록',     icon: '🍽️', desc: '첫 식사를 기록했다',           condition: (s) => s.totalMeals >= 1 },
  { id: 'streak_3',      name: '3일 연속 기록',    icon: '🔥', desc: '3일 연속 식사 기록',           condition: (s) => s.streak >= 3 },
  { id: 'streak_7',      name: '7일 연속 기록',    icon: '⭐', desc: '7일 연속 식사 기록',           condition: (s) => s.streak >= 7 },
  { id: 'veg_100',       name: '채소 마스터',      icon: '🥬', desc: '채소 100회 섭취',              condition: (s) => s.vegCount >= 100 },
  { id: 'fruit_100',     name: '과일 마스터',      icon: '🍎', desc: '과일 100회 섭취',              condition: (s) => s.fruitCount >= 100 },
  { id: 'nosoda_30',     name: '탄산 킬러',        icon: '🚫', desc: '탄산 안 마시기 30일',          condition: (s) => s.noSodaDays >= 30 },
  { id: 'level_10',      name: '성장의 증거',      icon: '🦅', desc: '레벨 10 달성',                 condition: (s) => s.level >= 10 },
  { id: 'level_20',      name: '전설의 새',        icon: '✨', desc: '레벨 20 달성',                 condition: (s) => s.level >= 20 },
  { id: 'boss_defeat',   name: '보스 헌터',        icon: '⚔️', desc: '주간 보스 처치',               condition: (s) => s.bossesDefeated >= 1, rare: true }
];

/* ----- 칭호 정의 ----- */
const TITLES = [
  { id: 'rookie',     name: '새내기 영양사',   icon: '🐣', unlockLevel: 1 },
  { id: 'healthy',    name: '건강 지킴이',     icon: '💚', unlockLevel: 5 },
  { id: 'master',     name: '영양 마스터',     icon: '🏆', unlockLevel: 10 },
  { id: 'legend',     name: '전설의 수호자',   icon: '👑', unlockLevel: 20 }
];

/* ----- 스킨 정의 ----- */
const SKINS = [
  { id: 'default',  name: '기본',       icon: '🐤', unlockLevel: 1 },
  { id: 'spring',   name: '봄 스킨',    icon: '🌸', unlockLevel: 5 },
  { id: 'summer',   name: '여름 스킨',  icon: '☀️', unlockLevel: 10 },
  { id: 'mythic',   name: '신화 스킨',  icon: '🌟', unlockLevel: 20 }
];

/* ----- 주간 보스 정의 ----- */
const BOSSES = [
  { id: 'obesity',  name: '비만 몬스터',   icon: '🍔', desc: '이번 주 미션 5개 이상 완료하면 처치!', requiredMissions: 5 },
  { id: 'sugar',    name: '당 몬스터',     icon: '🍭', desc: '이번 주 미션 5개 이상 완료하면 처치!', requiredMissions: 5 },
  { id: 'sodium',   name: '나트륨 몬스터', icon: '🧂', desc: '이번 주 미션 5개 이상 완료하면 처치!', requiredMissions: 5 }
];

/* ----- 랭킹 더미 데이터 ----- */
const RANKING_DATA = [
  { name: '건강왕', level: 18 },
  { name: '채소러버', level: 15 },
  { name: '단백질킹', level: 14 },
  { name: '아침형인간', level: 12 },
  { name: '과일요정', level: 11 },
  { name: '물마시기고수', level: 10 },
  { name: '영양박사', level: 9 },
  { name: '다이어터', level: 8 }
];

/* ----- 식사 타입 라벨 ----- */
const MEAL_LABELS = {
  breakfast: { label: '아침', icon: 'fa-sun' },
  lunch:     { label: '점심', icon: 'fa-cloud-sun' },
  dinner:    { label: '저녁', icon: 'fa-moon' },
  snack:     { label: '간식', icon: 'fa-cookie-bite' }
};

/* ============================================================
   게임 상태 관리
   ============================================================ */

/** 기본 게임 상태 생성 */
function createDefaultState() {
  const today = getTodayKey();
  return {
    nickname: '나',
    level: 1,
    exp: 0,
    coins: 0,
    stats: { health: 50, focus: 50, strength: 50, immunity: 50, happiness: 50 },
    meals: {},
    dailyNutrition: { protein: 0, vitamin: 0, calcium: 0, fiber: 0, sodium: 0, sugar: 0, fat: 0 },
    dailyMissions: [],
    missionProgress: {},
    achievements: [],
    titles: ['rookie'],
    equippedTitle: 'rookie',
    skins: ['default'],
    equippedSkin: 'default',
    healthCalendar: {},
    streak: 0,
    lastRecordDate: null,
    totalMeals: 0,
    vegCount: 0,
    fruitCount: 0,
    noSodaDays: 0,
    lastSodaDate: null,
    weeklyMissionsCompleted: 0,
    weekKey: getWeekKey(),
    currentBoss: null,
    bossesDefeated: 0,
    bossDefeatedThisWeek: false,
    lastMissionDate: today,
    soundEnabled: true
  };
}

/** localStorage에서 상태 로드 */
function loadState() {
  try {
    const saved = localStorage.getItem('nutriquest_save');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...createDefaultState(), ...parsed };
    }
  } catch (e) {
    console.warn('저장 데이터 로드 실패:', e);
  }
  return createDefaultState();
}

/** localStorage에 상태 저장 */
function saveState() {
  localStorage.setItem('nutriquest_save', JSON.stringify(gameState));
}

/** 오늘 날짜 키 (YYYY-MM-DD) */
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 주간 키 (년-주차) */
function getWeekKey() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

/** 레벨업에 필요한 EXP 계산 */
function expRequired(level) {
  return level * 100;
}

/** 현재 진화 단계 반환 */
function getEvolutionStage(level) {
  let current = EVOLUTION_STAGES[0];
  for (const stage of EVOLUTION_STAGES) {
    if (level >= stage.level) current = stage;
  }
  return current;
}

/* ============================================================
   게임 로직
   ============================================================ */

let gameState = loadState();
let currentMealType = null;
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

/** 일일 초기화 체크 */
function checkDailyReset() {
  const today = getTodayKey();

  if (gameState.lastMissionDate !== today) {
    gameState.meals = {};
    gameState.dailyNutrition = { protein: 0, vitamin: 0, calcium: 0, fiber: 0, sodium: 0, sugar: 0, fat: 0 };
    gameState.dailyMissions = pickRandomMissions(3);
    gameState.missionProgress = {};
    gameState.lastMissionDate = today;

    if (gameState.lastSodaDate !== today) {
      const hadSoda = Object.values(gameState.meals).flat().some(f => f === '콜라');
      if (!hadSoda && gameState.lastRecordDate) {
        gameState.noSodaDays++;
      }
    }
  }

  const currentWeek = getWeekKey();
  if (gameState.weekKey !== currentWeek) {
    gameState.weekKey = currentWeek;
    gameState.weeklyMissionsCompleted = 0;
    gameState.bossDefeatedThisWeek = false;
    gameState.currentBoss = BOSSES[Math.floor(Math.random() * BOSSES.length)];
  }

  if (!gameState.currentBoss) {
    gameState.currentBoss = BOSSES[Math.floor(Math.random() * BOSSES.length)];
  }

  if (gameState.dailyMissions.length === 0) {
    gameState.dailyMissions = pickRandomMissions(3);
  }
}

/** 랜덤 미션 선택 */
function pickRandomMissions(count) {
  const shuffled = [...MISSION_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(m => m.id);
}

/** EXP 추가 및 레벨업 처리 */
function addExp(amount) {
  gameState.exp += amount;
  const required = expRequired(gameState.level);

  if (gameState.exp >= required) {
    gameState.exp -= required;
    gameState.level++;
    onLevelUp();
  }

  saveState();
  updateUI();
}

/** 코인 추가 */
function addCoins(amount) {
  gameState.coins += amount;
  saveState();
  updateUI();
}

/** 레벨업 이벤트 */
function onLevelUp() {
  const stage = getEvolutionStage(gameState.level);
  const prevStage = getEvolutionStage(gameState.level - 1);

  showLevelUpModal(gameState.level, prevStage.stage !== stage.stage ? stage.name : null);

  TITLES.forEach(t => {
    if (gameState.level >= t.unlockLevel && !gameState.titles.includes(t.id)) {
      gameState.titles.push(t.id);
    }
  });

  SKINS.forEach(s => {
    if (gameState.level >= s.unlockLevel && !gameState.skins.includes(s.id)) {
      gameState.skins.push(s.id);
      showToast(`새 스킨 해금: ${s.name}!`, 'fa-palette');
    }
  });

  checkAchievements();
}

/** 식사 기록 */
function recordMeal(mealType, foods) {
  if (!foods.length) return;

  gameState.meals[mealType] = foods;
  gameState.totalMeals++;

  const today = getTodayKey();
  if (gameState.lastRecordDate !== today) {
    if (gameState.lastRecordDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      gameState.streak = gameState.lastRecordDate === yKey ? gameState.streak + 1 : 1;
    } else {
      gameState.streak = 1;
    }
    gameState.lastRecordDate = today;
  }

  foods.forEach(foodName => {
    const food = FOOD_DB[foodName];
    if (!food) return;

    gameState.dailyNutrition.protein += food.protein;
    gameState.dailyNutrition.vitamin += food.vitamin;
    gameState.dailyNutrition.calcium += food.calcium;
    gameState.dailyNutrition.fiber += food.fiber;
    gameState.dailyNutrition.sodium += food.sodium;
    gameState.dailyNutrition.sugar += food.sugar;
    gameState.dailyNutrition.fat += food.fat;

    if (food.category === 'vegetable') gameState.vegCount++;
    if (food.category === 'fruit') gameState.fruitCount++;
    if (food.category === 'soda') gameState.lastSodaDate = today;
  });

  updateStats();
  calculateHealthScore();

  addExp(foods.length * 10 + 5);
  addCoins(foods.length * 2);

  checkMissions();
  checkAchievements();
  checkBoss();

  showNutritionAnalysis();
  saveState();
  updateUI();
}

/** 스탯 업데이트 (영양 분석 기반) */
function updateStats() {
  const n = gameState.dailyNutrition;
  const clamp = (v) => Math.max(0, Math.min(100, v));

  gameState.stats.strength = clamp(50 + n.protein * 2 - n.fat);
  gameState.stats.immunity = clamp(50 + n.vitamin * 3 + n.fiber * 2 - n.sodium);
  gameState.stats.focus = clamp(50 + n.vitamin * 2 - n.sugar * 2);
  gameState.stats.health = clamp(50 + n.protein + n.vitamin + n.calcium + n.fiber - n.sodium - n.sugar - n.fat);
  gameState.stats.happiness = clamp(50 + n.protein + n.vitamin - n.sodium * 2 - n.sugar);
}

/** 건강 점수 계산 및 달력 기록 */
function calculateHealthScore() {
  const n = gameState.dailyNutrition;
  const good = n.protein + n.vitamin + n.calcium + n.fiber;
  const bad = n.sodium + n.sugar + n.fat;
  const score = good - bad;

  let grade;
  if (score >= 15) grade = 'good';
  else if (score >= 5) grade = 'normal';
  else grade = 'bad';

  gameState.healthCalendar[getTodayKey()] = grade;
}

/** 영양 분석 결과 표시 */
function showNutritionAnalysis() {
  const n = gameState.dailyNutrition;
  const good = n.protein + n.vitamin + n.calcium + n.fiber;
  const bad = n.sodium + n.sugar + n.fat;
  const isGood = good >= bad;

  const overlay = document.getElementById('analysisOverlay');
  const charEl = document.getElementById('analysisCharacter');
  const msgEl = document.getElementById('analysisMessage');

  charEl.textContent = isGood ? '😊' : '😢';
  msgEl.textContent = isGood ? '훌륭한 식단이에요! 💚' : '조금 더 건강하게 먹어봐요! 💪';
  msgEl.className = `analysis-message ${isGood ? 'good' : 'bad'}`;

  setCharacterMood(isGood ? 'happy' : 'sad');

  overlay.classList.add('active');
  setTimeout(() => overlay.classList.remove('active'), 2000);
}

/** 캐릭터 표정 변경 */
function setCharacterMood(mood) {
  document.querySelectorAll('.character.active').forEach(c => {
    c.classList.remove('happy', 'sad');
    c.classList.add(mood);
  });

  const statusEl = document.getElementById('charStatus');
  if (mood === 'happy') {
    statusEl.innerHTML = '<i class="fa-solid fa-face-smile"></i> 기분 좋음';
  } else {
    statusEl.innerHTML = '<i class="fa-solid fa-face-sad-tear"></i> 조금 슬픔';
  }
}

/** 미션 자동 체크 */
function checkMissions() {
  gameState.dailyMissions.forEach(missionId => {
    if (gameState.missionProgress[missionId]) return;

    const mission = MISSION_POOL.find(m => m.id === missionId);
    if (!mission) return;

    let completed = false;

    switch (mission.check) {
      case 'meal':
        completed = !!gameState.meals[mission.meal];
        break;
      case 'meals':
        completed = Object.keys(gameState.meals).length >= mission.count;
        break;
      case 'food':
        if (mission.foods) {
          completed = Object.values(gameState.meals).flat().some(f => mission.foods.includes(f));
        } else if (mission.categories) {
          completed = Object.values(gameState.meals).flat().some(f => {
            const food = FOOD_DB[f];
            return food && mission.categories.includes(food.category);
          });
        }
        break;
      case 'nosoda':
        completed = !Object.values(gameState.meals).flat().includes('콜라');
        break;
    }

    if (completed) completeMission(missionId);
  });
}

/** 미션 수동 완료 */
function completeMission(missionId, manual = false) {
  if (gameState.missionProgress[missionId]) return;

  const mission = MISSION_POOL.find(m => m.id === missionId);
  if (!mission) return;

  if (mission.check === 'manual' && !manual) return;

  gameState.missionProgress[missionId] = true;
  gameState.weeklyMissionsCompleted++;

  addExp(mission.exp);
  addCoins(mission.coin);

  showToast(`미션 완료: ${mission.title}! +${mission.coin}🪙`, 'fa-flag');
  checkBoss();
  saveState();
  renderMissions();
}

/** 보스 처치 체크 */
function checkBoss() {
  if (gameState.bossDefeatedThisWeek) return;

  const boss = gameState.currentBoss;
  if (!boss) return;

  if (gameState.weeklyMissionsCompleted >= boss.requiredMissions) {
    gameState.bossDefeatedThisWeek = true;
    gameState.bossesDefeated++;
    addCoins(50);
    addExp(100);

    if (!gameState.achievements.includes('boss_defeat')) {
      gameState.achievements.push('boss_defeat');
      showToast('희귀 배지 획득: 보스 헌터! ⚔️', 'fa-dragon');
    } else {
      showToast(`보스 처치! ${boss.name}를 물리쳤어요!`, 'fa-dragon');
    }

    saveState();
    updateBossUI();
  }
}

/** 업적 체크 */
function checkAchievements() {
  ACHIEVEMENTS.forEach(ach => {
    if (gameState.achievements.includes(ach.id)) return;
    if (ach.condition(gameState)) {
      gameState.achievements.push(ach.id);
      showToast(`업적 달성: ${ach.name}! ${ach.icon}`, 'fa-medal');
    }
  });
  saveState();
  renderInventory();
}

/* ============================================================
   UI 업데이트
   ============================================================ */

function updateUI() {
  updateHeader();
  updateCharacter();
  updateStatsUI();
  updateMealButtons();
  updateNutritionPanel();
  updateBossUI();
  renderCalendar();
  renderMealLog();
  renderMissions();
  renderInventory();
  renderRanking();
}

function updateHeader() {
  document.getElementById('headerLevel').textContent = `Lv.${gameState.level}`;
  document.getElementById('coinCount').textContent = gameState.coins;

  const required = expRequired(gameState.level);
  const pct = (gameState.exp / required) * 100;
  document.getElementById('xpBarFill').style.width = `${pct}%`;
  document.getElementById('xpBarText').textContent = `${gameState.exp} / ${required} EXP`;
}

function updateCharacter() {
  const stage = getEvolutionStage(gameState.level);

  document.getElementById('charLevel').textContent = `Lv.${gameState.level}`;
  document.getElementById('charExp').textContent = `EXP ${gameState.exp} / ${expRequired(gameState.level)}`;

  document.querySelectorAll('.character').forEach(c => c.classList.remove('active'));
  const activeChar = document.querySelector(`.character[data-stage="${stage.stage}"]`);
  if (activeChar) {
    activeChar.classList.add('active');
    activeChar.querySelector('.char-body').style.transform = `scale(${stage.scale})`;
  }
}

function updateStatsUI() {
  const stats = gameState.stats;
  const mapping = {
    health: 'Health', focus: 'Focus', strength: 'Strength',
    immunity: 'Immunity', happiness: 'Happiness'
  };

  Object.entries(mapping).forEach(([key, id]) => {
    document.getElementById(`stat${id}`).textContent = stats[key];
    document.getElementById(`bar${id}`).style.width = `${stats[key]}%`;
  });
}

function updateMealButtons() {
  Object.keys(MEAL_LABELS).forEach(meal => {
    const btn = document.querySelector(`.meal-btn[data-meal="${meal}"]`);
    const status = document.getElementById(`mealStatus-${meal}`);
    const recorded = !!gameState.meals[meal];

    btn.classList.toggle('recorded', recorded);
    status.textContent = recorded ? `${gameState.meals[meal].length}개 기록` : '미기록';
  });
}

function updateNutritionPanel() {
  const n = gameState.dailyNutrition;
  document.getElementById('nutProtein').textContent = n.protein;
  document.getElementById('nutVitamin').textContent = n.vitamin;
  document.getElementById('nutCalcium').textContent = n.calcium;
  document.getElementById('nutFiber').textContent = n.fiber;
  document.getElementById('nutSodium').textContent = n.sodium;
  document.getElementById('nutSugar').textContent = n.sugar;
  document.getElementById('nutFat').textContent = n.fat;

  const good = n.protein + n.vitamin + n.calcium + n.fiber;
  const bad = n.sodium + n.sugar + n.fat;
  const score = good - bad;

  const scoreEl = document.getElementById('healthScoreValue');
  if (Object.keys(gameState.meals).length === 0) {
    scoreEl.textContent = '-';
    scoreEl.className = 'health-score__value';
  } else if (score >= 15) {
    scoreEl.textContent = '건강 💚';
    scoreEl.className = 'health-score__value score--good';
  } else if (score >= 5) {
    scoreEl.textContent = '보통 💛';
    scoreEl.className = 'health-score__value score--normal';
  } else {
    scoreEl.textContent = '주의 ❤️';
    scoreEl.className = 'health-score__value score--bad';
  }
}

function updateBossUI() {
  const boss = gameState.currentBoss;
  if (!boss) return;

  document.getElementById('bossIcon').textContent = boss.icon;
  document.getElementById('bossName').textContent = boss.name;
  document.getElementById('bossDesc').textContent = boss.desc;

  const progress = Math.min(gameState.weeklyMissionsCompleted, boss.requiredMissions);
  const pct = (progress / boss.requiredMissions) * 100;
  document.getElementById('bossProgress').style.width = `${pct}%`;
  document.getElementById('bossProgressText').textContent =
    gameState.bossDefeatedThisWeek
      ? '보스 처치 완료! 🎉'
      : `${progress} / ${boss.requiredMissions} 미션`;

  document.getElementById('bossCard').classList.toggle('defeated', gameState.bossDefeatedThisWeek);
}

/** 달력 렌더링 */
function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';

  document.getElementById('calMonthYear').textContent =
    `${calendarYear}년 ${calendarMonth + 1}월`;

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  dayNames.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-header';
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const today = getTodayKey();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day cal-day--empty';
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = day;

    if (dateKey === today) el.classList.add('cal-day--today');

    const grade = gameState.healthCalendar[dateKey];
    if (grade) el.classList.add(`cal-day--${grade}`);

    grid.appendChild(el);
  }
}

/** 식사 로그 렌더링 */
function renderMealLog() {
  const list = document.getElementById('mealLogList');
  list.innerHTML = '';

  Object.entries(MEAL_LABELS).forEach(([key, info]) => {
    const foods = gameState.meals[key];
    const item = document.createElement('div');
    item.className = 'meal-log-item glass card';

    item.innerHTML = `
      <div class="meal-log-item__icon"><i class="fa-solid ${info.icon}"></i></div>
      <div class="meal-log-item__info">
        <h4>${info.label}</h4>
        <p>${foods ? foods.join(', ') : '아직 기록 없음'}</p>
      </div>
      <button class="btn btn--primary ripple meal-log-btn" data-meal="${key}" style="flex:0;padding:8px 14px;font-size:0.8rem;">
        ${foods ? '수정' : '기록'}
      </button>
    `;

    item.querySelector('.meal-log-btn').addEventListener('click', () => openMealModal(key));
    list.appendChild(item);
  });
}

/** 미션 렌더링 */
function renderMissions() {
  const list = document.getElementById('missionList');
  list.innerHTML = '';

  gameState.dailyMissions.forEach(missionId => {
    const mission = MISSION_POOL.find(m => m.id === missionId);
    if (!mission) return;

    const done = !!gameState.missionProgress[missionId];
    const item = document.createElement('div');
    item.className = `mission-item glass card ${done ? 'completed' : ''}`;

    item.innerHTML = `
      <div class="mission-checkbox ${done ? 'checked' : ''}" data-mission="${missionId}">
        ${done ? '<i class="fa-solid fa-check"></i>' : ''}
      </div>
      <div class="mission-info">
        <h4>${mission.title}</h4>
        <p>${mission.desc}</p>
      </div>
      <div class="mission-reward">
        <span class="coin"><i class="fa-solid fa-coins"></i> ${mission.coin}</span>
        <span class="exp"><i class="fa-solid fa-star"></i> ${mission.exp} EXP</span>
      </div>
    `;

    if (!done && mission.check === 'manual') {
      item.querySelector('.mission-checkbox').addEventListener('click', () => {
        completeMission(missionId, true);
      });
    }

    list.appendChild(item);
  });
}

/** 인벤토리 렌더링 */
function renderInventory() {
  const badgeGrid = document.getElementById('badgeGrid');
  badgeGrid.innerHTML = '';

  ACHIEVEMENTS.forEach(ach => {
    const unlocked = gameState.achievements.includes(ach.id);
    const item = document.createElement('div');
    item.className = `badge-item glass ${unlocked ? '' : 'locked'}`;
    item.innerHTML = `
      <div class="badge-item__icon">${ach.icon}</div>
      <div class="badge-item__name">${ach.name}</div>
    `;
    badgeGrid.appendChild(item);
  });

  const titleList = document.getElementById('titleList');
  titleList.innerHTML = '';

  TITLES.forEach(title => {
    const unlocked = gameState.titles.includes(title.id);
    const item = document.createElement('div');
    item.className = `title-item glass ${unlocked ? '' : 'locked'} ${gameState.equippedTitle === title.id ? 'equipped' : ''}`;
    item.innerHTML = `
      <div class="title-item__icon">${title.icon}</div>
      <div class="title-item__info">
        <h4>${title.name}</h4>
        <p>Lv.${title.unlockLevel} 해금</p>
      </div>
    `;
    if (unlocked) {
      item.addEventListener('click', () => {
        gameState.equippedTitle = title.id;
        saveState();
        renderInventory();
      });
    }
    titleList.appendChild(item);
  });

  const skinGrid = document.getElementById('skinGrid');
  skinGrid.innerHTML = '';

  SKINS.forEach(skin => {
    const unlocked = gameState.skins.includes(skin.id);
    const item = document.createElement('div');
    item.className = `skin-item glass ${unlocked ? '' : 'locked'} ${gameState.equippedSkin === skin.id ? 'equipped' : ''}`;
    item.innerHTML = `
      <div class="skin-item__preview">${skin.icon}</div>
      <div class="skin-item__name">${skin.name}</div>
    `;
    if (unlocked) {
      item.addEventListener('click', () => {
        gameState.equippedSkin = skin.id;
        saveState();
        renderInventory();
      });
    }
    skinGrid.appendChild(item);
  });
}

/** 랭킹 렌더링 */
function renderRanking() {
  const list = document.getElementById('rankingList');
  list.innerHTML = '';

  const allPlayers = [
    ...RANKING_DATA,
    { name: gameState.nickname, level: gameState.level, isMe: true }
  ].sort((a, b) => b.level - a.level);

  allPlayers.forEach((player, i) => {
    const item = document.createElement('div');
    item.className = 'rank-item glass card';
    item.innerHTML = `
      <div class="rank-item__position">${i + 1}</div>
      <div class="rank-item__name">${player.name}${player.isMe ? ' (나)' : ''}</div>
      <div class="rank-item__level">Lv.${player.level}</div>
    `;
    list.appendChild(item);

    if (player.isMe) {
      document.getElementById('myRankPosition').textContent = `#${i + 1}`;
      document.getElementById('myRankLevel').textContent = `Lv.${player.level}`;
    }
  });
}

/* ============================================================
   모달 & UI 이벤트
   ============================================================ */

function openMealModal(mealType) {
  currentMealType = mealType;
  const info = MEAL_LABELS[mealType];

  document.getElementById('mealModalTitle').innerHTML =
    `<i class="fa-solid ${info.icon}"></i> ${info.label} 식사`;

  const checklist = document.getElementById('foodChecklist');
  checklist.innerHTML = '';

  const currentFoods = gameState.meals[mealType] || [];

  Object.keys(FOOD_DB).forEach(foodName => {
    const item = document.createElement('label');
    item.className = `food-check-item ${currentFoods.includes(foodName) ? 'selected' : ''}`;
    item.innerHTML = `
      <input type="checkbox" value="${foodName}" ${currentFoods.includes(foodName) ? 'checked' : ''}>
      <span class="check-icon"><i class="fa-solid fa-check"></i></span>
      ${foodName}
    `;

    item.addEventListener('click', (e) => {
      e.preventDefault();
      item.classList.toggle('selected');
      const input = item.querySelector('input');
      input.checked = !input.checked;
    });

    checklist.appendChild(item);
  });

  document.getElementById('mealModal').classList.add('active');
}

function closeMealModal() {
  document.getElementById('mealModal').classList.remove('active');
  currentMealType = null;
}

function saveMealRecord() {
  if (!currentMealType) return;

  const selected = [];
  document.querySelectorAll('#foodChecklist input:checked').forEach(input => {
    selected.push(input.value);
  });

  if (selected.length === 0) {
    showToast('음식을 하나 이상 선택해주세요!', 'fa-exclamation-circle');
    return;
  }

  recordMeal(currentMealType, selected);
  closeMealModal();
  showToast(`${MEAL_LABELS[currentMealType].label} 식사 기록 완료!`, 'fa-utensils');
}

function showLevelUpModal(level, evolutionName) {
  document.getElementById('levelUpText').textContent = `Lv.${level} 달성!`;
  document.getElementById('evolutionText').textContent =
    evolutionName ? `🎉 ${evolutionName}(으)로 진화했어요!` : '';

  createCelebrationParticles();
  document.getElementById('levelUpModal').classList.add('active');
}

function createCelebrationParticles() {
  const container = document.getElementById('celebrationParticles');
  container.innerHTML = '';
  const colors = ['#FFD54F', '#4CAF50', '#FF7043', '#42A5F5', '#AB47BC'];

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 30}%`;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDelay = `${Math.random() * 0.5}s`;
    container.appendChild(p);
  }
}

function showToast(message, icon = 'fa-star') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast glass';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ============================================================
   이벤트 리스너 등록
   ============================================================ */

function initEventListeners() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  document.querySelectorAll('.meal-btn').forEach(btn => {
    btn.addEventListener('click', () => openMealModal(btn.dataset.meal));
  });

  document.getElementById('mealModalClose').addEventListener('click', closeMealModal);
  document.getElementById('mealModalCancel').addEventListener('click', closeMealModal);
  document.getElementById('mealModalSave').addEventListener('click', saveMealRecord);

  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('nicknameInput').value = gameState.nickname;
    document.getElementById('soundToggle').checked = gameState.soundEnabled;
    document.getElementById('settingsModal').classList.add('active');
  });

  document.getElementById('settingsModalClose').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('active');
  });

  document.getElementById('nicknameInput').addEventListener('change', (e) => {
    gameState.nickname = e.target.value || '나';
    saveState();
    renderRanking();
  });

  document.getElementById('soundToggle').addEventListener('change', (e) => {
    gameState.soundEnabled = e.target.checked;
    saveState();
  });

  document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('정말 모든 데이터를 초기화할까요?')) {
      localStorage.removeItem('nutriquest_save');
      gameState = createDefaultState();
      checkDailyReset();
      saveState();
      updateUI();
      document.getElementById('settingsModal').classList.remove('active');
      showToast('데이터가 초기화되었습니다.', 'fa-trash');
    }
  });

  document.getElementById('levelUpClose').addEventListener('click', () => {
    document.getElementById('levelUpModal').classList.remove('active');
  });

  document.getElementById('calPrev').addEventListener('click', () => {
    calendarMonth--;
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    renderCalendar();
  });

  document.getElementById('calNext').addEventListener('click', () => {
    calendarMonth++;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    renderCalendar();
  });

  document.querySelectorAll('.inv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.inventory-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`inv-${tab.dataset.inv}`).classList.add('active');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });
}

/* ============================================================
   앱 초기화
   ============================================================ */

function init() {
  checkDailyReset();
  initEventListeners();
  updateUI();
  console.log('🐤 NutriQuest 시작! 즐거운 식습관 관리 되세요!');
}

document.addEventListener('DOMContentLoaded', init);
