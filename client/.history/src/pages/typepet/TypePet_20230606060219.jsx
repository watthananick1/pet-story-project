import { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router";
import "./typepet.css";
import { Grid } from "@material-ui/core";

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
      await axios.put(`/api/users/${userId}/typePets`, {
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
          {typePets.map((typePet) =>
            typePet.status !== false ? (
              <Grid item key={typePet.id_TypePet} xs={12} sm={6} md={4} lg={3}>
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
          <button className="typePetButtonSubmit" onClick={handleSubmit}>
            Next
          </button>
        </div>
      </Grid>
    </div>
  );  
}