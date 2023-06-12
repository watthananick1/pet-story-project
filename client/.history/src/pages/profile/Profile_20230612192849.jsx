import "./profile.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ReactLoading from "react-loading";
import Cookies from "js-cookie";

import { Avatar } from "@mui/material";

export default function Profile() {
  const [user, setUser] = useState({});
  const { firstName } = useParams();
  const token = Cookies.get("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/user/${firstName}/date`, { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res?.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, [firstName]);

  console.log(`User =`, user[0]);

  if (Object.keys(user).length === 0) {
    return (
      <div className="loadingWrapper">
        <ReactLoading
          type="spin"
          color="#6200E8"
          height={"10%"}
          width={"10%"}
        />
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <img
                className="profileCoverImg"
                src={
                  user.coverPicture
                    ? user.coverPicture
                    : "/assets/person/noCover.png"
                }
                alt=""
              />
              <Avatar
                className="profileUserImg"
                alt="Profile Picture"
                src={user.profilePicture || "/assets/person/noAvatar.png"}
                style={{ width: "150px", height: "150px" }}
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">
                {user[0].firstName} {user[0].lastName}
              </h4>
              <span className="profileInfoDesc">{user[0]?.desc}</span>
            </div>
          </div>
          <div className="profileRightBottom">
            <Feed firstName={firstName} onProfile={true} />
            <Rightbar user={user[0]} />
          </div>
        </div>
      </div>
    </>
  );
}
