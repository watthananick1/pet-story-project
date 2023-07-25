import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import ReactLoading from "react-loading";
import io from "socket.io-client";
import Cookies from "js-cookie";

const path = process.env.REACT_APP_PATH_ID;

export default function Feed({ firstName, onProfile }) {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("token");

  useEffect(() => {
    const source = axios.CancelToken.source();
    const socket = io.connect(process.env.PATH_ID); // Fix the environment variable name
    const fetchPosts = async () => {
      try {
        const currentTime = new Date().getTime();
        setLoading(true);
        const res = await axios.get(`${path}/api/posts/${user.member_id}/date`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cancelToken: source.token,
        });
        const sortedPosts = res.data.sort((a, b) => {
          const timeDiffA = Math.abs(
            currentTime - new Date(a.createdAt.seconds * 1000).getTime()
          );
          const timeDiffB = Math.abs(
            currentTime - new Date(b.createdAt.seconds * 1000).getTime()
          );
          return timeDiffA - timeDiffB;
        });
        setPosts(sortedPosts);
      } catch (err) {
        if (axios.isCancel(err)) {
          //console.log("Request canceled:", err.message);
        } else {
          console.log(err);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const currentTime = new Date().getTime();

        setLoading(true);
        const res = await axios.get(`${path}/api/posts/user/${firstName}/date`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const sortedPosts = res.data.sort((a, b) => {
          const timeDiffA = Math.abs(
            currentTime - new Date(a.createdAt.seconds * 1000).getTime()
          );
          const timeDiffB = Math.abs(
            currentTime - new Date(b.createdAt.seconds * 1000).getTime()
          );
          return timeDiffA - timeDiffB;
        });
        setPosts(sortedPosts);
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
              <Post key={i} isPost={p} indexPost={i} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
