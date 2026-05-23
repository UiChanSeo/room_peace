export type DecorCategory = 'floor' | 'lighting' | 'plant' | 'petFurniture' | 'wall';
export type DecorRarity = 'common' | 'rare' | 'legendary';

export interface DecorItem {
  id: string;
  name: string;
  category: DecorCategory;
  rarity: DecorRarity;
  price: number; // 0 if unlock only
  unlockCondition?: string | null;
  modelPath: string; // path or "primitive:xxx"
  emotionalEffect: string;
  emoji: string;
  desc: string;
}

export const decorItemsList: DecorItem[] = [
  // FLOOR
  {
    id: "cozy-rug",
    name: "포근한 러그",
    category: "floor",
    rarity: "common",
    price: 200,
    unlockCondition: null,
    modelPath: "primitive:rug", // Render as flat plane
    emotionalEffect: "pets rest more often",
    emoji: "🧶",
    desc: "바닥에 깔면 집안이 한결 아늑해지는 따뜻한 러그입니다."
  },
  {
    id: "cloud-mat",
    name: "말랑 구름 매트",
    category: "floor",
    rarity: "rare",
    price: 450,
    unlockCondition: "연속 평화 7일",
    modelPath: "primitive:rug-cloud", // Render as rounded flat mesh
    emotionalEffect: "softer ambience",
    emoji: "☁️",
    desc: "마치 솜사탕을 밟는 것처럼 푹신푹신한 구름 모양 매트입니다."
  },

  // LIGHTING
  {
    id: "sunset-lamp",
    name: "노을 무드등",
    category: "lighting",
    rarity: "rare",
    price: 0,
    unlockCondition: "연속 평화 14일",
    modelPath: "primitive:lamp-sunset",
    emotionalEffect: "calmer pet behavior, warmer light",
    emoji: "🌇",
    desc: "방 전체를 따스한 주황빛으로 물들여 마음을 편안하게 해줍니다."
  },
  {
    id: "warm-stand",
    name: "따뜻한 스탠드 조명",
    category: "lighting",
    rarity: "common",
    price: 300,
    unlockCondition: null,
    modelPath: "primitive:lamp-stand",
    emotionalEffect: "brightens room slightly",
    emoji: "💡",
    desc: "따뜻한 색온도로 방구석을 밝혀주는 우드 스탠드입니다."
  },

  // PLANTS
  {
    id: "plant-monstera",
    name: "몬스테라 화분",
    category: "plant",
    rarity: "common",
    price: 250,
    unlockCondition: null,
    modelPath: "primitive:plant-monstera",
    emotionalEffect: "happier idle dialogue",
    emoji: "🪴",
    desc: "넓은 잎사귀가 방에 생기를 불어넣는 깔끔한 식물 화분입니다."
  },
  {
    id: "plant-cactus",
    name: "작은 선인장",
    category: "plant",
    rarity: "rare",
    price: 500,
    unlockCondition: null,
    modelPath: "primitive:plant-cactus",
    emotionalEffect: "adds tiny detail",
    emoji: "🌵",
    desc: "작지만 강인한 매력이 있는 미니 선인장입니다."
  },

  // PET FURNITURE
  {
    id: "pet-cushion",
    name: "폭신 펫 쿠션",
    category: "petFurniture",
    rarity: "common",
    price: 300,
    unlockCondition: null,
    modelPath: "primitive:cushion",
    emotionalEffect: "pets sleep on it",
    emoji: "🛋️",
    desc: "펫이 위에 엎드려서 개꿀잠을 잘 수 있는 전용 마약 쿠션입니다."
  },
  {
    id: "pet-toy-basket",
    name: "장난감 바구니",
    category: "petFurniture",
    rarity: "common",
    price: 150,
    unlockCondition: null,
    modelPath: "primitive:toy-basket",
    emotionalEffect: "pets interact",
    emoji: "🎾",
    desc: "펫들이 심심할 때 물고 노는 장난감들이 담긴 바구니입니다."
  },
  {
    id: "pet-hideout",
    name: "작은 숨숨집",
    category: "petFurniture",
    rarity: "rare",
    price: 600,
    unlockCondition: "연속 평화 10일",
    modelPath: "primitive:hideout",
    emotionalEffect: "pets hide inside when stressed",
    emoji: "⛺",
    desc: "스트레스를 받을 때 쏙 들어가서 숨을 수 있는 아늑한 공간입니다."
  },

  // WALL
  {
    id: "wall-poster",
    name: "감성 포스터",
    category: "wall",
    rarity: "common",
    price: 200,
    unlockCondition: null,
    modelPath: "primitive:poster",
    emotionalEffect: "visual cozy",
    emoji: "🖼️",
    desc: "허전한 벽을 채워주는 감각적인 디자인의 포스터입니다."
  },
  {
    id: "wall-peace-frame",
    name: "평화 기록 액자",
    category: "wall",
    rarity: "legendary",
    price: 0,
    unlockCondition: "평화 카드 30개 수신",
    modelPath: "primitive:frame-peace",
    emotionalEffect: "massive mood boost",
    emoji: "📸",
    desc: "우리 집의 소중한 평화로운 순간들을 기록해둔 특별한 액자입니다."
  }
];
