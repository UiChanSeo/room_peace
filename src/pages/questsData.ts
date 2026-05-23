export interface QuestTemplate {
  id: string;
  title: string;
  desc: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;       // Berry reward
  contribution: number; // House contribution
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  // Easy (쉬움) - 5 Berry / +1 contribution
  { id: 'q1', title: '휴지 리필하기 🧻', desc: '공용 화장실에 다 쓴 휴지 심을 버리고 새로운 휴지를 걸어둡니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q2', title: '물티슈 꽉 채우기 💦', desc: '거실 식탁 위 물티슈가 떨어졌다면 새 팩을 뜯어서 꺼내둡니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q3', title: '젖은 수건 수거하기 🧺', desc: '의자나 문고리에 걸린 축축한 수건들을 빨래 바구니에 모읍니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q4', title: '세면대 물기 닦기 🧼', desc: '사용 후 흥건해진 세면대 주변 물기를 마른 닦개로 가볍게 훔칩니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q5', title: '우리방 환기시키기 🌬️', desc: '아침이나 환기가 필요할 때 거실 창문을 10분간 열어 바람을 통하게 합니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q6', title: '택배 상자 해체하기 📦', desc: '도착한 공용/개인 택배 박스의 테이프와 송장을 뜯고 접어둡니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q7', title: '공용 우편함 비우기 📬', desc: '1층 우편함에서 우리 방으로 온 고지서나 우편물을 챙겨 올라옵니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q8', title: '현관 신발 정돈하기 👟', desc: '입구에 어지럽게 널려 있는 메이트들의 신발을 나란히 정리해둡니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q9', title: '공용 테이블 소독하기 ✨', desc: '거실 테이블에 소독 스프레이를 뿌리고 마른 키친타월로 가볍게 닦습니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q10', title: '소파 담요 개어두기 🛋️', desc: '거실 소파 위에서 뒹굴던 담요와 쿠션을 단정하게 정리해둡니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q11', title: '반려 식물 물 주기 🪴', desc: '방 안 화분 흙이 말랐을 때 가볍게 분무하거나 물을 줍니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q12', title: '외출 전 전체 소등하기 💡', desc: '마지막으로 외출하거나 잘 때 켜져 있는 방등과 거실등을 모두 끕니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q13', title: '우산 빗물 털어 말리기 ☔', desc: '비 오는 날 메이트들이 쓰고 온 젖은 우산들을 현관에 펼쳐 말립니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q14', title: '정수기 물 받침대 비우기 💧', desc: '정수기 아래 고인 물받이를 빼내서 싱크대에 비우고 가볍게 헹겁니다.', difficulty: 'easy', points: 5, contribution: 1 },
  { id: 'q15', title: '공용 펜/포스트잇 정리 ✏️', desc: '거실 메모판 앞에 널려 있는 볼펜과 포스트잇을 꽂이에 넣어둡니다.', difficulty: 'easy', points: 5, contribution: 1 },

  // Medium (보통) - 15 Berry / +3 contribution
  { id: 'q16', title: '싱크대 설거지 완수 🍽️', desc: '먹고 쌓인 그릇들을 방치하지 않고 깨끗이 설거지해 건조대에 올립니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q17', title: '분리수거 박스 정리 🧴', desc: '캔, 플라스틱, 비닐 등이 섞이지 않게 가볍게 눌러 분류 상자에 담습니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q18', title: '배달 용기 세척하기 🍜', desc: '배달 음식물을 따로 비우고 플라스틱 용기를 맑은 물로 깨끗이 헹굽니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q19', title: '냉장고 오래된 음식 버리기 🍎', desc: '상했거나 유통기한이 지난 냉장고 안 반찬이나 음식을 골라 비웁니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q20', title: '세탁기 빨래 돌리기 🧺', desc: '공용 빨래통에 모인 세탁물을 세탁기에 넣고 세제를 넣어 작동시킵니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q21', title: '건조기 먼지망 비우기 🌬️', desc: '건조기 가동 후 필터에 하얗게 쌓인 섬유 먼지망을 깨끗하게 긁어냅니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q22', title: '완료된 빨래 건조대에 널기 👕', desc: '탈수가 끝난 빨래들을 털어서 건조대나 옷걸이에 차곡차곡 넙니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q23', title: '거실 바닥 청소기 돌리기 🧹', desc: '거실과 공용 복도 바닥에 흩어진 머리카락과 먼지를 청소기로 흡입합니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q24', title: '바닥 밀대걸레질하기 🧽', desc: '청소기로 먼지를 뺀 후 정전기 유도포나 물걸레 밀대로 바닥을 닦습니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q25', title: '식사 전후 식탁 닦기 🧼', desc: '밥을 먹기 전과 먹은 후에 공용 식탁을 알코올이나 물티슈로 꼼꼼히 쓸어냅니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q26', title: '전자레인지 내부 청소 🧲', desc: '음식물이 튀어 지저분해진 전자레인지 안쪽을 젖은 행주로 불려 닦아냅니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q27', title: '공용 물병에 생수 채우기 💧', desc: '마시고 빈 공용 물병들을 씻어 정수기나 보틀에 물을 채워 냉장고에 둡니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q28', title: '샤워실 거울 얼룩 닦기 🧼', desc: '물때와 김서림으로 얼룩덜룩해진 욕실 유리 거울을 물걸레로 광냅니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q29', title: '토스터기 빵부스러기 털기 🍞', desc: '식빵을 굽고 아래 받침대에 쌓인 탄 부스러기들을 쓰레기통에 털어냅니다.', difficulty: 'medium', points: 15, contribution: 3 },
  { id: 'q30', title: '싱크대 배수구 세척 🚿', desc: '배수구 틈새에 낀 물때와 찌꺼기들을 솔을 이용해 가볍게 문질러 세척합니다.', difficulty: 'medium', points: 15, contribution: 3 },

  // Hard (어려움) - 40 Berry / +8 contribution
  { id: 'q31', title: '화장실 물청소 & 변기 솔질 🚽', desc: '바닥 세제를 뿌려 타일을 닦고, 변기 안쪽을 솔로 문지른 뒤 시원하게 물청소합니다.', difficulty: 'hard', points: 40, contribution: 8 },
  { id: 'q32', title: '음식물 쓰레기통 비우기 🤢', desc: '주방 싱크대에 꽉 찬 노란색 음식물 쓰레기통을 들고 나가 외부 수거함에 비우고 씻어둡니다.', difficulty: 'hard', points: 40, contribution: 8 },
  { id: 'q33', title: '종량제 봉투 배출 🗑️', desc: '거실 쓰레기통 종량제 봉투 입구를 단단히 묶어 외부 쓰레기장에 배출합니다.', difficulty: 'hard', points: 40, contribution: 8 },
  { id: 'q34', title: '가스레인지 후드 찌든 때 청소 🍳', desc: '기름때로 끈적해진 후드 필터와 상판 주변을 세정제로 싹 닦아냅니다.', difficulty: 'hard', points: 40, contribution: 8 },
  { id: 'q35', title: '분리수거장 외부 배출 📦', desc: '모인 분리수거 박스들과 대형 택배 박스들을 수거장에 배출합니다.', difficulty: 'hard', points: 40, contribution: 8 },
  { id: 'q36', title: '냉장고 선반 물걸레 대청소 🧊', desc: '선반 내부의 소스 자국과 김치 얼룩 자국을 젖은 걸레로 깨끗이 닦아냅니다.', difficulty: 'hard', points: 40, contribution: 8 },
  { id: 'q37', title: '욕실 하수구 머리카락 정리 🚿', desc: '배수구를 열어 물 흐름을 막고 있는 머리카락 뭉치와 잔여물을 청소합니다.', difficulty: 'hard', points: 40, contribution: 8 },
  { id: 'q38', title: '이불 침구 털기 & 소독 ☀️', desc: '눅눅해진 이불과 베개를 먼지가 나게 털어 햇볕 아래 소독합니다.', difficulty: 'hard', points: 40, contribution: 8 },
  { id: 'q39', title: '거실 창틀 먼지 닦기 🪟', desc: '황사와 외부 매연 먼지로 더러워진 창틀 틈새를 싹 물청소해 냅니다.', difficulty: 'hard', points: 40, contribution: 8 },
  { id: 'q40', title: '현관 신발장 내부 먼지 청소 👟', desc: '신발들을 다 꺼낸 후 흙 먼지로 버석거리는 선반 구석구석을 쓸고 닦습니다.', difficulty: 'hard', points: 40, contribution: 8 }
];
