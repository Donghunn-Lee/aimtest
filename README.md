# 🎯 FPS Aim Test

> Canvas 기반 1인칭 FPS 에임 테스트 게임
> 
> 
> 빠른 입력·실시간 렌더링 환경에서
> 
> **시간, 상태, 렌더 루프를 어떻게 통제할 것인가**를 중심으로 설계한 개인 프로젝트


<div>
  <img width="300" height="69" alt="image" src="https://github.com/user-attachments/assets/376d5f94-9ce9-401c-8cd7-dd547e7ba265" />
  <img width="800" height="653" alt="image" src="https://github.com/user-attachments/assets/a527af51-cb56-423b-bba7-d0d62cae9cf5" />
</div>

---

> 🔗 [**Live Demo**](http://ec2-52-79-221-80.ap-northeast-2.compute.amazonaws.com/)
>
> 🎬 [**Gameplay Video**](https://vimeo.com/1159573198?share=copy&fl=sv&fe=ci) (sound on)
>
> (영상에 소리가 포함되어 있으니 시청시 볼륨을 조절해주세요!)

---

## 📌 Why This Project

이 프로젝트는 “에임 테스트 게임을 만들어보자”에서 출발하지 않았습니다.

목표는 명확했습니다.

> React 환경에서, 프레임 단위로 움직이는 시스템을
구조적으로 통제할 수 있는가?
> 

일반적인 웹 UI와 달리 이 게임은:

- 화면이 매 프레임 갱신되고
- 마우스 입력이 즉각적으로 반영되며
- 렌더링 성능과 구조 안정성이 동시에 요구됩니다

이 환경에서

**React의 선언적 상태 관리**와

**Canvas의 명령형 렌더링 루프**를

어떻게 분리하고, 어디서 다시 연결할지를 끝까지 고민했습니다.

---

## 🧠 Core Design Decisions (핵심 설계 판단)

### 1. 단일 rAF 렌더 루프로 시간축 통합

초기 구현에서는:

- 렌더링 → `requestAnimationFrame`
- 타겟 스폰 / 타이머 → `setInterval`

처럼 **서로 다른 시간축**이 공존하고 있었습니다.

겉보기엔 정상 동작했지만,

구조적으로는 다음 문제를 내포하고 있었습니다.

- 렌더링과 게임 로직이 다른 기준으로 흐름
- 스톨 / 타이밍 밀림 시 예측 불가능한 상태 발생 가능
- “언제 무엇이 실행되는가”를 한 눈에 파악하기 어려움

**해결**

모든 시간 제어를 **단일 rAF 루프 기준 누적 시간(accumulation)** 구조로 재설계했습니다.

- 프레임마다 `dt`를 누적
- 임계 시간 도달 시 스폰/로직 실행
- 렌더링과 게임 로직을 **같은 시간축**에서 처리

👉 결과적으로 구조적 안정성과 예측 가능성이 크게 향상되었습니다.

---

### 2. 렌더 루프 이원화 제거 (안티앨리어싱 문제 해결)

맵 렌더링과 타겟 렌더링을

각각의 `requestAnimationFrame` 루프로 분리했던 구조는

의도치 않은 문제를 만들었습니다.

- 동일한 Canvas Context를
- 서로 다른 루프가 비동기적으로 조작
- `save / restore / transform` 상태 스택 충돌
- 색상 변경 반복 시 **테두리 앨리어싱 누적**

이 문제는 단순한 그래픽 이슈가 아니라

**시간축이 분리된 두 루프가 하나의 컨텍스트를 공유한 구조적 문제**였습니다.

**해결**

- Canvas에는 **오직 하나의 렌더 루프만 존재**
- 모든 렌더링을 단일 파이프라인으로 통합
- 렌더 순서 명시:
    1. clear
    2. camera transform
    3. map
    4. targets
    5. floating score
    6. restore

👉 시각적 안정성과 렌더 파이프라인 가독성을 동시에 확보했습니다.

---

### 3. GameWorld를 God Component → Hub로 재정의

리팩토링 전 `GameWorld`는 약 **600라인**에 달하는 컴포넌트였습니다.

- 렌더링
- 입력 처리
- 게임 상태
- 타겟 관리
- 타이머 / 사이드 이펙트

모든 책임이 한 파일에 모여 있었고,

작은 수정도 다른 영역에 영향을 주기 쉬운 구조였습니다.

**방향 전환**

> GameWorld는 “모든 걸 처리하는 곳”이 아니라
> 
> 
> **각 책임을 가진 훅들을 연결하는 Hub**로만 존재한다.
> 
- 구체적인 로직 → 커스텀 훅으로 위임
- 컴포넌트는 결과를 연결(wiring)만 수행

결과:

- GameWorld: **587 → 323 lines**
- 구조 파악 속도 대폭 개선
- 변경 영향 범위 명확화

---

### 4. React State ↔ Canvas Ref 경계 명확화

이 프로젝트에서 가장 중요했던 기준입니다.

- **UI에 필요한 값** → React `state`
- **프레임 단위로 읽히는 값** → `useRef`
- 두 영역을 연결하는 **명시적인 동기화 지점**을 하나로 고정

이를 위해:

- 렌더 루프에서는 **state를 전혀 사용하지 않음**
- 모든 렌더링은 `ref + service injection` 기반
- 상태 동기화는 `useGameRuntime` 훅에서 중앙 관리

👉 “어디서 상태가 바뀌고, 누가 읽는지”가 항상 명확한 구조

---

## 🏗 Architecture Overview

```
React (UI State)
   ↓
useGame / useTargetManager
   ↓
useGameRuntime  ←── 상태 동기화 중앙화
   ↓
runtimeRef (shared)
   ↓
useCanvasRenderLoop (rAF Engine)
   ↓
Canvas Renderers

```

### 핵심 훅 역할

- **useCanvasRenderLoop**
    - 단일 rAF 루프 엔진
    - 시간 관리 + 카메라 제어
    - 실제 그리기는 services로 위임
- **useGameRuntime**
    - 게임 실행 중 사이드 이펙트 통합
    - BGM / 타이머 / 스포너 / grace rule
    - React state → runtime ref 동기화
- **GameWorld**
    - Hub 역할
    - 훅 조합 및 연결만 담당

---

## 🕹 Gameplay Rules (요약)

- 1인칭 FPS 시점 (Pointer Lock)
- 타겟 생성 속도 점진적 증가
- 타겟 10개 이상 **3초 유지 시 종료**
- 명중 위치에 따른 차등 점수 (1~3점)

<!-- Gameplay Image: 실제 플레이 화면, 800px -->

---

## ✨ UX Details

### Entry UX — 진입 경험

UX Details는 기능 나열이 아니라,
플레이 흐름 속에서 인지 부담을 최소화하고 즉각적인 반응을 가능하게 하는 설계를 기준으로 정리했습니다.

- **메인 페이지**
  - 마우스 위치를 추적하는 스포트라이트 효과
  - 입력 중심 게임이라는 인상을 첫 화면에서 전달
  
- **시작 메뉴**
  - 전체화면 / 창 모드 선택
  - 게임 시작 전 설정과 진입 동선 명확화
  
- **게임 가이드 UI**
  - 조작법과 규칙을 게임 시작 전 확인 가능
  - 플레이 흐름을 끊지 않는 보조 UI

<img width="400" alt="image" src="https://github.com/user-attachments/assets/f9d60a08-0dab-46ea-a315-4be0554897b9"/>
<img width="260" alt="image" src="https://github.com/user-attachments/assets/3bbda1ce-506d-4de4-85d2-29c8f299252a" />
<img width="300" alt="image" src="https://github.com/user-attachments/assets/8a72347c-2848-4c10-8024-7ed137f4b2d0" />

---

### In-Game UX — 플레이 중 인지 & 피드백

플레이 중에는
**시각적 피드백을 즉각적으로 제공하면서도**
게임 흐름을 방해하지 않는 것을 목표로 했습니다.

- **게임 상태 UI**
  - 점수 / 정확도 / 진행 상태를 상시 표시
  - 시선 이동을 최소화해 플레이 흐름 유지
- **플로팅 스코어**
  - 히트 위치에서 즉각적인 점수 피드백  
  - 크리티컬 히트 시 강조 표현
  - 🔗 [관련 글](https://velog.io/@dh82680/%ED%94%8C%EB%A1%9C%ED%8C%85-%EC%8A%A4%EC%BD%94%EC%96%B4-%EA%B8%B0%EB%8A%A5-%EC%B6%94%EA%B0%80-%EC%8A%88%ED%8C%85-%EA%B2%8C%EC%9E%84%EC%9D%98-%EA%B8%B0%EB%B3%B8-UX)

- **종료 유예 시각화**
  - 타겟 수 임계 도달 시 단계적 색상 변화  
  - 게임 종료 위험을 사전에 인지 가능
  - 🔗 [관련 글](https://velog.io/@dh82680/%EC%A2%85%EB%A3%8C-%EC%9C%A0%EC%98%88-%ED%83%80%EC%9D%B4%EB%A8%B8%EC%99%80-%ED%83%80%EA%B2%9F-%EC%83%89%EC%83%81-%EB%B3%80%EA%B2%BD-%EA%B8%B0%EB%8A%A5-%EC%B6%94%EA%B0%80)

<img width="300" alt="image" src="https://github.com/user-attachments/assets/61b9f4ff-770d-4e09-bc98-b7ca9dde9222"/>
<img width="300" alt="image" src="https://github.com/user-attachments/assets/d84d3b17-bb61-42ad-9c86-c6024935bc4e"/>

---

### Post-Game UX — 피드백 & 동기 부여

게임 종료 이후에는
플레이 결과를 명확히 전달하고,
재도전을 유도하는 흐름을 구성했습니다.

- **결과 메뉴**
  - 점수 / 정확도 / 플레이 시간 / 예상 랭킹 요약
  - 결과 저장 여부 결정
  - 즉각적인 재시작 또는 메뉴 복귀 동선 제공

- **랭킹 보드**
  - Top 100위 랭킹 조회

<img width="400" alt="image" src="https://github.com/user-attachments/assets/6ff27bf6-23bd-4693-a83e-255e37707ab7"/>
<img width="400" alt="image" src="https://github.com/user-attachments/assets/b0c2acba-ae48-48c9-9e00-7909e65fc289" />

---

## 🛠 Tech Stack

### Frontend

- React + TypeScript
- HTML5 Canvas
- Tailwind CSS
- Framer Motion

### Backend

- Node.js
- Express
- MySQL

### Infra

- Docker / Docker Compose
- AWS EC2
- GitHub Actions

---

## 🌱 What I Learned

- rAF 기반 시간 제어 설계
- Canvas와 React의 경계 설정
- 구조적 리팩토링의 중요성
- “동작하는 코드”와 “관리 가능한 코드”의 차이

이 프로젝트는

**기능 구현 → 구조 재설계 → 완성도 개선**까지

전체 사이클을 끝까지 경험한 작업이었습니다.
</br>
👉 [프로젝트 회고](https://velog.io/@dh82680/%ED%9A%8C%EA%B3%A0-FPS-Aim-Test-%EB%8A%90%EB%A0%A4%EB%8F%84-%EB%A9%88%EC%B6%94%EC%A7%80-%EC%95%8A%EC%95%98%EB%8D%98-%EB%8B%B4%EA%B8%88%EC%A7%88)

---

## ⚙️ Getting Started (Local)

```bash
git clone https://github.com/Donghunn-Lee/aimtest.git
cd aimtest
docker compose up --build
# or: docker-compose up --build

```

---

## 👤 Author

- 이동훈 (Donghunn Lee)
- Frontend Developer
- GitHub: https://github.com/Donghunn-Lee
- Email: [dh82680@gmail.com](mailto:dh82680@gmail.com)

---

## 📄 License & Credits

- BGM: 니아 / [SellBuyMusic](https://sellbuymusic.com/md/mqqtckh-dffhnkh)
