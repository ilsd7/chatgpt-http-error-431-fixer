# ChatGPT HTTP ERROR 431 Fixer

[English](../README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [Español](README.es.md)

> **완전한 로컬 실행** · **네트워크 접근 없음** · **프라이버시 우선**

누적된 임시 채팅 쿠키를 안전하게 정리해 ChatGPT 사용 중 HTTP ERROR 431이 반복해서 나타나는 것을 방지하는 작은 도구입니다.

ChatGPT 웹에서 임시 채팅을 사용하면 한 달 후 만료되는 `conv_key_*` 쿠키가 계속 생성됩니다. 임시 채팅을 자주 사용하면 쿠키가 수십 개 이상 누적되어 요청 헤더가 커지고, HTTP ERROR 431(`Request Header Fields Too Large`)이 발생할 수 있습니다.

이렇게 누적된 쿠키만 삭제하며, 로그인 쿠키를 비롯한 다른 ChatGPT 쿠키는 건드리지 않습니다.

## 다운로드 및 설치

[최신 GitHub 릴리스](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest)에는 Chromium 확장 프로그램과 수동 설치용 사용자 스크립트가 포함됩니다. 사용자 스크립트는 사용자 스크립트 관리자를 통해 업데이트를 받을 수 있도록 Greasy Fork에서 설치하는 것을 권장합니다.

압축을 풀어 설치한 Chromium 확장 프로그램은 자동으로 업데이트되지 않으므로 새 릴리스가 나오면 수동으로 다시 설치하세요.

### Chromium용 확장 프로그램

쿠키를 자동으로 정리하려면 확장 프로그램을 사용하세요. Chromium 119 이상이 필요합니다.

1. 릴리스 첨부 파일에서 확장 프로그램 ZIP을 내려받아 압축을 풉니다.
2. `chrome://extensions`를 엽니다.
3. **개발자 모드**를 켭니다.
4. **압축해제된 확장 프로그램 로드**를 선택하고 압축을 푼 폴더를 지정하거나, 해당 폴더를 확장 프로그램 페이지로 드래그합니다.

확장 프로그램은 설치 직후 임시 채팅 탭이 열려 있는지 확인하고, 열려 있지 않으면 대상 쿠키를 바로 삭제합니다. 정리에 성공하면 3시간 후 다시 확인하며, 이때 임시 채팅 탭이 열려 있으면 삭제하지 않고 탭이 닫힐 때까지 30분마다 확인합니다.

브라우저를 완전히 종료했다가 다시 실행할 때도 대상 쿠키를 바로 삭제합니다. 툴바 버튼을 누르면 먼저 열린 임시 채팅 탭이 있는지 확인하고, 없으면 대상 쿠키를 바로 삭제한 뒤 배지에 삭제한 개수를 표시합니다. 임시 채팅 탭이 열려 있으면 아무것도 삭제하지 않습니다.

Firefox는 Manifest V3 백그라운드 서비스 워커를 지원하지 않아 이 확장 프로그램을 실행할 수 없습니다. 대신 사용자 스크립트를 사용하세요.

### Firefox 및 수동 정리용 사용자 스크립트

Firefox를 사용하거나 브라우저 확장 프로그램을 원하지 않는다면 사용자 스크립트를 사용할 수 있습니다. 사용자 스크립트는 자동 삭제를 지원하지 않으며, 수동 삭제는 임시 채팅 탭이 열려 있는지와 관계없이 실행되므로 유의하세요. Chromium에서는 위 확장 프로그램 사용을 권장합니다.

현재 Violentmonkey는 Firefox 전용 `firstPartyDomain`을 Chromium 쿠키 API 요청에 추가하므로 Chromium에서 사용할 수 없습니다. 대상 쿠키는 HttpOnly이므로 Tampermonkey는 Beta 버전을 사용해야 합니다.

1. 브라우저에 맞는 사용자 스크립트 관리자를 설치합니다.
   - Firefox: [Violentmonkey](https://violentmonkey.github.io/) 또는 [Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=firefox)
   - Chromium: [Tampermonkey Beta](https://www.tampermonkey.net/index.php?browser=chrome)
2. Chromium 138 이상에서는 사용자 스크립트 관리자 확장 프로그램의 세부정보에서 **Allow User Scripts**를 켭니다.
3. [Greasy Fork 스크립트 페이지](GREASY_FORK_SCRIPT_URL)를 열고 **이 스크립트 설치**를 선택합니다.
4. 사용자 스크립트 관리자의 설치 확인 화면에서 승인합니다.

대안으로 [최신 GitHub 릴리스](https://github.com/ilsd7/chatgpt-http-error-431-fixer/releases/latest)에서 `chatgpt-http-error-431-fixer.user.js`를 내려받아 사용자 스크립트 관리자에 가져올 수 있습니다. 이렇게 수동으로 설치한 스크립트는 자동으로 업데이트되지 않습니다.

설치하면 사용자 스크립트 관리자 메뉴에 다음 명령이 생깁니다.

- **Count conv_key_* cookies**
- **Delete conv_key_* cookies now**

Firefox에서 Violentmonkey를 사용할 때는 다음 두 설정을 모두 켜야 합니다.

1. 전역 고급 설정: **Allow GM_cookie to access HTTP-only cookies**
2. 스크립트 설정: **Allow access to HTTP-only cookies**

권한이 강력하므로 내용을 직접 확인하고 신뢰할 수 있는 스크립트에만 허용하세요.

## 어떤 쿠키가 삭제되나요?

다음 두 조건을 모두 만족할 때만 삭제합니다.

- 도메인을 정규화했을 때 `chatgpt.com`과 정확히 일치
- 이름이 `conv_key_`로 시작

로그인 쿠키 등 다른 쿠키는 삭제 대상이 아닙니다.

## 프라이버시 및 보안

모든 기능은 로컬에서 실행됩니다. 사용량 분석, 텔레메트리, 원격 코드, 외부 라이브러리가 없으며 자체적으로 네트워크 요청을 보내지도 않습니다. 쿠키 값은 저장·기록·표시·전송하지 않습니다.

확장 프로그램이 요청하는 권한은 다음과 같습니다.

- `cookies`: 일치하는 `chatgpt.com` 쿠키 조회 및 삭제
- `alarms`: 3시간 후 검사를 예약하고 필요한 경우 30분 후 재시도
- `storage`: 마지막으로 정리에 성공한 시각 저장
- `https://chatgpt.com/*`: 쿠키와 탭 접근 범위를 ChatGPT로 제한

빌드는 필요하지 않습니다. GitHub 릴리스 파일과 Greasy Fork에 게시된 사용자 스크립트는 저장소의 소스 코드를 축소하거나 변환하지 않고 그대로 담고 있으므로 설치 전에 내용을 직접 확인할 수 있습니다. 별도의 바이너리 검증 절차는 없습니다.

취약점 제보 방법은 [보안 정책](../SECURITY.md)을 참고하세요.

이외의 문제가 발생하면 [GitHub Issues](https://github.com/ilsd7/chatgpt-http-error-431-fixer/issues)를 통해 알려주세요.

## 라이선스

[Apache License 2.0](../LICENSE)에 따라 배포됩니다.

## 참고

이 도구가 HTTP ERROR 431의 모든 원인을 해결하는 것은 아닙니다. 누적된 임시 채팅 쿠키가 원인인 경우에만 효과가 있습니다.

ChatGPT는 OpenAI의 상표이며, 이 저장소는 개인이 만든 독립 프로젝트입니다.
