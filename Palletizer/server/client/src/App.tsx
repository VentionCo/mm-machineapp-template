import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

//Components
import Header from "./parts/Header";
import NavBar from "./parts/NavBar";
import Footer from "./parts/Footer";

// Main Components
import General from "./parts/General";
import Configuration from "./parts/Configuration";

// Context
import PalletizerHub from "./context/AppContext";

// Styles
import './App.scss';


// Require the context hook to seep things updated..;
function App() {
    let tab_options = ['General', 'Configuration'];
    let [general_index, config_index] = [0,1]; 
    return (
        <PalletizerHub>
          <Router>
            <div className="App">
                <Header />
                <Switch>
                  <Route path="/Configuration">
                    <NavBar tabs={tab_options} selected_index={config_index}/>
                    <Configuration />
                  </Route>
                  <Route path="/">
                    <NavBar tabs={tab_options} selected_index={general_index}/>
                    <General />
                  </Route>
              </Switch>
              <Footer />
            </div>
          </Router>
        </PalletizerHub>
    );
}


export default App;
