import "./post.css";
import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import NestedModal from "../modelEdit/ModalEdit";


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
import { MoreVert, FavoriteBorder, Favorite, Comment} from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
// import ReactPlayer from 'react-player';
import ReactPlayer from 'react-player/lazy';
import ReactLoading from 'react-loading';

export default function Post({ post, onPostUpdate }) {
  const { user } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [updatedContent, setUpdatedContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
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
  const [typeModal, setTypeModal] = useState("Post");
  const containerRef = useRef(null);
  const [dataEdit, setdataEdit] = useState([]);
  const [dataEditID, setdataEditID] = useState(null);

  const createdAt = new Date(post.createdAt.seconds * 1000);
  const formattedDate = format(createdAt);

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser.member_id));
  }, [currentUser.member_id, post.likes]);

  useEffect(() => {
    const source = axios.CancelToken.source();

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
    
    fetchComments();

    return () => {
      source.cancel('Component unmounted');
    };
  }, [post.member_id, post.id]);
  
  useEffect(() => {
    if (showComments) {
      const fetchData = async () => {
        const promises = comments.map((comment) => {
          return axios.get(`/api/users?member_id=${comment.memberId}&firstName=`);
        });
  
        try {
          const responses = await Promise.all(promises);
          const commentUsers = responses.map((res) => res.data);
          setCommentsData(commentUsers);
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
  
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    
    const handleClickComment = (event, id) => {
      setAnchorElComment(event.currentTarget);
      const comment = comments.find(c => c.id === id);
      console.log(comment)
      setdataEdit(comment);
      setCommentIdToDelete(id); // Store the comment ID in the state
    };  
  
    const handleClose = () => {
      setAnchorEl(null);
    };
    
    const handleCloseComment = () => {
      setAnchorElComment(null);
    };
  
    const handleEditPost = () => {
      setdataEdit(post);
      setOpenModal(true);
      handleClose();
    };
    
    const handleEditComment = (id) => {
      const comment = comments.find(c => c.id === id);
      setdataEdit(comment);
      setdataEditID(id);
      setTypeModal("Comment")
      setOpenModal(true);
      handleCloseComment();
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
          {/* <ReactPlayer 
            url={item.url} 
            className="shareVideo" 
            width="640"
            height="360" 
            controls={true}
            // playing={true}
          /> */}
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

  const submitComment = async () => {
    try {
      // Submit the comment
      await axios.post(`/api/comments/${post.id}/comments`, {
        content: newCommentText,
        member_id: currentUser.member_id,
      });
  
      // Clear the comment input field
      setNewCommentText("");
      
      // Clear the edited comment state
      // setEditedComment(null);
  
      // Fetch the updated comments
      const resComments = await axios.get(`/api/comments/${post.id}/comments`);
      setComments(resComments.data);
    } catch (err) {
      console.log(err);
    }
  };
  
  
  return (
    <div className="post">
      <Card className="postWrapper">
        <CardHeader
          avatar={
            <Link to={`/profile/${user.firstName}`}>
              <Avatar aria-label="recipe" src={user.profilePicture} style={{ width: '39px', height: '39px' }}>
              </Avatar>
            </Link>
          }
          title={`${user.firstName} ${user.lastName}`}
          subheader={formattedDate}
          action={
            <>
              <IconButton onClick={handleClick}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                keepMounted
              >
                <MenuItem onClick={handleEditPost}>
                  <span><EditIcon /></span>
                  <span>Edit</span>
                </MenuItem>
                <MenuItem 
                  onClick={handleDeletePost} 
                >  
                <span><DeleteIcon /></span>
                <span>Delete</span>
                </MenuItem>
              </Menu>
            </>
          }
        />
       <CardContent>
        <Typography variant="body1" className="postText">
          <span>{post?.content}</span>
        </Typography>
        <Typography variant="body2" className="postText">
          {post?.tagpet.map((pet) => (
            <span>
              <Chip key={pet} label={`#${pet}`} className="postChip" style={{ color: '#6200E8' }}/>
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
                            <MoreVert />
                          </IconButton>
                        </>
                      }
                    />
                    <Menu
                      anchorEl={anchorElComment}
                      open={Boolean(anchorElComment)}
                      onClose={handleCloseComment}
                    >
                      <MenuItem onClick={() => handleEditComment(commentIdToDelete)}>
                        <span><EditIcon /></span>
                        <span>Edit</span>
                      </MenuItem>
                      <MenuItem 
                        onClick={() => handleDeleteComment(commentIdToDelete)}
                      >
                        <span><DeleteIcon /></span>
                        <span>Delete</span>
                      </MenuItem>
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
            <TextField
              label="Add a comment"
              variant="outlined"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              fullWidth
              style={{ color: isLiked ? 'inherit' : '#6200E8' }}
            />
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
          onPostUpdate={handlePostUpdate} // Pass the function here
        />
      )}
    </div>
  );
}
