import { Box, FormControlLabel } from "@mui/material";
import PropTypes from "prop-types";

import { styled } from "@mui/material/styles";
import Switch, { switchClasses } from "@mui/material/Switch";

const pxToRem = (px, oneRemPx = 17) => `${px / oneRemPx}rem`;

export const SwitchIOS = styled(Switch)(({ theme }) => {
  const spacing = 0;
  const size = pxToRem(25);
  const width = pxToRem(55 + 2 * spacing);
  const borderWidth = 2;
  const height = `calc(${size} + ${borderWidth * 2}px + ${pxToRem(2 * spacing)})`;
  return {
    width,
    height,
    padding: pxToRem(spacing),
    margin: 4,
    [`& .${switchClasses.switchBase}`]: {
      padding: borderWidth,
      top: pxToRem(spacing),
      left: pxToRem(spacing),
      [`&.${switchClasses.checked}`]: {
        color: "#3F51B5", // SeeChat blue color
        transform: `translateX(calc(${width} - ${size} - ${borderWidth * 2}px - ${pxToRem(2 * spacing)}))`,
        [`& + .${switchClasses.track}`]: {
          backgroundColor: "#C5CAE9", // light blue color for SeeChat
          opacity: 1,
          border: "none",
        },
      },
    },
    [`& .${switchClasses.thumb}`]: {
      width: size,
      height: size,
      boxShadow:
        "0 3px 8px 0 rgba(0,0,0,0.15), 0 1px 1px 0 rgba(0,0,0,0.16), 0 3px 1px 0 rgba(0,0,0,0.1)",
    },
    [`& .${switchClasses.track}`]: {
      borderRadius: 40,
      border: `solid ${(theme.vars || theme).palette.grey[300]}`,
      borderWidth,
      backgroundColor: (theme.vars || theme).palette.grey[50],
      opacity: 1,
      transition: theme.transitions.create(["background-color", "border"]),
    },
  };
});

const PrivateSwitch = ({ id, isPrivate, onChange }) => {
  const handleChange = async (event) => {
    onChange(event.target.checked);
  };

  return (
    <Box id={id} className="overflow-hidden pt-2">
      <FormControlLabel
        control={<SwitchIOS checked={isPrivate} onChange={handleChange} />}
        label={isPrivate ? "Private idea" : "Public idea"} // Conditional label based on switch state
        className="flex justify-between w-full"
        sx={{ margin: 0, padding: 0 }} // sx prop to remove margin and padding
      />
    </Box>
  );
};

PrivateSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  isPrivate: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PrivateSwitch;
