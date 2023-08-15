import './App.css'
import Menu from './components/Menu'
import { Route, Routes, useParams } from 'react-router-dom'
import RedPage from './pages/basic/RedPage'
import BluePage from './pages/basic/BluePage'
import UsersPage from './pages/sample/UsersPage'
import UserContainer from './containers/UserContainer'

function App() {
    const { id } = useParams()
    console.log(id)
    return (
        <div>
            <Menu />
            <hr />
            <Routes>
                <Route path='/red' element={<RedPage />} />
                <Route path='/blue' element={<BluePage />} />
                <Route path='/users/*' element={<UsersPage />}>
                    <Route
                        path=':id'
                        element={<UserContainer id={id} />}
                    />
                </Route>
            </Routes>
        </div>
    )
}

export default App
