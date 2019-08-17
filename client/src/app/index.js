import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { NavBar } from '../components'
import { Game,HowTo} from '../pages'

import 'bootstrap/dist/css/bootstrap.min.css' 

function App() {
    return (
        <Router>
            <NavBar />
            <Switch>
                <Route path = "/game" exact component={Game} />
                <Route path = "/howto" exact component={HowTo} />
            </Switch>
        </Router>
    )
}

export default App