/**
 * Users 컴포넌트에서는 users 값이 null인지 배열인지 확인하는 유효성 검사를 해 주었던 반면,
 * User 컴포넌트에서는 유효성 검사를 해 주지 않았다. 각 컴포넌트가 아니라
 * 컨테이너 컴포넌트에서 유효성 검사를 할 때는 다음과 같이 한다. => UserContainer 참고
 *
 */

import React from 'react'

const User = ({ user }) => {
    const { email, name, username } = user
    return (
        <div>
            <h1>
                {username} ({name})
            </h1>
            <p>
                <b>e-mail:</b> {email}
            </p>
        </div>

    )
}

export default User