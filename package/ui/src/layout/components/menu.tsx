import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { Fragment } from "react";
import WebhookIcon from "@mui/icons-material/Webhook";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import RouteIcon from "@mui/icons-material/Route";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import LinkIcon from "@mui/icons-material/Link";

import { Link, useLocation } from "react-router-dom";

export default function Menu() {
  const location = useLocation();
  const currentPathname: string = location.pathname;

  const currentPathnameRoot: string | false =
    currentPathname.match(/^(\/[^/]*)/g)?.[0] || "/";

  return (
    <Fragment>
      <List
        sx={{ width: "100%", maxWidth: 360 }}
        component="nav"
        aria-labelledby="notification-type"
        subheader={<ListSubheader component="div">Notifications</ListSubheader>}
      >
        <List component="div" disablePadding>
          <ListItemButton
            component={Link}
            to={"/notifications/email"}
            selected={currentPathname === "/notifications/email"}
          >
            <ListItemIcon>
              <MarkEmailUnreadIcon />
            </ListItemIcon>
            <ListItemText primary="Email" />
          </ListItemButton>
          <span>
            <ListItemButton
              component={Link}
              to={"/notifications/webhooks"}
              selected={currentPathname === "/notifications/webhooks"}
            >
              <ListItemIcon>
                <WebhookIcon />
              </ListItemIcon>
              <ListItemText primary="Webhooks" />
            </ListItemButton>
          </span>
        </List>
      </List>
      <List
        sx={{ width: "100%", maxWidth: 360, mt: 4 }}
        component="nav"
        aria-labelledby="other"
        subheader={<ListSubheader component="div">Other</ListSubheader>}
      >
        <List component="div" disablePadding>
          <ListItemButton
            component={Link}
            to={"/faq"}
            selected={currentPathname === "/faq"}
          >
            <ListItemIcon>
              <LiveHelpIcon />
            </ListItemIcon>
            <ListItemText primary="FAQ" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to={"/roadmap"}
            selected={currentPathname === "/roadmap"}
          >
            <ListItemIcon>
              <RouteIcon />
            </ListItemIcon>
            <ListItemText primary="Roadmap" />
          </ListItemButton>
        </List>
      </List>
      <List
        sx={{ width: "100%", maxWidth: 360, mt: 4 }}
        component="nav"
        aria-labelledby="tutorials"
        subheader={<ListSubheader component="div">Tutorials</ListSubheader>}
      >
        <List component="div" disablePadding>
          <ListItemButton
            component={Link}
            to={"/tutorials/ifttt"}
            selected={currentPathname === "/tutorials/ifttt"}
          >
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <ListItemText primary="IFTTT Twitter" />
          </ListItemButton>
        </List>
      </List>
    </Fragment>
  );
}
