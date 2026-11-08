# 파일 고치는 법

`src/badge.svg`, `src/mark.svg`, `src/mascot/` 아래 SVG가 원본입니다. 나머지 폴더(`logos/`, `mascot/`, `web/`, `social/`, `docs/`)는 `scripts/build.mjs`가 만들므로 손으로 고치지 않습니다.

1. 원본 SVG를 고칩니다. 색, 크기, 만들 파일 목록은 `scripts/build.mjs` 맨 위의 값에서 바꿉니다.
2. 파일을 다시 만듭니다.
   ```sh
   npm ci
   npm run build
   ```
3. 만든 파일을 원본과 함께 커밋하고 풀 리퀘스트를 엽니다. `check`가 원본과 파일이 맞는지 확인합니다.
4. 머지한 뒤 태그를 올리면 전체 파일 zip이 릴리스에 붙습니다.
   ```sh
   git tag v1.1.0
   git push origin v1.1.0
   ```

파일 이름은 `gonghunt-<로고>-<색>-<크기>.<확장자>` 꼴이고, PNG의 숫자는 한 변(px)입니다. 배지와 마크 모두 정사각형 판이라 같은 크기로 바꿔 끼울 수 있습니다. 원본 SVG의 viewBox도 정사각형이어야 하며, 아니면 빌드가 멈춥니다.

## 마스코트

마스코트 노랑이는 [마스코트 캔버스](https://claude.ai/artifact/HkuY4VEbqhKuBmyxhjLSSR)에서 그립니다. 캔버스에서 고친 그림을 `src/mascot/<이름>.svg`에 덮어쓴 뒤 위와 같이 다시 만듭니다. 새 코스튬을 더할 때는 `scripts/build.mjs`의 `mascots` 목록에 이름을 넣습니다.

마스코트 파일 이름은 `gonghunt-mascot-<이름>-<너비>.<확장자>` 꼴이고, PNG의 숫자는 너비(px)입니다. 판은 400×440이라 세로가 조금 깁니다. 크레용 결은 SVG 필터로 그리므로 원본에서 `filter`를 빼지 않습니다.
