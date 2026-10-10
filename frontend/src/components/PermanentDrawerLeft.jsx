import * as React from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Toolbar,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";

export const drawerWidth = 264;

const navItems = [
  {
    label: "Scan folders",
    description: "Read a directory",
    icon: <AddCircleOutlineIcon />,
    to: "/selectDirectoryForm",
  },
  {
    label: "Search database",
    description: "Filter saved names",
    icon: <SearchIcon />,
    to: "/searchTable",
  },
  {
    label: "Latest saved",
    description: "From this session",
    icon: <FolderOpenIcon />,
    to: "/saved-directories",
  },
];

export default function PermanentDrawerLeft() {
  return (
    <>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: 1,
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Box>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
              Directory Manager
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Backend-powered scan, save, and search
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: 1,
            borderColor: "rgba(18, 37, 28, 0.14)",
            bgcolor: "#12251c",
            color: "#f4f8f5",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Box>
            <Typography variant="overline" sx={{ color: "#9fd3ba", letterSpacing: 0 }}>
              Local library
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              Folder index
            </Typography>
          </Box>
        </Toolbar>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />

        <List sx={{ px: 1.5, py: 2 }}>
          {navItems.map((item) => (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.75 }}>
              <ListItemButton
                component={NavLink}
                to={item.to}
                sx={{
                  borderRadius: 2,
                  color: "rgba(244, 248, 245, 0.78)",
                  py: 1.2,
                  "& .MuiListItemIcon-root": {
                    color: "rgba(244, 248, 245, 0.68)",
                    minWidth: 38,
                  },
                  "&.active": {
                    bgcolor: "rgba(159, 211, 186, 0.16)",
                    color: "#ffffff",
                    "& .MuiListItemIcon-root": {
                      color: "#9fd3ba",
                    },
                  },
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(244, 248, 245, 0.56)" }}>
                    {item.description}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}
