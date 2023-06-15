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
import FormDialogImage from "../../components/dialogModel/dialogModel";

export default function Profile() {
  const [user, setUser] = useState({});
  const { firstName } = useParams();
  const [open, setOpen] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const token = Cookies.get("token");
  const dataUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    setIsUser(firstName === dataUser?.firstName);
    // console.log("firstName", firstName);
    // console.log("UfirstName", dataUser.firstName);
  }, [firstName, dataUser]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/user/${firstName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res?.data[0]);
        console.log("data", res?.data[0]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, [firstName]);

  const Image = styled("div")(({ theme }) => ({
    position: "relative",
    b
    width: "100%",
    height: 250,
    backgroundImage: `url("${
      user.coverPicture ? user.coverPicture : "/assets/person/noCover.png"
    }")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    cursor: "pointer",
    "&:hover $ImageBackdrop": {
      opacity: 0,
    },
    "&:hover $ImageMarked": {
      opacity: 0,
    },
    "&:hover $ImageTitle": {
      border: "4px solid currentColor",
    },
  }));

  const ImageTitle = styled(Typography)(({ theme }) => ({
    position: "relative",
    padding: theme.spacing(2),
    fontWeight: "bold",
    color: theme.palette.common.white,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  }));

  const ImageBackdrop = styled("div")(({ theme }) => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create("opacity"),
  }));

  const ImageMarked = styled("span")(({ theme }) => ({
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity"),
  }));

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

  const handleClickOpen = () => {
    setOpen(true);
  };

  console.log(isUser);

  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <Image>
                <ImageTitle>
                  Change
                  <ImageMarked className="MuiImageMarked-root" />
                </ImageTitle>
                <ImageBackdrop className="ImageBackdrop" />
              </Image>
              {isUser ? (
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
                        onClick={handleClickOpen}
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
              ) : (
                <Avatar
                  className="profileUserImg"
                  alt="Profile Picture"
                  src={user.profilePicture || "/assets/person/noAvatar.png"}
                  style={{ width: "150px", height: "150px" }}
                />
              )}
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
          {open ? (
            <>
              <FormDialogImage onClose={() => setOpen(false)} />
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
