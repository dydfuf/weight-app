import type { BodyPart, MuscleTarget, Equipment } from "./types";

function normalizeKo(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "");
}

export function containsKorean(text: string): boolean {
  // Hangul syllables + jamo (including choseong-only queries like "ㅂㅊㅍㄹㅅ")
  return /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(text);
}

/**
 * English search usually needs >=2 chars, but Korean can be meaningful with 1 syllable
 * (e.g. "등", "가슴", "팔").
 */
export function isSearchQueryReady(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return containsKorean(t) ? t.length >= 1 : t.length >= 2;
}

const CHOSEONG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

const CHOSEONG_SET = new Set<string>(CHOSEONG);

function toChoseong(text: string): string {
  // Convert Hangul syllables to initial consonants; keep choseong jamo as-is.
  const s = text.replace(/\s+/g, "");
  let out = "";
  for (const ch of s) {
    if (CHOSEONG_SET.has(ch)) {
      out += ch;
      continue;
    }
    const code = ch.codePointAt(0);
    if (!code) continue;
    // Hangul syllables range
    if (code >= 0xac00 && code <= 0xd7a3) {
      const idx = Math.floor((code - 0xac00) / 588);
      out += CHOSEONG[idx] ?? "";
    }
  }
  return out;
}

function isChoseongQuery(text: string): boolean {
  const s = text.trim().replace(/\s+/g, "");
  if (!s) return false;
  for (const ch of s) {
    if (!CHOSEONG_SET.has(ch)) return false;
  }
  return true;
}

const KO_BODY_PART: Array<{ ko: string[]; bodyPart: BodyPart }> = [
  { ko: ["등"], bodyPart: "back" },
  { ko: ["가슴"], bodyPart: "chest" },
  { ko: ["어깨"], bodyPart: "shoulders" },
  { ko: ["팔", "상완"], bodyPart: "upper arms" },
  { ko: ["전완", "팔뚝"], bodyPart: "lower arms" },
  { ko: ["허벅지", "대퇴"], bodyPart: "upper legs" },
  { ko: ["종아리"], bodyPart: "lower legs" },
  { ko: ["복부", "코어"], bodyPart: "waist" },
  { ko: ["목"], bodyPart: "neck" },
  { ko: ["유산소"], bodyPart: "cardio" },
];

const KO_TARGET: Array<{ ko: string[]; target: MuscleTarget }> = [
  { ko: ["가슴", "대흉근"], target: "pectorals" },
  { ko: ["이두", "이두근"], target: "biceps" },
  { ko: ["삼두", "삼두근"], target: "triceps" },
  { ko: ["어깨", "삼각근"], target: "delts" },
  { ko: ["복근", "코어"], target: "abs" },
  { ko: ["광배", "광배근"], target: "lats" },
  { ko: ["승모", "승모근"], target: "traps" },
  { ko: ["햄스트링"], target: "hamstrings" },
  { ko: ["둔근", "엉덩이"], target: "glutes" },
  { ko: ["종아리", "카프", "비복근"], target: "calves" },
  { ko: ["전완"], target: "forearms" },
  { ko: ["대퇴사두", "쿼드"], target: "quads" },
  { ko: ["내전근"], target: "adductors" },
  { ko: ["외전근"], target: "abductors" },
];

const KO_EQUIPMENT: Array<{ ko: string[]; equipment: Equipment }> = [
  { ko: ["덤벨"], equipment: "dumbbell" },
  { ko: ["바벨"], equipment: "barbell" },
  { ko: ["케이블"], equipment: "cable" },
  { ko: ["맨몸"], equipment: "body weight" },
  { ko: ["스미스", "스미스머신"], equipment: "smith machine" },
  { ko: ["케틀벨"], equipment: "kettlebell" },
  { ko: ["밴드"], equipment: "band" },
];

