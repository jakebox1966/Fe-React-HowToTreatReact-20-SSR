/**
 * 원래라면 컨테이너에서 유효성 검사를 할 때 아직 정보가 없는 경우에는 user 값이 null을 가리키므로, User
 * 컴포넌트가 렌더링되지 않도록 컨테이너 컴포넌트에서 null을 반환해 주어야 한다.
 *
 * 하지만 이번에는 서버 사이드 렌더링을 해야 하기 때문에 null이 아닌 Preloader 컴포넌트를 렌더링하여 반환한다.
 * 이렇게 하면 서버 사이드 렌더링을 하는 과정에서 데이터가 없을 경우 GET_USER 액션을 발생시킨다.
 * etc) 추가로 중복 요청을 방지하는 과정에서 user 값이 존재하는지 확인하고, id가 일치하는지 확인한다. id 값은
 * 추후 URL 파라미터를 통해 받아 오기 때문에 문자열로 이루어져 있다. 반면 user 객체 안에 들어 있는 id는 숫자 형태이다.
 * 그러므로 이 두 값을 비교할 때는 props로 받아 온 id 값을 parseInt를 사용하여 숫자로 변환해준 다음에 비교해야 한다.
 *
 */
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUser } from '../modules/users'
import User from '../components/sample/User'
import { Preloader } from '../lib/PreloadContext'

const UserContainer = ({ id }) => {
    console.log(id)
    const user = useSelector(state => state.users.user)
    const dispatch = useDispatch()

    useEffect(() => {
        if (user && user.id === parseInt(id, 10)) return // 사용자가 존재하고, id가 일치한다면 요청하지 않음
        dispatch(getUser(id))
    }, [dispatch, id, user]) // id가 바뀔 때 새로 요청해야 함

    // 컨테이너 유효성 검사 후 return null을 해야 하는 경우에
    // null 대신 Preloader 반환
    if (!user) {
        return <Preloader resolve={() => dispatch(getUser(id))} />
    }
    return <User user={user} />
}

export default UserContainer