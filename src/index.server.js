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
 */

// import ReactDOMServer from 'react-dom/server'
//
// const html = ReactDOMServer.renderToString(
//     <div>Hello</div>,
// )
//
// console.log(html)

// 서버코드
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import express from 'express'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import * as path from 'path'
import * as fs from 'fs'

// asset-manifest.json 에서 파일 경로들을 조회 한다.

const manifest = JSON.parse(
    fs.readFileSync(path.resolve('./build/asset-manifest.json'), 'utf8'),
)

const chunk = Object.keys(manifest.files)
    .filter(key => /chunk\.js$/.exec(key)) // chunk.js로 끝나는 키를 찾는다.
    .map(key => `<script src='${manifest.files[key]}'></script>`) // 스크립트 태그로 변환 하고
    .join('') // 합침

function createPage(root) {
    return `<!DOCTYPE html>
      <html lang='en'>
        <head>
          <meta charset='utf-8' />
          <link rel='shortcut icon' href='/favicon.ico' />
          <meta
            name='viewport'
            content='width=device-width,initial-scale=1,shrink-to-fit=no'
          />
          <meta name='theme-color' content='#000000' />
          <title>React App</title>
          <link href='${manifest.files['main.css']}' rel='stylesheet' />
        </head>
        <body>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div id='root'>${root}</div>
          <script src='${manifest.files['main.js']}'></script>
        </body>
      </html>
    `
}

const app = express()

// 서버 사이드 렌더링을 처리할 핸들러 함수
const serverRender = (req, res, next) => {
    // 이 함수는 404가 떠야 하는 상황에 404를 띄우지 않고 서버 사이드 렌더링을 해준다.
    const context = {}
    const jsx = (
        <StaticRouter location={req.url} context={context}>
            <App />
        </StaticRouter>
    )
    const root = ReactDOMServer.renderToString(jsx) // 렌더링
    res.send(createPage(root)) // 결과물 응답
}

const serve = express.static(path.resolve('./build'), {
    index: false, // "/" 경로에서 index.html을 보여 주지 않도록 설정
})

app.use(serve) // 순서가 중요하다. serverRender 전에 위치해야 한다.
app.use(serverRender)

// 5000 포트로 서버를 가동한다.
app.listen(5000, () => {
    console.log('Running on http://localhost:5000')
})