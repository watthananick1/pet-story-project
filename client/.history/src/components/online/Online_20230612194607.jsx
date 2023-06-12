import "./online.css";
import {
  Avatar,
} from "@mui/material";

export default function Online({user}) {
  // const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  return (
    <li className="rightbarFriend">
      <div className="rightbarProfileImgContainer">
        <Avatar
          className="rightbarProfileImg"
          aria-label="recipe"
          src={user.profilePicture ? user.profilePicture : "/assets/person/noAvatar.png"}
          style={{ width: "39px", height: "39px" }}
        ></Avatar>
        <span className="rightbarOnline"></span>
      </div>
      <span className="rightbarUsername">{user.firstName} {user.lastName}</span>
    </li>
  );
}
