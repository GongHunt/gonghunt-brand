# 파일 고치는 법

`src/badge.svg`와 `src/mark.svg`가 원본입니다. 나머지 폴더(`logos/`, `web/`, `social/`, `docs/`)는 `scripts/build.mjs`가 만들므로 손으로 고치지 않습니다.

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

파일 이름은 `gonghunt-<로고>-<색>-<크기>.<확장자>` 꼴입니다. 배지 PNG의 숫자는 한 변, 마크 PNG의 숫자는 높이(px)입니다.
