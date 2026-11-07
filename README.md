# 공모전헌터 브랜드 에셋

공모전헌터 로고 파일을 한곳에 모은 저장소입니다. 필요한 파일을 아래 표에서 골라 받으면 됩니다.

![밝은 바탕과 어두운 바탕 위의 공모전헌터 배지와 마크](docs/preview.svg)

## 바로 받기

| 쓰려는 곳 | 받을 파일 |
| --- | --- |
| 웹사이트 파비콘과 앱 아이콘 | [`web/`](web) 폴더 전체 |
| 문서, 발표 자료, 밝은 바탕 | [`gonghunt-badge-black.svg`](logos/badge/black/gonghunt-badge-black.svg) |
| 어두운 바탕 | [`gonghunt-badge-white.svg`](logos/badge/white/gonghunt-badge-white.svg) |
| 웹 페이지 안에 직접 넣기 | [`gonghunt-badge-currentcolor.svg`](logos/badge/currentcolor/gonghunt-badge-currentcolor.svg) |
| SVG를 쓸 수 없는 곳 | [`logos/badge/black/`](logos/badge/black)의 PNG(16~1024px) |
| GitHub, 디스코드 프로필 사진 | [`gonghunt-avatar-light.png`](social/gonghunt-avatar-light.png), [`gonghunt-avatar-dark.png`](social/gonghunt-avatar-dark.png) |
| 전부 한 번에 | [최신 릴리스](https://github.com/GongHunt/gonghunt-brand/releases/latest)의 zip |

## 로고

| 이름 | 모양 | 쓰는 곳 |
| --- | --- | --- |
| 배지(기본) | 검은 원판에서 사슴뿔을 오려 내고, 뿔 밑동이 원 테두리 밖으로 이어집니다. | 앱 아이콘, 파비콘, 프로필 사진처럼 로고가 홀로 쓰이는 자리 |
| 마크(보조) | 원판 없이 뿔만 있습니다. | 원이 들어갈 자리가 없거나 글자 옆에 나란히 놓을 때 |

## 폴더와 파일 이름

```
src/                원본 SVG 두 개. 로고를 고칠 때는 여기만 고칩니다.
logos/
  badge/
    black/          gonghunt-badge-black.svg, gonghunt-badge-black-16.png부터 -1024.png까지
    white/          흰색 판
    currentcolor/   글자색을 따라가는 SVG
  mark/             배지와 같은 짜임입니다.
web/                favicon.ico, favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png,
                    icon-maskable-512.png, site.webmanifest
social/             프로필 사진(1024px)
docs/               README에 쓰는 그림
scripts/build.mjs   src/에서 나머지 파일을 모두 만드는 스크립트
```

파일 이름은 `gonghunt-<로고>-<색>-<크기>.<확장자>` 꼴이라, 내려받은 파일만 보고도 무엇인지 알 수 있습니다. 배지 PNG의 숫자는 한 변, 마크 PNG의 숫자는 높이(px)입니다.

## 웹에 넣기

`web/` 폴더의 파일을 사이트 공개 폴더의 맨 위에 복사하고 `<head>`에 넣습니다.

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

- `favicon.svg`는 어두운 모드에서 흰색으로 바뀝니다.
- `site.webmanifest`에는 이름, 아이콘, 색만 넣었습니다. `start_url`과 `display`는 사이트에 맞게 더합니다.
- 제품에서는 이 저장소의 파일 주소를 바로 걸지 말고, 파일을 복사해서 씁니다.

## 쓸 때 지킬 것

### 색

| 이름 | HEX | RGB |
| --- | --- | --- |
| 검정 | `#17171A` | 23, 23, 26 |
| 흰색 | `#FFFFFF` | 255, 255, 255 |

브랜드 색은 아직 정하지 않았습니다. 정하기 전까지는 이 두 색만 씁니다.

### 여백

<img src="docs/clear-space.svg" width="240" alt="배지 둘레에 지름의 1/4만큼 여백을 둔 그림">

배지 둘레에는 지름의 1/4 이상을 비워 둡니다. 마크는 마크 너비의 1/4 이상입니다.

### 최소 크기

배지는 16px, 마크는 높이 32px보다 작게 쓰지 않습니다.

### 하지 말 것

- 가로세로 비율을 바꾸거나, 기울이거나, 돌리지 않습니다.
- 원판 안에서 뿔의 위치나 크기를 바꾸지 않습니다.
- 위의 두 색 말고 다른 색을 칠하거나, 그림자나 테두리를 더하지 않습니다.
- 대비가 낮은 바탕에 올리지 않습니다. 밝은 바탕에는 검정, 어두운 바탕에는 흰색을 씁니다.

## 로고를 고치거나 파일을 더할 때

1. `src/badge.svg`나 `src/mark.svg`를 고칩니다. 크기, 색, 만들 파일 목록은 `scripts/build.mjs` 맨 위의 값에서 바꿉니다.
2. 파일을 다시 만듭니다.
   ```sh
   npm ci
   npm run build
   ```
3. 만든 파일을 원본과 함께 커밋하고 풀 리퀘스트를 엽니다. `check` 워크플로가 원본과 파일이 맞는지 확인합니다.
4. 머지한 뒤 태그를 올리면 전체 파일을 묶은 zip이 릴리스에 붙습니다.
   ```sh
   git tag v1.1.0
   git push origin v1.1.0
   ```

`logos/`, `web/`, `social/`, `docs/`는 스크립트가 만드는 폴더입니다. 손으로 고쳐도 다음 빌드에서 덮어씁니다.

## 사용 허락

로고는 오픈소스 라이선스로 배포하지 않습니다. [LICENSE.md](LICENSE.md)를 봐 주세요.
