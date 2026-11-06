# 공모전헌터 브랜드 에셋

공모전헌터 로고 파일을 모아 둔 저장소입니다. 웹, 랜딩, 문서, 프로필 사진에 쓰는 로고는 여기서 가져갑니다.

<p>
  <img src="png/badge-256.png" width="128" alt="공모전헌터 배지 로고">
  &nbsp;&nbsp;
  <img src="png/mark-256.png" height="128" alt="공모전헌터 사슴뿔 마크">
</p>

## 로고

- **배지(기본)**: 검은 원판에서 사슴뿔을 오려 내고, 뿔 밑동이 원 테두리 밖으로 이어지는 로고입니다. 앱 아이콘, 파비콘, 프로필 사진처럼 로고가 홀로 쓰이는 자리에 씁니다.
- **마크(보조)**: 원판 없이 뿔만 있는 로고입니다. 원이 들어갈 자리가 없거나 글자 옆에 나란히 놓을 때 씁니다.

## 파일

| 폴더 | 파일 | 쓰는 곳 |
| --- | --- | --- |
| `logo/` | `badge.svg`, `badge-white.svg`, `badge-currentcolor.svg` | 배지 원본입니다. `currentcolor`는 글자색을 따라갑니다. |
| `logo/` | `mark.svg`, `mark-white.svg`, `mark-currentcolor.svg` | 마크 원본입니다. |
| `png/` | `badge-16.png`부터 `badge-1024.png`까지, `badge-white-*.png` | 투명 배경 배지입니다. 숫자는 한 변의 픽셀입니다. |
| `png/` | `mark-128.png`부터 `mark-1024.png`까지, `mark-white-*.png` | 투명 배경 마크입니다. 숫자는 높이입니다. |
| `favicon/` | `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` | 웹 파비콘입니다. `favicon.ico`에는 16, 32, 48px이 들어 있습니다. |
| `favicon/` | `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | 웹 앱 매니페스트 아이콘입니다. |
| `social/` | `avatar-light.png`, `avatar-dark.png` | GitHub 조직이나 디스코드 같은 곳의 프로필 사진입니다. |

## 웹에 넣기

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

`favicon.svg`는 어두운 모드에서 흰색으로 바뀝니다. 페이지 안에 직접 넣을 때는 `badge-currentcolor.svg`를 쓰면 주변 글자색을 그대로 따라갑니다.

## 쓸 때 지킬 것

- 색은 검정 `#17171A`와 흰색 `#FFFFFF`만 씁니다. 브랜드 색은 아직 정하지 않았습니다.
- 배지 둘레에는 지름의 1/4 이상 여백을 둡니다.
- 배지는 16px보다 작게 쓰지 않습니다.
- 늘이거나 기울이지 않고, 원판 안에서 뿔 위치를 옮기지 않습니다.

## 시안

로고를 고른 과정은 Claude 디자인 캔버스에 남아 있습니다. 공유받은 사람만 열 수 있습니다.

- 사슴 로고 시안: https://claude.ai/artifact/EVX58bZ1pWtJFc7rD532Da
- 금뿔 다섯 갈래 비교: https://claude.ai/artifact/5eFqTpoQEkfhAzWyKAfv7F
