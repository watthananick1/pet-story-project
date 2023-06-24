import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

export default function ItemsList({
  onAvatar,
  onBody,
  onName,
  onTitle,
  onTime,
}) {
  return (
    // <MenuItem>
      <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt="Remy Sharp" src={onAvatar} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <React.Fragment>
                {onName}
                <Typography sx={{ m: 1 }} variant="caption" display="inline" gutterBottom>
                  {onTime}
                </Typography>
                <IconButton edge="end" aria-label="delete">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </React.Fragment>
            }
            secondary={
              <React.Fragment>
                <Typography
                  sx={{ display: "inline" }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {onBody}-{onTitle}
                </Typography>
              </React.Fragment>
            }
          />
        </ListItem>
        <Divider variant="inset" component="li" />
      </List>
    // </MenuItem>
  );
}
