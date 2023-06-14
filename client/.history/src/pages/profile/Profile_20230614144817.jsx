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
import { Avatar, Badge } from "@mui/material";

export default function Profile() {
  const [user, setUser] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const { firstName } = useParams();
  const token = Cookies.get("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/user/${firstName}`, {
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

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    setAvatarFile(file);
  };

  const handleAvatarUpload = async () => {
    if (avatarFile) {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      try {
        const res = await axios.post("/api/users/upload-avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        setUser((prevUser) => ({
          ...prevUser,
          profilePicture: res.data.profilePicture,
        }));
      } catch (error) {
        console.log(error);
      }
    }
  };

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
  
  const SmallAvatar = styled(Avatar)(({ theme }) => ({
    width: 22,
    height: 22,
    border: `2px solid ${theme.palette.background.paper}`,
  }));

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
              {/* <Avatar
                className="profileUserImg"
                alt="Profile Picture"
                src={user.profilePicture || "/assets/person/noAvatar.png"}
                style={{ width: "150px", height: "150px" }}
              /> */}
              <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <SmallAvatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
        }
      >
        <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
      </Badge>
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
