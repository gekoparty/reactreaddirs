import { Box, Stack, Typography } from "@mui/material";
import PermanentDrawerLeft, { drawerWidth } from "./PermanentDrawerLeft";

export default function PageLayout({
  title,
  eyebrow,
  subtitle,
  actions,
  children,
  maxWidth = 1180,
}) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7f3" }}>
      <PermanentDrawerLeft />
      <Box
        component="main"
        sx={{
          ml: { md: `${drawerWidth}px` },
          px: { xs: 2, md: 4 },
          pt: { xs: 10, md: 11 },
          pb: 5,
        }}
      >
        <Box sx={{ maxWidth, mx: "auto" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "flex-end" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              {eyebrow && (
                <Typography
                  variant="overline"
                  sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 0 }}
                >
                  {eyebrow}
                </Typography>
              )}
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#172033" }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions}
          </Stack>

          {children}
        </Box>
      </Box>
    </Box>
  );
}
