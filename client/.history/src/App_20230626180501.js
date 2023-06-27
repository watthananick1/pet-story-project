import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/Register";
import TypePet from "./pages/typepet/TypePet";
import AdminModel from "./pages/admin/AdminModel";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { user } = useContext(AuthContext);
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          {/* {user ? <Home /> : <Login />} */}
          {user ? <AdminModel /> : <Login />}
        </Route>
        <Route path="/login">{user ? <Redirect to="/" /> : <Login />}</Route>
        <Route path="/typepet">
          {/* {user ? <Redirect to="/typepet" /> : <TypePet />} */}
          <TypePet />
        </Route>
        <Route path="/admin">
        {user ? <AdminModel /> : <Login />}
        </Route>
        <Route path="/register">
          {user ? <Redirect to="/" /> : <Register />}
        </Route>
        <Route path="/profile/:firstName" component={Profile}>
          {user ? <Profile /> : <Login />}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
