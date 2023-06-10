import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import ReactLoading from "react-loading";
import io from "socket.io-client";

export default function Feed({ firstName, onProfile }) {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const source = axios.CancelToken.source();
    const socket = io.connect(process.env.PATH_ID); // Fix the environment variable name

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/posts/${user.member_id}/date`, {
          cancelToken: source.token,
        });
        const sortedPosts = res.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setPosts(sortedPosts);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled:", err.message);
        } else {
          console.log(err);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/posts/user/${firstName}/date`);
        // const sortedPosts = res.data.sort((a, b) => {
        //   const date1 = new Date(a.createdAt);
        //   const date2 = new Date(b.createdAt);
        //   return date2.getTime() - date1.getTime();
        // });
        // setPosts(sortedPosts);
        setPosts()
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const handleNewPost = (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    };

    if (onProfile) {
      fetchUserPosts();
    } else {
      fetchPosts();
    }

    socket.on("newPost", handleNewPost);

    return () => {
      source.cancel("Component unmounted");
      console.log("Component unmounted", source);
      socket.off("newPost", handleNewPost);
      socket.disconnect();
    };
  }, [onProfile, firstName, user.member_id]);

  return (
    <div className="feed">
      <div className="feedWrapper">
        {!firstName || firstName === user?.firstName ? <Share /> : null}
        {loading ? (
          <div className="loadingWrapper">
            <ReactLoading
              type="spin"
              color="#6200E8"
              height={"10%"}
              width={"10%"}
            />
          </div>
        ) : (
          <>
            {posts.map((p, i) => (
              <Post key={i} post={p} indexPost={i} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
