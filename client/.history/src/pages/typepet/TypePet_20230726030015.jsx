import { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router";
import "./typepet.css";
import { Grid } from "@material-ui/core";

const path = process.env.REACT_APP_PATH_ID;

export default function TypePet(props) {
  const [typePets, setTypePets] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const getTypePets = async () => {
      try {
        const res = await axios.get("/api/typePets");
        setTypePets(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getTypePets();
  }, []);

  const handleSelect = (typePetId) => {
    if (selectedTypes.includes(typePetId)) {
      setSelectedTypes((prevState) =>
        prevState.filter((id) => id !== typePetId)
      );
    } else {
      setSelectedTypes((prevState) => [...prevState, typePetId]);
    }
  };

  const isButtonPressed = (typePetId) => selectedTypes.includes(typePetId);

  console.log(selectedTypes);

  const handleSubmit = async (e) => {
    try {
      const userId = localStorage.getItem("Uid");
      // const userId = props.location.state.user.id; // get the user ID from the props
      console.log(userId);
      await axios.put(`${path}/api/users/${userId}/typePets`, {
        typePets: selectedTypes,
      });
      setSelectedTypes([]);
      localStorage.removeItem("Uid");
      history.push("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="typePet">
      <Grid container spacing={2} className="typePetContainer">
        <div className="typePetContainerCard">
          <h1>What type of pet are you interested in?</h1>
          <p>( you can choose more than 1 type )</p>
          <Grid container spacing={1}>
            {typePets.map((typePet, index) =>
              typePet.status !== false ? (
                <Grid item key={index} xs={12} sm={12} md={12} lg={4}>
                  <div
                    className="typePetCard"
                    style={{ backgroundImage: `url(${typePet.imgPet})` }}
                  >
                    <div className="typePetCardBody">
                      <button
                        className={`typePetButton ${
                          isButtonPressed(typePet.nameType) ? "pressed" : ""
                        }`}
                        onClick={() => handleSelect(typePet.nameType)}
                      >
                        {isButtonPressed(typePet.nameType) ? (
                          <>
                            <span className="checkmark">&#10003;</span>
                            <span className="typePetButtonText">
                              {typePet.nameType}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="plusSymbol">+</span>
                            <span className="typePetButtonText">
                              {typePet.nameType}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Grid>
              ) : null
            )}
          </Grid>
          <button className="typePetButtonSubmit" onClick={handleSubmit}>
            Next
          </button>
        </div>
      </Grid>
    </div>
  );
}
