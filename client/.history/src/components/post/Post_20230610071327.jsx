import "./post.css";
import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { NestedModal, ReportModal } from "../modelEdit/ModalEdit";
import io from "socket.io-client";

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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReportIcon from "@mui/icons-material/Report";
import {
  MoreVert,
  FavoriteBorder,
  Favorite,
  Comment,
  MoreHoriz,
} from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
// import ReactPlayer from 'react-player';
import ReactPlayer from "react-player/lazy";
import ReactLoading from "react-loading";

export default function Post({ isPost, onPostUpdate, indexPost }) {
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(isPost);
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsData, setCommentsData] = useState([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
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
  const [typeModal, setTypeModal] = useState("Post");
  const containerRef = useRef(null);
  const [dataEdit, setdataEdit] = useState([]);
  const [dataPUser, setdataPUser] = useState({});
  const [dataEditID, setdataEditID] = useState(null);
  const [isAddComment, setIsAddComment] = useState(false);
  const createdAt = new Date(post.createdAt.seconds * 1000);
  const formattedDate = format(createdAt);
  const socket = io.connect(process.env.PATH_ID);

  //++++++++++++++++++ fetch Data +++++++++++++++++++
  useEffect(() => {
    // Set initial isLiked state
    setIsLiked(post.likes.includes(currentUser.member_id));

    // Listen for newLike events and update isLiked state
   // Listen for newLike event from the server
  socket.on("newLike", (likeData) => {
    // Update the local state variables based on the received data
    if (likeData.id === post.id) {
      setPost(likeData);
    }
  });
    // Cleanup socket connection
    return () => {
      socket.off("newLike");
      socket.disconnect();
    };
  }, [currentUser.member_id, post.id]);

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchUserPost = async () => {
      try {
        const res = await axios.get(`api/users/GETuser/${post.member_id}`);
        const userData = res.data;
        // console.log("User=", userData[0]);
        setdataPUser(userData[0]);
      } catch (err) {
        // Handle error
        console.error("Failed to fetch user data:", err);
      }
    };
    const fetchComments = async () => {
      try {
        const resComments = await axios.get(
          `/api/comments/${post.id}/Comments`
        );
        setComments(resComments.data);
        setLoadingComment(true);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingComment(false);
      }
    };

    fetchUserPost();
    fetchComments();
    handlePostUpdate(onPostUpdate);

    return () => {
      source.cancel("Component unmounted");
    };
  }, [post.member_id, post.id, showComments]);

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
      // Handle updated post

      post = { ...post, ...updatedPost };
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
      console.log("Invalid type: ", type);
    }
  };

  const handleDeletePost = async () => {
    const requestBody = {
      member_id: currentUser.member_id,
    };

    try {
      const response = await axios.delete(`/api/posts/${post.id}`, {
        data: requestBody,
      });
      const message = response.data.message;
      // Handle the response message here
      console.log(message);
      window.location.reload();
      handleClose();
    } catch (err) {
      console.log(err);
    }
  };

  //ITEM OF POST ----------------------------------------------

  const SortableItem = SortableElement(({ item, containerRef }) => {
    const isImage = post.title === "image";

    if (isImage) {
      return (
        <div className="shareImgItem">
          <img src={item.url} alt="Gallery Image" className="shareImg" />
        </div>
      );
    } else {
      return (
        <div className="shareVideoItem">
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
  });

  const SortableList = SortableContainer(({ items }) => {
    return (
      <div className="shareImgContainer" ref={containerRef}>
        {items.map((item, index) => (
          <SortableItem
            key={index}
            item={item}
            index={index}
            containerRef={containerRef}
          />
        ))}
      </div>
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
    console.log(comment);
    setdataEdit(comment);
    setdataEditID(commentIdToDelete);
    setTypeModal("Comment");
    setOpenModal(true);
    handleCloseComment();
  };

  const handleDeleteComment = async () => {
    console.log(`Delete Comment ${commentIdToDelete}`);
    const requestBody = {
      member_id: currentUser.member_id,
    };

    try {
      const response = await axios.delete(
        `/api/comments/${post.id}/comments/${commentIdToDelete}`,
        { data: requestBody }
      );
      const message = response.data.message;
      // Handle the response message here
      console.log(message);

      // Fetch the updated comments after deleting the comment
      const resComments = await axios.get(`/api/comments/${post.id}/Comments`);
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

  //Like ------------------------------------------------

  const likeHandler = async () => {
    try {
      // Send a PUT request to update the likes for the post
      const res = await axios.put(`/api/posts/${post.id}/like`, {
        member_id: currentUser.member_id,
      });

      // Emit a newLike event to the server
      
      socket.emit("newLike", res.data);
    } catch (err) {
      console.log(err);
    }
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
          title={`${post?.firstName} ${post?.lastName}`}
          subheader={formattedDate}
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
              {dataPUser.member_id === user.member_id ? (
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
          <Typography variant="body2" className="postText">
            {post?.tagpet.map((pet, i) => (
              <span>
                <Chip
                  key={i}
                  label={`#${pet}`}
                  className="postChip"
                  style={{ color: "#6200E8" }}
                />
              </span>
            ))}
          </Typography>
          <SortableList
            items={post.img.map((item) => ({
              type: item.endsWith(".mp4") ? "video" : "image",
              url: item,
            }))}
            axis="xy"
          />
        </CardContent>
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
