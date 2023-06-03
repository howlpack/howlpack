import { useSearchParams } from "react-router-dom";
import { PostYoutube } from "./post-youtube";

export type ImageType = "image" | "youtube";

export function encode(scheme: ImageType, uri: string): URL {
  switch (scheme) {
    case "youtube": {
      return new URL("youtube:" + uri);
    }
    case "image": {
      return new URL("image:" + uri);
    }
    default: {
      throw new Error("unknown image type");
    }
  }
}

export function decode(uri: string): { scheme: ImageType; uri: string } | null {
  try {
    const url = new URL(uri);
    switch (url.protocol) {
      case "youtube:": {
        return {
          scheme: "youtube",
          uri: url.pathname,
        };
      }
      case "image:": {
        return {
          scheme: "image",
          uri: url.toString().slice(6),
        };
      }
      default: {
        return null;
      }
    }
  } catch (e) {
    return null;
  }
}

export function PostImage({ image_uri }: { image_uri: string }) {
  const image = decode(image_uri);
  const [params] = useSearchParams();

  if (!image) {
    return null;
  }

  switch (image.scheme) {
    case "youtube": {
      return <PostYoutube youtubeId={image.uri} />;
    }
    case "image": {
      return params.get("allowImage") ? (
        <a
          href={image.uri}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          <img
            src={image.uri}
            style={{ margin: "auto", display: "block", maxHeight: "500px" }}
          />
        </a>
      ) : null;
    }
    default: {
      return null;
    }
  }
}
