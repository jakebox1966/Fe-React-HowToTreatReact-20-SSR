/**
 * 여기서는 Route에 component 대신 render 를 설정해 줌으로써 UserContainer를 렌더링할 때
 * URL 파라미터 id를 props로 바로 집어넣어 주었다.
 */

import React from 'react'
import UsersContainer from '../../containers/UsersContainer'

const UsersPage = () => {
    // let { id } = useParams()
    // console.log(id)
    return (
        <>
            <UsersContainer />
            {/*<Routes>*/}
            {/*    <Route*/}
            {/*        path=':id'*/}
            {/*        element={<UserContainer id={id} />}*/}
            {/*    />*/}
            {/*</Routes>*/}
        </>
    )
}
export default UsersPage