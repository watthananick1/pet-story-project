import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/Register";
import TypePet from "./pages/typepet/TypePet";
import Cookies from "js-cookie";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
  const user = Cookies.get("user");

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          {token ? <Home /> : <Login />}
        </Route>
        <Route path="/login">{token ? <Redirect to="/" /> : <Login />}</Route>
        <Route path="/typepet">
          <TypePet />
        </Route>
        <Route path="/register">
          {token ? <Redirect to="/" /> : <Register />}
        </Route>
        <Route path="/profile/:firstName">
          {user ? <Profile /> : <Redirect to="/login" />}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
