import "./post.css";
import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { NestedModal, ReportModal } from "../modelEdit/ModalEdit";

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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReportIcon from '@mui/icons-material/Report';
import { MoreVert, FavoriteBorder, Favorite, Comment, MoreHoriz } from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
// import ReactPlayer from 'react-player';
import ReactPlayer from 'react-player/lazy';
import ReactLoading from 'react-loading';

export default function Post({ post, onPostUpdate, indexPost }) {
  const { user } = useContext(AuthContext);
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsData, setCommentsData] = useState([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElComment, setAnchorElComment] = useState(null);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);
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

  //++++++++++++++++++ fetch Data +++++++++++++++++++
  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser.member_id));
  }, [currentUser.member_id, post.likes]);

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchUserPost = async () => {
      try {
        const res = await axios.get(`api/users/GETuser/${post.member_id}`);
        const userData = res.data;
        // console.log('User=',userData[0]);
        setdataPUser(userData[0]);
      } catch (err) {
        // Handle error
        console.error("Failed to fetch user data:", err);
      }
    };
    const fetchComments = async () => {
      try {
        const resComments = await axios.get(`/api/comments/${post.id}/comments`);
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

    return () => {
      source.cancel('Component unmounted');
    };
  }, [post.member_id, post.id]);
  
  useEffect(() => {
    if (showComments) {
      const fetchData = async () => {
        const promises = comments.map((comment) => {
          return axios.get(`/api/users/GETuser/${comment.memberId}`);
        });
  
        try {
          const responses = await Promise.all(promises);
          const commentUsers = responses.map((res) => res.data);
          setCommentsData(commentUsers[0]);
          setLoadingComment(true);
        } catch (err) {
          console.log(err);
        } finally {
          setLoadingComment(false);
        } 
      };
  
      fetchData();
    } else {
      // Clear commentsData when showComments is false
      setCommentsData([]);
    }
  }, [comments, showComments]);  
  
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
    setOpenModal(true);
    handleClose();
  };
  
  const handleReportPost = () => {
    setdataEdit(post);
    setdataEdit("")
    setOpenReportModal(true);
    handleClose();
  };
  
  const handlePostUpdate = (updatedPost) => {
    if (typeModal === 'Post') {
      // Handle updated post
      // ...
    } else if (typeModal === 'Comment') {
      // Handle updated comment separately
      const updatedCommentIndex = comments.findIndex((comment) => comment.id === updatedPost.id);

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
    } else {
      console.log('Err Edit Type');
    }
  };
  
  const handleDeletePost = async () => {
    const requestBody = {
      member_id: currentUser.member_id
    };
    
    try {
      const response = await axios.delete(`/api/posts/${post.id}`, { data: requestBody });
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
    const isImage = post.title === 'image';
  
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
          <SortableItem key={index} item={item} index={index} containerRef={containerRef} />
        ))}
      </div>
    );
  });
  
  //Comment-------------------------------------------
  
  const handleClickComment = (event, id) => {
    setAnchorElComment(event.currentTarget);
    const comment = comments.find(c => c.id === id);
    console.log(comment)
    setdataEdit(comment);
    setCommentIdToDelete(id);
  };  
  
  
  const handleCloseComment = () => {
    setAnchorElComment(null);
  };

  const handleEditComment = (id) => {
    const comment = comments.find(c => c.id === id);
    setdataEdit(comment);
    setdataEditID(id);
    setTypeModal("Comment")
    setOpenModal(true);
    handleCloseComment();
  };

  const handleDeleteComment = async (commentId) => {
    console.log(`Delete Comment ${commentId}`);
    const requestBody = {
      member_id: currentUser.member_id
    };
  
    try {
      const response = await axios.delete(`/api/comments/${post.id}/comments/${commentId}`, { data: requestBody });
      const message = response.data.message;
      // Handle the response message here
      console.log(message);
  
      // Fetch the updated comments after deleting the comment
      const resComments = await axios.get(`/api/comments/${post.id}/comments`);
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
      setTypeModal("Add Comment")
      
      setOpenModal(true);
  };
  
  //Like ------------------------------------------------

  const likeHandler = async () => {
    try {
      await axios.put(`/api/posts/${post.id}/like`, { member_id: currentUser.member_id });
    } catch (err) {
      console.log(err);
    }

    if (isLiked) {
      setLike(like - 1);
    } else {
      setLike(like + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className="post" key={indexPost}>
      <Card className="postWrapper">
        <CardHeader
          avatar={
            <Link to={`/profile/${dataPUser.firstName}`}>
              <Avatar aria-label="recipe" src={dataPUser.profilePicture} style={{ width: '39px', height: '39px' }}>
              </Avatar>
            </Link>
          }
          title={`${dataPUser.firstName} ${dataPUser.lastName}`}
          subheader={formattedDate}
          action={
            [
              <IconButton key="more" onClick={handleClick}>
                <MoreHoriz fontSize="small"/>
              </IconButton>,
              <Menu
                key="menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                keepMounted
              >
                {dataPUser.member_id === user.member_id ? [
                  <MenuItem key="edit" onClick={handleEditPost}>
                    <span><EditIcon fontSize="small"/></span>
                    <span>Edit</span>
                  </MenuItem>,
                  <MenuItem key="delete" onClick={handleDeletePost}>
                    <span><DeleteIcon fontSize="small"/></span>
                    <span>Delete</span>
                  </MenuItem>
                ] : (
                  <MenuItem key="report" onClick={handleReportPost}>
                    <span><ReportIcon fontSize="small"/></span>
                    <span>Report Post</span>
                  </MenuItem>
                )}
              </Menu>
            ]
          }          
        />
       <CardContent>
        <Typography variant="body1" className="postText">
          <span>{post?.content}</span>
        </Typography>
        <Typography variant="body2" className="postText">
          {post?.tagpet.map((pet, i) => (
            <span>
              <Chip key={i} label={`#${pet}`} className="postChip" style={{ color: '#6200E8' }}/>
            </span>
          ))}
        </Typography>
        <SortableList
          items={post.img.map((item) => ({
            type: item.endsWith('.mp4') ? 'video' : 'image',
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
                  <Favorite className="likeIcon" style={{ color: '#6200E8' }} />
                </IconButton>
              ) : (
                <IconButton aria-label="add to favorites" onClick={likeHandler}>
                  <FavoriteBorder className="likeIcon" style={{ color: '#6200E8' }} />
                </IconButton>
              )}
              <span className="postLikeCounter">{like} people like it</span>
            </CardActions>
          </div>
          <div className="postBottomRight">
            <CardActions disableSpacing>
              <IconButton
                aria-label="show more"
                sx={{ color: '#6200E8',  right: 14 }}
                onClick={() => setShowComments(!showComments)}
              >
                <Comment />
                <p className="postCommentText" underline="none">
                  <span>
                    {comments.length} comments
                   </span>
                </p>
              </IconButton>
            </CardActions>
          </div>
        </div>
        <Collapse in={showComments} timeout="auto" unmountOnExit>
        <hr className="PostHr" />
        {loadingComment ? (
          <div className="loadingWrapper">
            <ReactLoading type="spin" color="#6200E8" height={'10%'} width={'10%'} />
          </div>
          ) : (
          <CardContent>
            <Typography paragraph>Comments</Typography>
            {comments.slice(0, showAllComments ? comments.length : maxDisplayedComments).map((comment, index) => {
              const commentData = commentsData.find(data => data.member_id === comment.memberId);
              return (
                <div key={index} className="postComment">
                  <div className="postCommentProfile">
                    <CardHeader
                      avatar={
                        <Avatar
                          aria-label="recipe"
                          src={commentData?.profilePicture}
                          sx={{ width: '39px', height: '39px' }}
                        />
                      }
                      title={`${commentData?.firstName} ${commentData?.lastName}`}
                      subheader={`${comment.content}`}
                      action={
                        <>
                          <IconButton onClick={(event) => handleClickComment(event, comment.id)}>
                            <MoreHoriz fontSize="small"/>
                          </IconButton>
                        </>
                      }
                    />
                    <Menu
                      anchorEl={anchorElComment}
                      open={Boolean(anchorElComment)}
                      onClose={handleCloseComment}
                    >
                    {comment.memberId === user.member_id ? [
                      <MenuItem key="edit"  onClick={() => handleEditComment(commentIdToDelete)}>
                        <span><EditIcon fontSize="small"/></span>
                        <span>Edit</span>
                      </MenuItem>,
                      <MenuItem key="delete"  onClick={() => handleDeleteComment(commentIdToDelete)}>
                        <span><DeleteIcon fontSize="small"/></span>
                        <span>Delete</span>
                      </MenuItem>
                    ] : (
                      <MenuItem key="report" onClick={handleReportPost}>
                        <span><ReportIcon fontSize="small"/></span>
                        <span>Report Post</span>
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
            <Button
              variant="contained"
              onClick={() => submitComment(post.id, newCommentText, user.member_id)}
            >
              Comment
            </Button>
          </CardContent>
          )}
        </Collapse>
      </Card>
      {openModal && (
        <NestedModal 
          key={post?.id}
          onClose={() => setOpenModal(false)} 
          onContent={dataEdit} 
          onTitle={typeModal} 
          userId={currentUser?.member_id}
          onContentID={post?.id}
          onCommentsID={dataEditID}
          onLoading={true}
          isAddComment={""}
          onPostUpdate={handlePostUpdate}
        />
      )}
      {openReportModal && (
        <ReportModal 
          key={post?.id}
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