const KO_EXERCISE_NAME: Array<{ ko: string[]; en: string }> = [
  // Big 3 & presses
  { ko: ["벤치프레스", "벤치 프레스", "벤치"], en: "bench press" },
  { ko: ["인클라인벤치프레스", "인클라인 벤치프레스", "인클벤", "인클라인벤치"], en: "incline bench press" },
  { ko: ["디클라인벤치프레스", "디클라인 벤치프레스", "디클벤"], en: "decline bench press" },
  { ko: ["덤벨벤치프레스", "덤벨 벤치프레스", "덤벨벤치", "덤벤"], en: "dumbbell bench press" },
  { ko: ["스쿼트"], en: "squat" },
  { ko: ["프론트스쿼트", "프론트 스쿼트"], en: "front squat" },
  { ko: ["고블렛스쿼트", "고블렛 스쿼트"], en: "goblet squat" },
  { ko: ["해크스쿼트", "해크 스쿼트"], en: "hack squat" },
  { ko: ["불가리안스플릿스쿼트", "불가리안 스플릿 스쿼트", "불스", "불스스", "불가리안스쿼트"], en: "bulgarian split squat" },
  { ko: ["데드리프트", "데드 리프트"], en: "deadlift" },
  { ko: ["루마니안데드리프트", "루마니안 데드리프트", "루마데", "RDL"], en: "romanian deadlift" },
  { ko: ["스티프데드리프트", "스티프 데드리프트", "스티프레그데드리프트"], en: "stiff leg deadlift" },
  { ko: ["스모데드리프트", "스모 데드리프트", "스모데드"], en: "sumo deadlift" },
  { ko: ["트랩바데드리프트", "트랩바 데드리프트", "트랩바데드"], en: "trap bar deadlift" },
  { ko: ["오버헤드프레스", "오버헤드 프레스", "밀리터리프레스", "밀프", "OHP"], en: "overhead press" },
  { ko: ["숄더프레스", "숄더 프레스", "덤벨숄더프레스", "덤벨 숄더프레스"], en: "shoulder press" },

  // Back: pulls/rows
  { ko: ["랫풀다운", "랫 풀다운", "렛풀다운", "렛 풀다운", "랫풀", "렛풀"], en: "lat pulldown" },
  { ko: ["시티드로우", "시티드 로우", "케이블로우", "케이블 로우"], en: "seated cable row" },
  { ko: ["바벨로우", "바벨 로우", "벤트오버로우", "벤트 오버 로우", "벤트로우"], en: "bent over row" },
  { ko: ["덤벨로우", "덤벨 로우", "원암덤벨로우", "원암 덤벨 로우"], en: "dumbbell row" },
  { ko: ["티바로우", "티바 로우", "T바로우", "T바 로우"], en: "t bar row" },
  { ko: ["페이스풀", "페이스 풀"], en: "face pull" },
  { ko: ["풀업", "풀 업", "턱걸이"], en: "pull up" },
  { ko: ["친업", "친 업"], en: "chin up" },

  // Chest: fly/press machines
  { ko: ["체스트프레스", "체스트 프레스", "머신벤치프레스", "머신 벤치프레스"], en: "chest press" },
  { ko: ["덤벨플라이", "덤벨 플라이", "플라이"], en: "dumbbell fly" },
  { ko: ["케이블플라이", "케이블 플라이", "케플", "케이블크로스오버", "크로스오버"], en: "cable fly" },
  { ko: ["펙덱", "팩덱", "펙덱플라이", "펙덱 플라이", "팩덱 플라이"], en: "pec deck" },
  { ko: ["딥스", "가슴딥스"], en: "dip" },

  // Shoulders: raises
  { ko: ["사이드레터럴레이즈", "사이드 레터럴 레이즈", "레터럴레이즈", "레터럴 레이즈", "사레레"], en: "lateral raise" },
  { ko: ["프론트레이즈", "프론트 레이즈"], en: "front raise" },
  { ko: ["리어델트플라이", "리어델트 플라이", "리어델트", "리어"], en: "rear delt fly" },

  // Arms: biceps/triceps
  { ko: ["바이셉컬", "바이셉 컬", "이두컬", "이두 컬", "덤벨컬", "덤벨 컬"], en: "biceps curl" },
  { ko: ["해머컬", "해머 컬"], en: "hammer curl" },
  { ko: ["프리처컬", "프리처 컬"], en: "preacher curl" },
  { ko: ["케이블컬", "케이블 컬"], en: "cable curl" },
  { ko: ["트라이셉푸쉬다운", "트라이셉 푸쉬다운", "푸쉬다운", "푸시다운"], en: "triceps pushdown" },
  { ko: ["스컬크러셔", "스컬 크러셔", "라잉트라이셉익스텐션"], en: "skull crusher" },
  { ko: ["오버헤드트라이셉익스텐션", "오버헤드 트라이셉 익스텐션", "오버헤드삼두익스텐션"], en: "overhead triceps extension" },

  // Legs
  { ko: ["레그프레스", "레그 프레스", "레그프", "레그프레스머신"], en: "leg press" },
  { ko: ["레그익스텐션", "레그 익스텐션", "레그익", "레익"], en: "leg extension" },
  { ko: ["레그컬", "레그 컬", "라잉레그컬", "라잉 레그 컬", "시티드레그컬", "시티드 레그 컬"], en: "leg curl" },
  { ko: ["힙쓰러스트", "힙 쓰러스트"], en: "hip thrust" },
  { ko: ["글루트브릿지", "글루트 브릿지"], en: "glute bridge" },
  { ko: ["런지"], en: "lunge" },
  { ko: ["스텝업", "스텝 업"], en: "step up" },
  { ko: ["카프레이즈", "카프 레이즈", "종아리"], en: "calf raise" },
  { ko: ["힙어브덕션", "힙 어브덕션", "힙외전", "외전"], en: "hip abduction" },
  { ko: ["힙어덕션", "힙 어덕션", "힙내전", "내전"], en: "hip adduction" },

  // Core
  { ko: ["플랭크"], en: "plank" },
  { ko: ["크런치"], en: "crunch" },
  { ko: ["싯업", "싯 업", "윗몸일으키기"], en: "sit up" },
  { ko: ["레그레이즈", "레그 레이즈"], en: "leg raise" },
  { ko: ["러시안트위스트", "러시안 트위스트"], en: "russian twist" },
];

