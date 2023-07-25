import "./post.css";
import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { NestedModal, ReportModal } from "../modelEdit/ModalEdit";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import ReactPlayer from "react-player";
import Cookies from "js-cookie";
import { IMuiFbPhotoGridImage, MuiFbPhotoGrid } from "mui-fb-photo-grid";
import "mui-fb-photo-grid/dist/index.css";

import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Collapse,
  Typography,
  IconButton,
  Avatar,
  TextField,
  Button,
  Chip,
  Menu,
  MenuItem,
  Box,
  Grid,
  CardMedia,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReportIcon from "@mui/icons-material/Report";
import {
  FavoriteBorder,
  Favorite,
  Comment,
  MoreHoriz,
} from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";
// import ReactPlayer from 'react-player';
import ReactLoading from "react-loading";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();
const path = process.env.REACT_APP_PATH_ID;

export default function Post({ isPost, onPostUpdate, indexPost }) {
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(isPost);
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElComment, setAnchorElComment] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);
  const [commentIdUser, setCommentIdUser] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const maxDisplayedComments = 3;
  const { user: currentUser } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [statusAdmin, setStatusAdmin] = useState(false);
  const [typeModal, setTypeModal] = useState("Post");
  const containerRef = useRef(null);
  const [dataEdit, setdataEdit] = useState([]);
  const [dataEditID, setdataEditID] = useState(null);
  const [isAddComment, setIsAddComment] = useState(false);
  const createdAt = new Date(post.createdAt.seconds * 1000);
  const formattedDate = format(createdAt);
  const token = Cookies.get("token");
  const { message: messageUser, dispatch } = useContext(AuthContext);
  // const socket = io.connect(process.env.PATH_ID);

  //++++++++++++++++++ fetch Data +++++++++++++++++++

  async function newNotification(onType, onBody, onTitle) {
    const NotificationRef = firestore.collection("Notifications").doc();
    const NotificationID = NotificationRef.id;
    const newNotificationData = {
      id: NotificationID,
      type: onType,
      member_id: post.member_id,
      author_id: currentUser.member_id,
      name: `${user.firstName} ${user.lastName}`,
      profilePicture: user.profilePicture,
      timestamp: new Date(),
      title: onTitle,
      body: onBody,
      post_id: post.id,
      read: false,
    };

    await NotificationRef.set(newNotificationData);
  }

  useEffect(() => {
    setStatusAdmin(post.post_Status.includes("ADMIN"));
  }, [post.post_Status]);

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser.member_id));
  }, [currentUser.member_id, post.likes]);

  //Like ------------------------------------------------

  const likeHandler = async () => {
    try {
      await axios.put(`${path}/api/posts/${post.id}/like`, {
        member_id: currentUser.member_id,
      });
    } catch (err) {
      console.log(err);
    } finally {
    }

    if (isLiked) {
      setLike(like - 1);
    } else {
      setLike(like + 1);
      newNotification("LIKE", "liked your post.", "like post");
    }
    setIsLiked(!isLiked);
  };

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchComments = async () => {
      try {
        const resComments = await axios.get(
          `${path}/api/comments/${post.id}/Comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setComments(resComments.data);
        setLoadingComment(true);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingComment(false);
      }
    };

    fetchComments();
    handlePostUpdate(onPostUpdate);

    return () => {
      source.cancel("Component unmounted");
    };
  }, [post.member_id, post.id, showComments]);

  useEffect(() => {
    const postRef = firestore.collection("Posts").doc(post.id);
    let unsubscribeUser;

    const unsubscribePost = postRef.onSnapshot((postSnapshot) => {
      const updatedPost = postSnapshot.data();

      const userRef = firestore
        .collection("Users")
        .where("member_id", "==", updatedPost.member_id);

      unsubscribeUser = userRef.onSnapshot((userSnapshot) => {
        if (!userSnapshot.empty) {
          userSnapshot.docs.forEach((userDoc) => {
            const userData = userDoc.data();
            setPost((prevPost) => ({
              ...prevPost,
              firstName: userData.firstName,
              lastName: userData.lastName,
              profilePicture: userData.profilePicture,
            }));
          });
          setLike(updatedPost.likes.length);
          setIsLiked(updatedPost.likes.includes(currentUser.member_id));
        } else {
          // Handle case when no user document matches the query
          console.log("No matching user document found.");
        }
      });
    });

    return () => {
      unsubscribePost();
      unsubscribeUser();
    };
  }, [
    post.id,
    post.likes,
    currentUser.member_id,
    firestore,
    dispatch,
    messageUser,
    setLike,
    setIsLiked,
    setPost,
  ]);

  // console.log("Comments=", comments);

  //++++++++++ on Click Button +++++++++++

  //Post----------------------------------------------------

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditPost = () => {
    setdataEdit(post);
    setdataEditID(post.id);
    setTypeModal("Post");
    setOpenModal(true);
    handleClose();
  };

  const handleReportPost = () => {
    setdataEdit(post);
    setdataEdit("");
    setOpenReportModal(true);
    handleClose();
  };

  const handleReportUser = () => {
    setdataEdit(post);
    setdataEdit("");
    setOpenReportModal(true);
    handleClose();
  };

  const handlePostUpdate = (updatedPost, type) => {
    if (type === "Post") {
      setPost({ ...post, ...updatedPost });
    } else if (type === "Comment") {
      const updatedCommentIndex = comments.findIndex(
        (comment) => comment.id === updatedPost.id
      );

      if (updatedCommentIndex === -1) {
        // Comment is not present in the comments array, add it
        setComments((prevComments) => [...prevComments, updatedPost]);
      } else {
        // Comment is already present, update it
        setComments((prevComments) => {
          const updatedComments = [...prevComments];
          updatedComments[updatedCommentIndex] = updatedPost;
          return updatedComments;
        });
      }
    } else if (type === "Add Comment") {
      // Handle added comment
      setComments((prevComments) => [...prevComments, updatedPost]);
    } else {
      // console.log("Invalid type: ", type);
    }
  };

  const handleDeletePost = async () => {
    const requestBody = {
      member_id: currentUser.member_id,
    };

    try {
      const response = await axios.delete(`${path}/api/posts/${post.id}`, {
        data: requestBody,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //const message = response.data.message;
      // Handle the response message here
      //console.log(message);
      window.location.reload();
      handleClose();
    } catch (err) {
      console.log(err);
    }
  };

  //ITEM OF POST ----------------------------------------------

  const SortableList = SortableContainer(({ items }) => {
    
    // console.log(items)
  
    const setImage = (image) => ({
      title: image.title,
      img: image.url,
      imgThumbnail: image.url,
    });

    const ONE = [];
    if (items.length >= 1 && items[0]) {
      ONE.push([setImage(items[0])]);
    }

    const TWO = [];
    if (items.length >= 2 && items[0] && items[1]) {
      TWO.push([setImage(items[0]), setImage(items[1])]);
    }

    const THREE = [];
    if (items.length >= 3 && items[0] && items[1] && items[2]) {
      THREE.push([setImage(items[0]), setImage(items[1]), setImage(items[2])]);
    }

    const FOUR = [
      ...THREE.map((group) => {
        const updatedGroup = [...group];
        if (items.length >= 5 && items[4]) {
          updatedGroup.push(setImage(items[4]));
        }
        return updatedGroup;
      }),
    ];

    const FIVE = [
      ...FOUR.map((group) => {
        const updatedGroup = [...group];
        if (items.length >= 6 && items[5]) {
          updatedGroup.push(setImage(items[5]));
        }
        return updatedGroup;
      }),
    ];

    const MORE = [
      ...THREE.map((group) => {
        const updatedGroup = [...group];
        if (items.length >= 7 && items[4] && items[5] && items[6]) {
          updatedGroup.push(
            setImage(items[4]),
            setImage(items[5]),
            setImage(items[6])
          );
        }
        return updatedGroup;
      }),
    ];

    const GROUP_NUM_IMAGE = Array.from({ length: items.length }, (_, i) => {
      switch (i + 1) {
        case 1:
          return ONE;
        case 2:
          return TWO;
        case 3:
          return THREE;
        case 4:
          return FOUR;
        case 5:
          return FIVE;
        default:
          return MORE;
      }
    });

    return (
      <Box style={{ "& > *": { height: "100%", width: "100%" } }}>
        {items.map((item, index) => {
          const isImage = item.type === "image"? true : false;
          
          // console.log(isImage)
          // console.log(item.type)

          if (isImage) {
            const imageCount = Math.min(items.length, GROUP_NUM_IMAGE.length);
            const images = GROUP_NUM_IMAGE[imageCount - 1];

            return (
              <div key={index}>
                {index === 0 && ( // เพิ่มเงื่อนไขตรวจสอบว่าเป็นรอบแรก
                  <MuiFbPhotoGrid
                    images={images[0]}
                    style={{ width: "100%" }}
                    reactModalStyle={{ overlay: { zIndex: 2000 } }}
                  />
                )}
              </div>
            );
          } else {
            return (
              <div key={index}>
                <ReactPlayer
                  url={item.url}
                  className="shareVideo"
                  width="640"
                  height="360"
                  controls
                  onClick={(event) => event.preventDefault()}
                />
              </div>
            );
          }
        })}
      </Box>
    );
  });

  //Comment-------------------------------------------

  const handleClickComment = (event, id) => {
    setAnchorElComment(event.currentTarget);
    const comment = comments.find((c) => c.id === id);
    // console.log(comment)
    setdataEdit(comment);
    setCommentIdUser(comment.memberId);
    setCommentIdToDelete(id);
  };

  const handleCloseComment = () => {
    setAnchorElComment(null);
  };

  const handleEditComment = () => {
    const comment = comments.find((c) => c.id === commentIdToDelete);
    //console.log(comment);
    setdataEdit(comment);
    setdataEditID(commentIdToDelete);
    setTypeModal("Comment");
    setOpenModal(true);
    handleCloseComment();
  };

  const handleDeleteComment = async () => {
    //console.log(`Delete Comment ${commentIdToDelete}`);
    const requestBody = {
      member_id: currentUser.member_id,
    };

    try {
      const response = await axios.delete(
        `${path}/api/comments/${post.id}/comments/${commentIdToDelete}`,
        {
          data: requestBody,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const message = response.data.message;
      // Handle the response message here
      //console.log(message);

      // Fetch the updated comments after deleting the comment
      const resComments = await axios.get(`${path}/api/comments/${post.id}/Comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComments(resComments.data);

      handleClose();
      setLoadingComment(true);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingComment(false);
      handleClose();
    }
  };

  const submitComment = () => {
    setTypeModal("Add Comment");
    setdataEdit("");
    setIsAddComment(true);
    setOpenModal(true);
  };

  return (
    <div className="post" key={indexPost}>
      <Card className="postWrapper">
        <CardHeader
          avatar={
            <Link to={`/profile/${post.firstName}`}>
              <Avatar
                aria-label="recipe"
                src={post?.profilePicture}
                style={{ width: "39px", height: "39px" }}
              ></Avatar>
            </Link>
          }
          title={<>{`${post?.firstName} ${post?.lastName}`}</>}
          subheader={
            <>
              {formattedDate}{" "}
              {statusAdmin ? (
                <span>
                  <Chip
                    label={`Admin`}
                    className="postChip"
                    style={{ backgroundColor: "#0912DE", color: "white" }}
                  />
                </span>
              ) : null}
            </>
          }
          action={[
            <IconButton key="more" onClick={handleClick}>
              <MoreHoriz fontSize="small" />
            </IconButton>,
            <Menu
              key="menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              keepMounted
            >
              {post?.firstName === user.firstName ? (
                [
                  <MenuItem key="edit" onClick={handleEditPost}>
                    <span>
                      <EditIcon fontSize="small" />
                    </span>
                    <span>Edit</span>
                  </MenuItem>,
                  <MenuItem key="delete" onClick={handleDeletePost}>
                    <span>
                      <DeleteIcon fontSize="small" />
                    </span>
                    <span>Delete</span>
                  </MenuItem>,
                ]
              ) : (
                <MenuItem key="report" onClick={handleReportPost}>
                  <span>
                    <ReportIcon fontSize="small" />
                  </span>
                  <span>Report Post</span>
                </MenuItem>
              )}
            </Menu>,
          ]}
        />
        <CardContent>
          <Typography variant="body1" className="postText">
            <span>{post?.content}</span>
          </Typography>
          <Typography variant="body2" style={{ width: "100%", alignItems: "right", display: "flex", justifyContent: "flex-start"}}>
            {post?.tagpet.map((pet, i) => (
              <span>
                <Chip
                  key={i}
                  label={`#${pet}`}
                  // className="postChip"
                  sx={{ color: "#6200E8", m: 0.5 }}
                />
              </span>
            ))}
          </Typography>
        </CardContent>
        <CardMedia component="div" style={{ width: "100%" }}>
          <SortableList
            items={post.img.map((item) => ({
              type: post.title,
              url: item,
            }))}
            axis="xy"
          />
        </CardMedia>
        <hr className="PostHr" />
        <div className="postBottom">
          <div className="postBottomLeft">
            <CardActions disableSpacing>
              {isLiked ? (
                <IconButton aria-label="add to favorites" onClick={likeHandler}>
                  <Favorite className="likeIcon" style={{ color: "#6200E8" }} />
                </IconButton>
              ) : (
                <IconButton aria-label="add to favorites" onClick={likeHandler}>
                  <FavoriteBorder
                    className="likeIcon"
                    style={{ color: "#6200E8" }}
                  />
                </IconButton>
              )}
              <span className="postLikeCounter">{like} people like it</span>
            </CardActions>
          </div>
          <div className="postBottomRight">
            <CardActions disableSpacing>
              <IconButton
                aria-label="show more"
                sx={{ color: "#6200E8", right: 14 }}
                onClick={() => setShowComments(!showComments)}
              >
                <Comment />
                <p className="postCommentText" underline="none">
                  <span>{comments.length} comments</span>
                </p>
              </IconButton>
            </CardActions>
          </div>
        </div>
        <Collapse in={showComments} timeout="auto" unmountOnExit>
          <hr className="PostHr" />
          {loadingComment ? (
            <div className="loadingWrapper">
              <ReactLoading
                type="spin"
                color="#6200E8"
                height={"10%"}
                width={"10%"}
              />
            </div>
          ) : (
            <CardContent>
              <Typography paragraph>Comments</Typography>
              {comments
                .slice(
                  0,
                  showAllComments ? comments.length : maxDisplayedComments
                )
                .map((comment, index) => {
                  return (
                    <div key={index} className="postComment">
                      <div className="postCommentProfile">
                        <CardHeader
                          avatar={
                            <Avatar
                              aria-label="recipe"
                              src={comment?.profilePicture}
                              sx={{ width: "39px", height: "39px" }}
                            />
                          }
                          title={`${comment?.firstName} ${comment?.lastName}`}
                          subheader={`${comment.content}`}
                          action={
                            <>
                              <IconButton
                                onClick={(event) =>
                                  handleClickComment(event, comment.id)
                                }
                              >
                                <MoreHoriz fontSize="small" />
                              </IconButton>
                            </>
                          }
                        />
                        <Menu
                          anchorEl={anchorElComment || undefined} // Provide undefined if anchorElComment is null
                          open={Boolean(anchorElComment)}
                          onClose={handleCloseComment}
                        >
                          {user.member_id === commentIdUser ? (
                            [
                              <MenuItem key="edit" onClick={handleEditComment}>
                                <span>
                                  <EditIcon fontSize="small" />
                                </span>
                                <span>Edit</span>
                              </MenuItem>,
                              <MenuItem
                                key="delete"
                                onClick={handleDeleteComment}
                              >
                                <span>
                                  <DeleteIcon fontSize="small" />
                                </span>
                                <span>Delete</span>
                              </MenuItem>,
                            ]
                          ) : (
                            <MenuItem key="report" onClick={handleReportUser}>
                              <span>
                                <ReportIcon fontSize="small" />
                              </span>
                              <span>Report User</span>
                            </MenuItem>
                          )}
                        </Menu>
                      </div>
                    </div>
                  );
                })}
              {comments.length > maxDisplayedComments && (
                <Typography
                  className="showMoreComments"
                  variant="body2"
                  color="primary"
                  onClick={() => setShowAllComments(!showAllComments)}
                >
                  {showAllComments ? "Hide" : "Show More"} Comments
                </Typography>
              )}
              <Button variant="contained" onClick={() => submitComment()}>
                Comment
              </Button>
            </CardContent>
          )}
        </Collapse>
      </Card>
      {openModal && (
        <NestedModal
          key={indexPost}
          onClose={() => setOpenModal(false)}
          onContent={dataEdit}
          onTitle={typeModal}
          userId={currentUser?.member_id}
          onContentID={post?.id}
          onCommentsID={dataEditID}
          onLoading={true}
          isMember_id={post.member_id}
          isAddComment={isAddComment}
          onPostUpdate={(updatedComment) =>
            handlePostUpdate(updatedComment, typeModal)
          }
        />
      )}
      {openReportModal && (
        <ReportModal
          key={indexPost}
          onClose={() => setOpenReportModal(false)}
          onContent={dataEdit}
          onTitle={typeModal}
          userId={currentUser?.member_id}
          onContentID={post?.id}
          onCommentsID={dataEditID}
          onLoading={true}
          onPostUpdate={handlePostUpdate}
        />
      )}
    </div>
  );
}
