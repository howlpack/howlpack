import { Avatar, Divider, IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const body = [
  "Just bought a new (de)NS path domain! Feeling good about it.",
  "Happy to announce my recent purchase of a (de)NS path domain.",
  "New domain alert! (de)NS path is now part of my online presence.",
  "Excited to have acquired a (de)NS path domain. Time to update my website!",
  "Purchased a (de)NS path domain and feeling content with the decision.",
  "Just expanded my online presence with a (de)NS path domain. It's a good day!",
  "Got myself a new (de)NS path domain. Happy to keep building my brand.",
  "Adding a (de)NS path domain to my collection. Feeling satisfied.",
  "Pleased to announce that I now own a (de)NS path domain. Let the website building begin!",
  "Acquired a (de)NS path domain and looking forward to seeing where it takes me.",
];

export default function HowlPreview({ name }: { name: string }) {
  const [display, setDisplay] = useState(false);

  return (
    <Fragment>
      <Typography
        variant="h6"
        sx={{
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        How your Howl message might look
        {display ? (
          <IconButton
            aria-label="hide"
            sx={{ ml: 1 }}
            onClick={() => setDisplay(false)}
          >
            <VisibilityOffIcon />
          </IconButton>
        ) : (
          <IconButton
            aria-label="show"
            sx={{ ml: 1 }}
            onClick={() => setDisplay(true)}
          >
            <VisibilityIcon />
          </IconButton>
        )}
      </Typography>
      {display && (
        <Box sx={{ p: 3 }}>
          <Divider />
          <Box
            sx={{
              display: "flex",
              gap: 1,
              pt: 2,
              opacity: 0.8,
              alignItems: "center",
            }}
          >
            <Avatar sx={{ width: 24, height: 24 }}>
              <Typography variant="caption">{name.slice(0, 1)}</Typography>
            </Avatar>
            <Typography variant="caption">{name}</Typography>
            <Typography variant="caption">
              {Math.ceil(Math.random() * 30)} minutes ago
            </Typography>
          </Box>
          <Box sx={{ pt: 2, pb: 1 }}>
            <Typography variant="body1">
              {body[Math.floor(Math.random() * body.length)]}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
              px: 4,
              py: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <ChatBubbleOutlineIcon />
              <Typography variant="caption">
                {Math.ceil(Math.random() * 30)}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <FavoriteBorderIcon />
              <Typography variant="caption">
                {Math.ceil(Math.random() * 300) / 10}k
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <MoreHorizIcon />
            </Box>
          </Box>
          <Divider />
        </Box>
      )}
    </Fragment>
  );
}
