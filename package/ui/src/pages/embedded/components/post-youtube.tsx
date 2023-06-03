import { Box } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useState } from "react";

export const YOUTUBE_REGEXPS = [
  new RegExp(/youtu\.be\/(.*?)(\s|$)/, "i"),
  new RegExp(/youtube\.com\/watch\?v=(.*?)(&|\s|$)/, "i"),
];

export function PostYoutube({ youtubeId }: { youtubeId: string }) {
  const [preview, setPreview] = useState(true);
  const [previewImageLoaded, setPreviewImageLoaded] = useState(false);

  return (
    <Box
      sx={{ position: "relative", cursor: "pointer" }}
      onClick={(event) => {
        event.stopPropagation();
        setPreview(false);
      }}
    >
      {preview ? (
        <>
          {previewImageLoaded && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100px",
                height: "100px",
                transform: "translate(-50%, -50%)",
                zIndex: 1,
                backdropFilter: "blur(5px)",
                borderRadius: "50%",
              }}
            >
              <PlayCircleOutlineIcon
                sx={{ height: "100px", width: "100px" }}
                color="secondary"
              />
            </Box>
          )}
          <img
            src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`}
            alt={`Youtube video id ${youtubeId}`}
            onLoad={() => setPreviewImageLoaded(true)}
            style={{ margin: "auto", display: "block" }}
          />
        </>
      ) : (
        <Box
          sx={{
            position: "relative",
            display: "block",
            margin: "auto",
            width: "100%",
            height: "250px",
          }}
        >
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            width="100%"
            height="100%"
            frameBorder="0"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
            title="YouTube video player"
          ></iframe>
        </Box>
      )}
    </Box>
  );
}
