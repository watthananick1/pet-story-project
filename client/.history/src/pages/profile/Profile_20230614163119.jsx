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
import { Avatar, Badge, IconButton, Typography } from "@mui/material";
import LocalSeeIcon from "@mui/icons-material/LocalSee";
import { styled } from "@mui/material/styles";

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
        // console.log('res',res.data[0]);
        setUser(res?.data[0]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, [firstName]);

  // console.log('user',user);

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
  
  const ImageSrc = styled('span')({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%',
  });
  
  const Image = styled('span')(({ theme }) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
  }));
  
  const ImageBackdrop = styled('span')(({ theme }) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create('opacity'),
  }));
  
  const ImageMarked = styled('span')(({ theme }) => ({
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: 'absolute',
    bottom: -2,
    left: 'calc(50% - 9px)',
    transition: theme.transitions.create('opacity'),
  }));

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

  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      backgroundColor: "#44b700",
      color: "#44b700",
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: "ripple 1.2s infinite ease-in-out",
        border: "1px solid currentColor",
        content: '""',
      },
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(.8)",
        opacity: 1,
      },
      "100%": {
        transform: "scale(2.4)",
        opacity: 0,
      },
    },
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
              <Image>
            <Typography
              component="span"
              variant="subtitle1"
              color="inherit"
              sx={{
                position: 'relative',
                p: 4,
                pt: 2,
                pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
              }}
            >
              {image.title}
              <ImageMarked className="MuiImageMarked-root" />
            </Typography>
          </Image>
              <Badge
                overlap="circular"
                sx={{
                  top: "-100px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="profileUserImg"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <label htmlFor="avatar-upload">
                    <IconButton
                      color="white"
                      aria-label="Change Avatar"
                      component="span"
                      sx={{
                        backgroundColor: "white",
                        border: "0.5px solid #E2D7F0",
                        borderRadius: "50%",
                      }}
                    >
                      <LocalSeeIcon
                        fontSize="small"
                        sx={{
                          color: "#6200E8",
                        }}
                      />
                    </IconButton>
                  </label>
                }
              >
                <Avatar
                  alt="Profile Picture"
                  src={user.profilePicture || "/assets/person/noAvatar.png"}
                  style={{ width: "150px", height: "150px" }}
                />
              </Badge>
              {/* <IconButton
                className="changeCoverButton"
                aria-label="Change Cover Picture"
                component="span"
                sx={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  color: "#6200E8",
                  backgroundColor: "white",
                  border: "1px solid #E2D7F0",
                  borderRadius: "50%",
                }}
              >
                <LocalSeeIcon fontSize="small" />
              </IconButton> */}
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">
                {user.firstName} {user.lastName}
              </h4>
              <span className="profileInfoDesc">{user?.desc}</span>
            </div>
          </div>
          <div className="profileRightBottom">
            <Feed firstName={firstName} onProfile={true} />
            <Rightbar user={user} />
          </div>
        </div>
      </div>
    </>
  );
}