export type InterpretedSearch = {
  bodyPart?: BodyPart;
  target?: MuscleTarget;
  equipment?: Equipment;
  /** English query suitable for name-based search */
  englishNameQuery?: string;
};

export function interpretSearchQuery(search: string): InterpretedSearch {
  const raw = search.trim();
  if (!raw) return {};

  // Only interpret Korean inputs; leave English as name search
  if (!containsKorean(raw)) {
    return { englishNameQuery: raw };
  }

  // Choseong-only query (e.g. "ㅂㅊㅍㄹㅅ") -> match known Korean aliases and map to EN/filters
  if (isChoseongQuery(raw)) {
    const q = raw.trim().replace(/\s+/g, "");

    for (const entry of KO_BODY_PART) {
      for (const ko of entry.ko) {
        if (toChoseong(ko).startsWith(q)) return { bodyPart: entry.bodyPart };
      }
    }
    for (const entry of KO_TARGET) {
      for (const ko of entry.ko) {
        if (toChoseong(ko).startsWith(q)) return { target: entry.target };
      }
    }
    for (const entry of KO_EQUIPMENT) {
      for (const ko of entry.ko) {
        if (toChoseong(ko).startsWith(q)) return { equipment: entry.equipment };
      }
    }
    for (const entry of KO_EXERCISE_NAME) {
      for (const ko of entry.ko) {
        if (toChoseong(ko).startsWith(q)) return { englishNameQuery: entry.en };
      }
    }
    return {};
  }

  const n = normalizeKo(raw);

  for (const entry of KO_BODY_PART) {
    for (const ko of entry.ko) {
      if (n.includes(normalizeKo(ko))) return { bodyPart: entry.bodyPart };
    }
  }

  for (const entry of KO_TARGET) {
    for (const ko of entry.ko) {
      if (n.includes(normalizeKo(ko))) return { target: entry.target };
    }
  }

  for (const entry of KO_EQUIPMENT) {
    for (const ko of entry.ko) {
      if (n.includes(normalizeKo(ko))) return { equipment: entry.equipment };
    }
  }

  for (const entry of KO_EXERCISE_NAME) {
    for (const ko of entry.ko) {
      if (n.includes(normalizeKo(ko))) return { englishNameQuery: entry.en };
    }
  }

  // No mapping found: keep raw as-is (will still work for cached English matches)
  return { englishNameQuery: raw };
}

export function getSearchNeedles(search: string): string[] {
  const raw = search.trim();
  if (!raw) return [];

  const needles = new Set<string>();
  needles.add(raw.toLowerCase());

  const interpreted = interpretSearchQuery(raw);
  if (interpreted.englishNameQuery) needles.add(interpreted.englishNameQuery.toLowerCase());
  if (interpreted.bodyPart) needles.add(interpreted.bodyPart.toLowerCase());
  if (interpreted.target) needles.add(interpreted.target.toLowerCase());
  if (interpreted.equipment) needles.add(interpreted.equipment.toLowerCase());

  return Array.from(needles).filter((n) => n.length > 0);
}


