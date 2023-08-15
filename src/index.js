/**
 * 서버 사이드 렌더링 구현하기
 *
 * 1. 서버 사이드 렌더링용 엔트리 만들기
 * - 엔트리(entry)는 웹팩에서 프로젝트를 불러올 때 가장 먼저 불러오는 파일이다. (index.js) 이 파일부터 시작하여
 * 내부에 필요한 다른 컴포넌트와 모듈을 불러온다. 서버 사이드 렌더링을 할 때는 서버를 위한 엔트리 파일을 따로 생성해야한다.(index.server.js)
 *
 * 2. 서버 사이드 렌더링 전용 웹팩 환경 설정 작성하기
 * - 작성한 엔트리 파일을 웹팩으로 불러와서 빌드하려면 서버 전용 환경 설정을 만들어 주어야 한다.
 *
 *      1) config 경로의 paths.js 에 아래 추가
 *          - ssrIndexJs : 불러올 파일의 경로
 *          - ssrBuild : 웹팩으로 처리한 뒤 결과물을 저장할 경로
 *      2) 웹팩 환경 설정 파일 작성
 *          - webpack.config.server.js 파일 생성
 *              1) 웹팩 기본 설정
 *              2) 로더 설정
 *              3) 서버에서 node_modules 내부의 라이브러리를 불러올 수 있게 설정
 *              (서버 번들링할 때 node_modules 제외하기 위해 webpack-node-externals 라이브러리 사용)
 *              4) 환경 변수 주입 => 환경변수를 주입하면, 프로젝트 내에서 process.env.NODE_ENV 값을 참조하여
 *                                 현재 개발 환경인지 아닌지를 알 수 있다.
 *
 *
 * 3. 빌드 스크립트 작성하기
 * - 웹팩으로 프로젝트를 빌드하는 스크립트 작성 => scripts 경로에 build.server.js 생성
 *
 * 5. 서버 코드 작성하기
 * - 서버 사이드 렌더링을 처리할 서버를 만든다. (Express 사용)
 * - StaticRouter라는 컴포넌트를 사용했는데 이 라우터컴포넌트는 주로 서버 사이드 렌더링 용도로 사용되는 라우터이다.
 *   props로 넣어주는 location 값에 따라 라우팅을 한다. (req.url을 넣었는데 여기서 req 객체는 요청에 대한 정보)
 *   StaticRouter에 context라는 props도 있는데 이 값을 사용하여 나중에 렌더링한 컴포넌트에 따라 HTTP 상태 코드를
 *   설정할 수 있다.
 *
 *
 * 6. 정적 파일 제공하기
 * - Express에 내장되어 있는 static 미들웨어를 사용하여 서버를 통해 build에 있는 JS, CSS 정적 파일들에 접근할 수
 * 있도록 설정한다.
 *
 * - JS와 CSS 파일을 불러오도록 html에 코드를 삽입해 준다.
 *
 *
 *
 * 데이터 로딩
 * - 데이터 로딩은 서버 사이드 렌더링을 구현할 때 해결하기 까다로운 문제 중 하나이다. 데이터 로딩을 한다는 것은
 * API 요청을 의미하는데 일반적인 브라우저 환경에서는 API를 요청하고 응답을 받아 와서 리액트 state 혹은 리덕스
 * 스토어에 넣으면 자동으로 리렌더링하니까 문제가 없다. 하지만 서버의 경우 문자열 형태로 렌더링하는 것이므로 state나
 * 리덕스 스토어의 상태가 바뀐다고 해서 자동으로 리렌더링되지 않는다. 그 대신 우리가 renderToString 함수를 한 번
 * 더 호출해 주어야 한다. 또한 서버에서는 componentDidMount 같은 라이프사이클 API도 사용할 수 없다.
 *
 * redux-thunk 와 redux-saga 미들웨어를 이용하여 API 호출하는 환경에서 서버 사이드 렌더링 하기
 *
 * ==================== redux-thunk ====================
 *
 * 1. redux-thunk 코드 준비하기 (Ducks 패턴 사용)
 * - 서버 사이드 렌더링을 할 때는 이미 있는 정보를 재요청하지 않게 처리하는 작업이 중요하다.
 * 이 작업을 하지 않으면 서버 사이드 렌더링 후 브라우저에서 페이지를 확인할 때 이미 데이터를 가지고 있음에도
 * 불구하고 불필요한 API를 호출하게 된다. => 트래픽 낭비, 사용자 경험 저하
 *
 * 2. Users, UsersContainer 컴포넌트 준비하기
 *
 * 3. PreloadContext 만들기
 * - 서버 사이드 렌더링을 할 때는 useEffect나 componentDidMount에서 설정한 작업이 호출되지 않는다. 렌더링하기 전에
 * API를 요청한 뒤 스토어에 데이털르 담아야 하는데, 서버 환경에서 이러한 작업을 하려면 클래스형 컴포넌트가 지니고 있는
 * constructor 메소드나 render 함수를 사용해야한다. 그리고 요청이 끝날 때까지 대기했다가 다시 렌더링해 주어야한다.
 * 여기선 Preloadcontext를 만들고, 이를 사용하는 Preloader 컴포넌트를 만들어 처리한다.
 *
 * - PreloadContext는 서버 사이드 렌더링을 하는 과정에서 처리해야 할 작업들을 실행하고, 만약 기다려야 하는 프로미스(promise)가 있다면
 * 프로미스를 수집한다. 모든 프로미스를 수집한 뒤, 수집된 프로미스들이 끝날 때까지 기다렸다가 그다음에 다시 렌더링하면 데이터가 채워진 상태로
 * 컴포넌트들이 나타나게 된다.
 *
 * - Preloader 컴포넌트는 resolve라는 함수를 props로 받아 오며, 컴포넌트가 렌더링될 때 서버 환경에서만 resolve 함수를 호출해 준다.
 *
 * 4. 서버에서 리덕스 설정 및 PreloadContext 사용하기
 * - 서버에서 리덕스를 설정하는 것은 브라우저에서 할 때와 비교하여 큰 차이가 없다. 다만 주의할 점은 서버가 실행될 때 스토어를 한 번만 만드는 것이 아니라,
 * 요청이 들어올 때마다 새로운 스토어를 만든다는 것이다.
 *
 * - 첫 번째 렌더링을 할 때는 renderToString 대신 renderToStaticMarkup이라는 함수를 사용한다. renderToStaticMarkup은
 * 리액트를 사용하여 정적인 페이지를 만들때 사용한다. 이 함수로 만든 리액트 렌더링 결과물은 클라이언트 쪽에서 HTML DOM 인터랙션을 지원하기 힘들다.
 * 지금 단계에서 renderToString 대신 renderToStaticMarkup 함수를 사용한 이유는 그저 Preloader로
 * 넣어 주었던 함수를 호출하기 위해서 이다. 또 이 함수의 처리 속도가 renderToString 보다 조금 더 빠르기 때문이다.
 *
 * 5. 스크립트로 스토어 초기 상태 주입하기
 * - 지금까지 작성한 코드는 API를 통해 받아 온 데이터를 렌더링하지만, 렌더링하는 과정에서 만들어진 스토어의
 * 상태를 브라우저에서 재사용하지 못하는 상황이다. 서버에서 만들어 준 상태를 브라우저에서 재사용하려면, 현재 스토어 상태를
 * 문자열로 변환 한 뒤 스크립트로 주입해 주어야 한다.
 *
 * - 브라우저에서 상태를 재사용할 때는 다음과 같이 스토어 생성 과정에서 window.__PRELOADED_STATE__를 초깃값으로 사용하면 된다.
 *
 *
 * ==================== redux-saga ====================
 *
 * 1. redux-saga 코드 준비하기기 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { applyMiddleware, legacy_createStore as createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import rootReducer, { rootSaga } from './modules'
import thunk from 'redux-thunk'

const sagaMiddleware = createSagaMiddleware()

const store = createStore(
    rootReducer,
    window.__PRELOADED_STATE__, // 이 값을 초기 상태로 사용함
    applyMiddleware(thunk, sagaMiddleware),
)

sagaMiddleware.run(rootSaga)

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
