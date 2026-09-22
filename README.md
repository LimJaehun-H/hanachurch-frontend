# hanachurch-frontend

## 구조 (페이지 라우팅 방식으로 변경)

- `/` — 홈 (풀블리드 히어로 이미지, 투명 헤더, 우측 세로 퀵네비)
- `/worship` — 예배 안내
- `/notice` — 공지사항 (API 연동)
- `/bulletin` — 주보 (API 연동, 파일 다운로드)
- `/location` — 오시는 길
- `/admin` — 관리자 (로그인 후 공지사항/주보 등록·삭제)

상단 네비게이션과 히어로 우측 퀵네비 버튼은 스크롤 이동이 아니라 **실제 페이지 이동**입니다 (`react-router-dom` 사용).

## VSCode에서 실행하는 법

1. zip 압축 풀고 `hanachurch-frontend` 폴더를 VSCode로 열기
2. 터미널에서:

```bash
npm install
npm run dev
```

3. `http://localhost:5173` 접속

## 수정 포인트 — `src/config.js` 한 파일에 다 모아둠

```js
export const API_BASE_URL = "http://localhost:8080";
export const HERO_IMAGE_URL = null; // public/images/hero.jpg 로 교체
export const WORSHIP_SCHEDULE = [...];
export const CHURCH_INFO = { name, address, phone, email };
```

- 히어로 사진: `public/images/`에 사진 넣고 `HERO_IMAGE_URL`에 경로 지정
- 예배시간/교회정보: 같은 파일에서 값만 수정

## 관리자 페이지 (`/admin`)

- Postman 없이 브라우저에서 바로 공지사항/주보 등록·삭제 가능
- 로그인 성공 시 토큰이 브라우저 `localStorage`에 저장되어 새로고침해도 로그인 유지됨 (24시간 후 만료, 만료되면 자동으로 로그인 화면으로 돌아감)
- `AdminSeeder`로 만들어둔 계정으로 로그인하면 됨

## 배포 전 꼭 해야 할 백엔드 설정 2가지

**1. CORS 허용** (`SecurityConfig.java`)

```java
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.Customizer;
import java.util.List;

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOriginPatterns(List.of("http://localhost:5173"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

`filterChain` 안 `http` 체인 맨 위:
```java
http
    .cors(Customizer.withDefaults())
    .csrf(AbstractHttpConfigurer::disable)
    ...
```

**2. 업로드 파일 정적 서빙** (`WebConfig.java`)

```java
package com.hanachurch.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/bulletins/");
    }
}
```

`SecurityConfig`의 `authorizeHttpRequests`에도 추가:
```java
.requestMatchers("/uploads/**").permitAll()
```

## 프로덕션 빌드

```bash
npm run build
```

`dist/` 폴더를 Netlify/S3/서버 아무 데나 올리면 됩니다.

라우팅을 쓰는 SPA라서, 배포 시 서버에서 `/worship`, `/notice` 같은 경로를 새로고침해도 `index.html`로 fallback 되도록 설정이 필요합니다 (Netlify는 `_redirects` 파일에 `/* /index.html 200` 한 줄이면 해결됩니다).
