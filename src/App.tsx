import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import {Home, Calendar, Payments } from './pages';

function App() {
  return (
    <div className="App">
       <Router>
      <div style={{
        width:"100%",
        height: "10%"
      }}>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/calendar">Calendar</Link>
          </li>
          <li>
            <Link to="/payment">Payments</Link>
          </li>
        </ul>

        <hr />

        <Routes>
          <Route path="/" element={ <Home/>} />
          <Route path="/calendar" element={ <Calendar />} />
          <Route path="/payment" element={  <Payments />} />
        </Routes>        
      </div>
    </Router>
    </div>
  );
}

export default App;
