# 🎯 FPS Aim Test

> **웹 기반 FPS 에임 테스트 게임**

**🔗 [실제 서비스 바로가기](http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com)**<br>
**🎬 [구동 영상 보기 (Google Drive)](https://drive.google.com/file/d/1FVA1koKcU6UHaQKNVxIjD53eldVBDea3/view?usp=drive_link)** (배경 음악이 들어가 있습니다. 미리 볼륨을 줄인 후 조절해주세요!)

<img src="https://github.com/user-attachments/assets/36bc89d2-4d4a-4739-a0cd-b34a6c6d4e97" width="80%" />

---

## 1. 📝 프로젝트 개요 (Overview)

### 🕹️ 게임 설명
화면에 나타나는 타겟을 빠르고 정확하게 조준해 맞추는 **마우스 정확도 훈련 및 테스트 게임**입니다.<br>
시간이 갈수록 타겟은 **점점 빠르게 생성**되며, 화면에 남은 **타겟이 10개가 되었을 때 게임이 종료**됩니다.

### ✨ 주요 기능
- 전체화면/창 모드 및 3개 해상도 지원
- 부드러운 1인칭 시점 고성능 렌더링
- 랭킹 시스템
- 효과음/배경음

### 🎯 목적
FPS 게임 에임 능력 향상을 위한 웹 기반 훈련 도구

---

## 2. 🛠️ 기술 스택 (Tech Stack)

| Category | Technologies |
|----------|-------------|
| **Frontend** | ![React](https://img.shields.io/badge/React-61DAFB.svg?&style=for-the-badge&logo=React&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?&style=for-the-badge&logo=TypeScript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4.svg?&style=for-the-badge&logo=TailwindCSS&logoColor=white) ![HTML5](https://img.shields.io/badge/HTML5-E34F26.svg?&style=for-the-badge&logo=HTML5&logoColor=white) |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933.svg?&style=for-the-badge&logo=Node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000.svg?&style=for-the-badge&logo=Express&logoColor=white) |
| **Database** | ![MySQL](https://img.shields.io/badge/MySQL-4479A1.svg?&style=for-the-badge&logo=MySQL&logoColor=white) |
| **Infrastructure & DevOps** | ![Docker](https://img.shields.io/badge/Docker-2496ED.svg?&style=for-the-badge&logo=Docker&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF.svg?&style=for-the-badge&logo=GitHubActions&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-FF9900.svg?&style=for-the-badge&logo=AmazonAWS&logoColor=black) |
| **Development Tools** | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3.svg?&style=for-the-badge&logo=ESLint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E.svg?&style=for-the-badge&logo=Prettier&logoColor=black) ![Git](https://img.shields.io/badge/Git-F05032.svg?&style=for-the-badge&logo=Git&logoColor=white) |

---

## 3. 🚩 주요 기능 (Features)

### 🖥️ 게임 모드
- 전체화면/창 모드 지원 및 16:9, 4:3, 16:10의 세 가지 해상도 지원  
<img src="https://github.com/user-attachments/assets/5f59958e-4793-4141-84ee-c0cd76fe3195" width="70%" />

### 🎯 1인칭 시점
- 마우스 감도 조절, 포인터 락을 통한 1인칭 시점

### 📈 실시간 통계
- 점수 추적 및 정확도 산출

### 🏅 랭킹 시스템
- MySQL 기반 점수 저장 및 순위 표시  
<img src="https://github.com/user-attachments/assets/d1378855-ffcb-4041-8cf0-a72dadda5c71" width="70%" />

### 🔉 사운드
- BGM, HIT/MISS 사운드 효과 적용

### 🎨 UI/UX
- 기본 페이지 네온 테마, 인게임 역시 눈부시지 않은 라이트 그레이 테마  
<img src="https://github.com/user-attachments/assets/aceb1428-7eb5-47c3-8276-9482e5a08e51" width="70%" />

---

## 4. ⚙️ 실행 방법 (Getting Started)

### 1) 사전 준비
- [Docker](https://www.docker.com/products/docker-desktop/)와 [Docker Compose](https://docs.docker.com/compose/)가 설치되어 있어야 합니다.

### 2) 프로젝트 클론
```bash
git clone https://github.com/Donghunn-Lee/aimtest.git
cd aimtest
```

### 3) 환경변수 설정 (선택)
- 기본적으로 `docker-compose.yml`에 환경변수 값이 포함되어 있습니다.
- 필요하다면 `.env` 파일을 생성해 환경변수를 오버라이드할 수 있습니다.

### 4) 전체 서비스 실행
```bash
docker-compose up
```
- 프론트엔드(React), 백엔드(Express), 데이터베이스(MySQL)가 모두 컨테이너로 실행됩니다.
- DB는 자동으로 생성 및 초기화됩니다(`init.sql` 참고).

> ⚠️ 참고
> - 최신 Docker 환경에서는 `docker compose up`도 사용할 수 있습니다.
> - (EC2/Ubuntu 등에서는 기본적으로 `docker-compose` 명령어를 사용하세요.)


### 5) 접속 방법
- 웹 브라우저에서 [http://localhost](http://localhost)로 접속하면 서비스가 실행됩니다.
- 랭킹 시스템 등 모든 데이터는 **본인 PC의 MySQL 컨테이너에만 저장**됩니다.

> ⚠️ 참고  
> - 이 프로젝트는 “로컬 개발 환경”에서의 실행을 전제로 하며,  
> - 공용 랭킹 서버나 운영 서버는 제공하지 않습니다.
> - DB 계정/비밀번호 등은 `docker-compose.yml` 또는 `.env`에서 직접 설정할 수 있습니다.

---

## 5. 🎮 게임 플레이 가이드 (How to Play)

- **점점 빠르게** 생성되는 타겟을 사격하여 점수를 획득하세요.
- 타겟 중앙부터 **3점, 2점, 1점**의 점수를 얻을 수 있습니다.
- 게임 시작 후 [좌/우 방향키]로 마우스 민감도를 조절할 수 있습니다.
- 화면에 **10개의 타겟**이 남아있는 시점에 게임이 종료됩니다.
- **ESC**를 누르면 게임을 즉시 종료할 수 있습니다.
- **F5**를 누르면 화면 모드를 다시 선택할 수 있습니다.

**게임 진행 순서**
1. 게임 모드 선택 (전체화면/창 모드)
2. 해상도 및 마우스 감도 설정
3. 게임 시작 후 마우스로 타겟 클릭
4. 게임 종료 후 결과 확인 및 점수 기록

---

## 6. 🏗️ 아키텍처 (Architecture)

### ☁️ **배포 환경**

#### **인프라 구성**
- **Hosting**: AWS EC2 (t2.micro)
- **Domain**: http://ec2-52-79-221-80.ap-northeast-2.compute.amazonaws.com/
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

#### **배포 과정**
1. GitHub에 코드 푸시
2. GitHub Actions에서 자동 빌드 및 Docker 이미지 생성
3. Docker Hub에 이미지 푸시
4. AWS EC2에서 이미지를 Pull & Deploy
5. 무중단 배포 및 컨테이너 관리

#### **키 포인트**
- ⚡ **Automated Deployment**: 코드 푸시만으로 자동 배포
- 🌀 **Zero-Downtime**: Docker 기반 무중단 배포
- 🧩 **Easy Maintenance**: 컨테이너화로 환경 관리 간편

#### **프로덕션 환경 구조**
```
┌─────────────────────────────────────────────────────────────┐
│                    AWS EC2 Instance                         │
│                       (t2.micro)                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Frontend      │   Backend       │   Database              │
│   (Docker)      │   (Docker)      │   (Docker)              │
│   Port: 80      │   Port: 3001    │   Port: 3306            │
│   React App     │   Express API   │   MySQL 8.0             │
└─────────────────┴─────────────────┴─────────────────────────┘
```

#### **CI/CD 파이프라인**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │───►│ GitHub      │───►│ Docker Hub  │───►│ AWS EC2     │
│   Push      │    │ Actions     │    │ Registry    │    │ Auto Deploy │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 7. 🧩 핵심 구현 내용 (Key Implementations)

- **Canvas 기반 게임 엔진**  
  HTML5 Canvas API를 활용하여 2D 타겟, 배경, 크로스헤어 등 모든 게임 요소를 직접 렌더링합니다.  
  requestAnimationFrame을 이용해 부드러운 애니메이션과 60fps 성능을 구현했습니다.

- **타겟 관리 시스템**  
  타겟의 동적 생성, 위치 랜덤화, 크기 조절, 충돌 판정(마우스 클릭 시 타겟 명중 여부)을 별도의 모듈로 관리합니다.  
  타겟 생성 간격을 점점 축소시킴으로써 시간이 지날수록 난이도가 향상되도록 구현했습니다.<br>
  (1초에서 시작해 타겟 생성 시마다 1.8%씩 곱으로 감소. 최소 300ms)

- **게임 상태 관리**  
  React의 커스텀 Hook(useGameState, useTargetManager 등)을 활용해  
  게임의 시작/종료, 점수, 정확도, 남은 시간 등 상태를 효율적으로 관리합니다.

- **실시간 랭킹**  
  Express 기반 RESTful API와 MySQL을 연동하여  
  게임 종료 시 점수를 서버에 저장하거나 랭킹 보드에서 실시간으로 순위를 조회할 수 있습니다.

---

## 8. 🏔️ 개발 과정에서의 도전과 해결 (Challenges & Solutions)
- **타겟 매니저 시스템 구축**:  
  타겟이 겹치지 않게 랜덤 위치에 생성하고, 명중 판정 및 점수 계산, 동적 추가/제거, 게임 영역 크기 변화 대응 등 다양한 상태 관리를 위해 `TargetManager` 클래스를 별도로 구현했습니다.  
  최대 100번 위치 재시도, 거리 기반 점수 차등, 배열 직접 관리 등으로 효율성과 정확성을 모두 확보했습니다.
- **Canvas 성능 최적화**:  
  requestAnimationFrame을 활용해 부드러운 렌더링과 불필요한 연산 최소화를 달성했습니다.
- **포인터 락 구현**:  
  다양한 브라우저 환경에서의 포인터 락 호환성 문제를 해결했습니다.
- **실시간 점수 동기화**:  
  REST API 설계 및 에러 핸들링을 통한 데이터 일관성 확보.
- **반응형 게임 화면**:  
  다양한 해상도와 화면 비율에 대응하는 UI/UX 설계.

---

## 9. 🚀 성능 최적화 (Performance)

- **Canvas 렌더링 최적화**  
  `requestAnimationFrame`을 활용해 프레임마다 효율적으로 화면을 갱신하며, React의 상태 변화와 분리된 순수 Canvas 렌더링 구조로 60fps의 부드러운 애니메이션을 구현했습니다.

- **타겟 배열 직접 관리 및 렌더링 최소화**  
  타겟 데이터는 클래스 내부 배열로 직접 관리하며, React의 상태 업데이트가 아닌 내부 데이터 조작과 `useRef`를 적극 활용해 불필요한 컴포넌트 리렌더링을 방지했습니다.  

  타겟이 너무 많아질 경우(10개 이상) 게임을 종료하는 로직을 도입하여, 렌더링 부하와 성능 저하를 사전에 차단했습니다.

- **타겟 랜덤 좌표 생성 최적화**  
  타겟 생성 시 최대 100회까지 위치를 재시도하여 기존 타겟과 겹치지 않게 하면서도, 불필요한 연산을 최소화하는 구조로 설계했습니다.

- **이미지 로딩 상태 관리**  
  `useImageLoader` 훅을 통해 게임에 필요한 이미지를 미리 로딩하고, 로딩 완료 후에만 캔버스에 그리도록 하여, 렌더링 시 이미지 미로딩으로 인한 깜빡임이나 지연을 방지했습니다.

- **사운드 볼륨/뮤트 등 상태 관리**  
  `useVolume` 훅을 통해 효과음과 배경음의 볼륨, 뮤트 상태를 효율적으로 관리하며, 필요할 때만 사운드 객체를 생성해 메모리 사용을 최소화했습니다.

---

### 💡 **기술적 포인트**
- **useRef**를 적극 활용해, 게임 내 실시간 데이터(타겟, 마우스 위치 등)는 상태 업데이트 없이 참조값으로만 관리하여, React의 불필요한 리렌더링을 방지하고 성능을 극대화했습니다.
- **게임 종료 조건(타겟 10개 이상)** 을 명확히 두어, 렌더링 최적화만으로는 한계가 있는 상황(타겟 과다 생성 시 렉 발생)을 구조적으로 예방했습니다.
- **랜덤 좌표 생성**도 단순 반복이 아닌, 효율적인 검증 로직(최대 100회 시도 후 포기)으로 성능과 안정성을 모두 확보했습니다.

---

## 10. 🌱 향후 개선 계획 (Future Improvements)
- 다양한 게임 모드 추가(저격 모드, 움직이는 타겟 등)
- 게임성을 살린 UI 업그레이드(크로스헤어 옵션, 총기 UI, 사격 애니메이션)

---

## 11. 👨‍💻 개발자 정보 (Developer)

<table>
  <tbody>
    <tr>
      <td align="center" style="vertical-align: top; padding: 10px;">
        <a href="https://github.com/Donghunn-Lee" target="_blank">
          <img src="https://avatars.githubusercontent.com/Donghunn-Lee" width="100" height="100" style="border-radius: 50%;" alt="Donghunn Lee"/>
        </a>
      </td>
      <td style="vertical-align: top; padding: 10px;">
        <strong>🧑 <a href="https://github.com/Donghunn-Lee" target="_blank">이동훈 (Donghunn Lee)</a></strong><br>
        📧  <a href="mailto:dh82680@gmail.com">dh82680@gmail.com</a><br><br>
        <i>
          사용자 경험과 성능 최적화에 진심인 웹 프론트엔드 개발자
        </i>
      </td>
    </tr>
  </tbody>
</table>

---

## 12. 📄 라이선스 및 크레딧 (License & Credits)
- BGM: 니아 / SellBuyMusic / [https://sellbuymusic.com/md/mqqtckh-dffhnkh](https://sellbuymusic.com/md/mqqtckh-dffhnkh)
