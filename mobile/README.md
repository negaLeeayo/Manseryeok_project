# 빛결 모바일 앱

Expo와 React Native로 만든 온보딩 및 스플래시 모바일 앱입니다. 기존 Vite 웹 버전은 루트의 `frontend/`에 별도로 보존되어 있습니다.

## 휴대폰에서 실행

1. 휴대폰에 Expo Go를 설치합니다.
2. PC와 휴대폰을 같은 Wi-Fi에 연결합니다.
3. 터미널에서 아래 명령을 실행합니다.

```powershell
cd C:\manseyuk_project\Manseryeok_project\mobile
npm start -- --clear
```

4. 터미널에 표시된 QR 코드를 Expo Go로 스캔합니다.

이 프로젝트는 실제 휴대폰용 Expo Go와 호환되도록 Expo SDK 54를 사용합니다.

연결이 되지 않으면 PC 방화벽의 Node.js 네트워크 접근을 허용한 뒤 다시 시도합니다.

## 검사

```powershell
npx tsc --noEmit
npx expo export --platform android
```

동의서, 로그인 및 사용자 정보 입력 화면은 `feature/frontend/user` 브랜치에서 이어집니다.
